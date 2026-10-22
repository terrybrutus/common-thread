import test from 'node:test';import assert from 'node:assert/strict';import {DatabaseSync} from 'node:sqlite';import {readFileSync,readdirSync} from 'node:fs';import {Principal} from '@icp-sdk/core/principal';
import {sessionOwner,accountRequest,accountDeleted,accountGeneration,relatedLearning,topicRecord} from './accounts.js';import worker,{saveStory} from './index.js';
function database(){const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));return{sqlite,prepare(sql){const make=(args=[])=>({bind(...v){return make(v)},async all(){return{results:sqlite.prepare(sql).all(...args)}},async run(){return{meta:sqlite.prepare(sql).run(...args)}},raw(){return sqlite.prepare(sql).run(...args)}});return make()},async batch(statements){sqlite.exec('BEGIN');try{const rows=statements.map(s=>s.raw());sqlite.exec('COMMIT');return rows}catch(e){sqlite.exec('ROLLBACK');throw e}}};}
const topic=(id,title,connect=false,material='')=>({id,kind:material?'material':'topic',topic:title,material,connect,history:[]});
const invoke=async(db,user,path,input={},native=false)=>{
 if(user.startsWith('icp:') && !(await accountGeneration(db,user))) {
  const exists=db.sqlite.prepare('SELECT owner FROM accounts WHERE owner=?').get(user);
  if(!exists) await accountRequest('/api/account',{},user,{DB:db},false);
 }
 return accountRequest(path,input,user,{DB:db},native,await accountGeneration(db,user));
};

test('the gateway uses a hashed capability and verified caller, never a supplied email or account ID',async()=>{
 const secret='ab'.repeat(32);let received;
 const principal=Principal.selfAuthenticating(new Uint8Array([1,2,3]));
 const owner=await sessionOwner(secret,'fixed-canister',async hash=>{received=hash;return[principal]});
 assert.equal(owner,'icp:'+principal.toText());assert.match(received,/^[a-f0-9]{64}$/);assert.notEqual(received,secret);
 await assert.rejects(sessionOwner('owner@example.com','fixed-canister',()=>{throw Error('must not query')}),/Sign in/);
 await assert.rejects(sessionOwner(secret,'fixed-canister',async()=>[]),/expired/);
 await assert.rejects(sessionOwner(secret,'fixed-canister',async()=>[Principal.anonymous()]),/expired/);
});

test('topics and exports are isolated even when two users choose identical IDs',async()=>{
 const db=database();await invoke(db,'icp:alice','/api/topic/save',{...topic('same','The Knicks'),owner:'icp:bob'});await invoke(db,'icp:bob','/api/topic/save',topic('same','PRIVATE OTHER TOPIC'));
 assert.equal((await invoke(db,'icp:alice','/api/topic/load',{id:'same'})).data.topic.topic,'The Knicks');
 assert.equal((await invoke(db,'icp:alice','/api/account/export')).data.topics.length,1);
 assert.ok(!JSON.stringify(await invoke(db,'icp:alice','/api/account/export')).includes('PRIVATE OTHER'));
 await invoke(db,'icp:alice','/api/topic/delete',{id:'same'});assert.equal((await invoke(db,'icp:bob','/api/topic/load',{id:'same'})).data.topic.topic,'PRIVATE OTHER TOPIC');
 assert.equal(topicRecord({...topic('subject','Subject',true,'HIDDEN DRAFT'),kind:'topic'}).material,'');
});

test('connected learning requires both opt-ins and never reads personal story records or another user',async()=>{
 const db=database();
 for(const t of [topic('knicks','The Knicks',true),topic('city','New York City',true),topic('private','PRIVATE STUDY',false)])await invoke(db,'icp:alice','/api/topic/save',t);
 await invoke(db,'icp:bob','/api/topic/save',topic('other','OTHER USER',true));
 db.sqlite.prepare('INSERT INTO stories VALUES (?,?,?,?,?)').run('icp:alice','personal','Our story',JSON.stringify({secret:'PERSONAL MEMORY'}),1);
 assert.deepEqual((await relatedLearning(db,'icp:alice','knicks')).map(t=>t.topic),['New York City']);
 await invoke(db,'icp:alice','/api/topic/connect',{id:'knicks',connect:false});await invoke(db,'icp:alice','/api/topic/save',topic('knicks','The Knicks',true));assert.deepEqual(await relatedLearning(db,'icp:alice','knicks'),[]);
});

test('email is opt-in, withdrawal clears it, visitor export is owner-only and has no story content',async()=>{
 const db=database();await invoke(db,'icp:alice','/api/account');
 assert.equal((await invoke(db,'icp:alice','/api/visitors')).status,403);
 assert.equal((await invoke(db,'owner','/api/visitors',{},true)).data.visitors.length,0);
 await invoke(db,'icp:alice','/api/account',{update:true,showEmail:true,email:'alice@example.com'});
 assert.equal((await invoke(db,'owner','/api/visitors',{},true)).data.visitors[0].email,'alice@example.com');
 await invoke(db,'icp:alice','/api/account');assert.equal((await invoke(db,'owner','/api/visitors',{},true)).data.visitors.length,1);
 await invoke(db,'icp:alice','/api/account',{update:true,showEmail:false,email:'alice@example.com'});
 assert.equal((await invoke(db,'owner','/api/visitors',{},true)).data.visitors.length,0);
 assert.equal(db.sqlite.prepare('SELECT email FROM accounts').get().email,'');
});

test('deletion prevents an old device autosaving data back until the player explicitly starts fresh',async()=>{
 const db=database();await invoke(db,'icp:alice','/api/account',{update:true,showEmail:true,email:'alice@example.com'});await invoke(db,'icp:alice','/api/topic/save',topic('one','Old material'));
 await invoke(db,'icp:bob','/api/topic/save',topic('one','Keep mine'));
 await invoke(db,'icp:alice','/api/account/delete');assert.equal(await accountDeleted(db,'icp:alice'),true);
 assert.equal((await invoke(db,'icp:alice','/api/topic/save',topic('one','Stale copy'))).status,410);
 assert.equal((await invoke(db,'icp:alice','/api/account')).status,410);
 assert.equal((await invoke(db,'icp:bob','/api/topic/load',{id:'one'})).data.topic.topic,'Keep mine');
 await invoke(db,'icp:alice','/api/account',{startFresh:true});assert.equal(await accountDeleted(db,'icp:alice'),false);
 assert.equal((await invoke(db,'icp:alice','/api/account/export')).data.topics.length,0);
});

test('a public gateway still rejects unauthenticated visitors, bad capabilities and unrelated origins before storage or AI',async()=>{
 const env={LEGACY_OWNER_ID:'owner',ICP_BACKEND_CANISTER_ID:'hfamq-maaaa-aaaac-bcpbq-cai',GAME_ORIGINS:'https://game.example',DB:{prepare(){throw Error('must not read data')}}};
 for(const headers of [{},{'oai-authenticated-user-id':'other'},{Authorization:'Bearer forged'}]){
  const r=await worker.fetch(new Request('https://service.example/api/story/load',{method:'POST',headers:{Origin:'https://game.example','Content-Type':'application/json',...headers},body:'{}'}),env);assert.equal(r.status,401);
 }
 const blocked=await worker.fetch(new Request('https://service.example/api/account',{method:'OPTIONS',headers:{Origin:'https://evil.example'}}),env);assert.equal(blocked.status,403);
 const allowed=await worker.fetch(new Request('https://service.example/api/account',{method:'OPTIONS',headers:{Origin:'https://game.example'}}),env);assert.equal(allowed.headers.get('Access-Control-Allow-Origin'),'https://game.example');
});

test('old recovery data is never seeded into a newly signed-in account',async()=>{
 const db=database();const r=await worker.fetch(new Request('https://service.example/api/story/load',{method:'POST',headers:{Origin:'https://service.example','Content-Type':'application/json','oai-authenticated-user-id':'new-user'},body:'{}'}),{DB:db,RECOVERED_STORY_JSON:JSON.stringify({id:'private-owner-story',name:'Owner',brief:{storyAnswers:['OWNER PRIVATE MEMORY']},updatedAt:1})});
 assert.deepEqual((await r.json()).profiles,[]);assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM stories').get().n,0);
});

test('removing a topic erases its text and rejects stale device autosaves',async()=>{const db=database();await invoke(db,'icp:alice','/api/topic/save',topic('old','PRIVATE TOPIC',true));await invoke(db,'icp:alice','/api/topic/delete',{id:'old'});assert.equal((await invoke(db,'icp:alice','/api/topic/load',{id:'old'})).status,404);assert.deepEqual((await invoke(db,'icp:alice','/api/topic/list')).data.topics,[]);assert.ok(!JSON.stringify(db.sqlite.prepare('SELECT * FROM topics').all()).includes('PRIVATE TOPIC'));await assert.rejects(invoke(db,'icp:alice','/api/topic/save',topic('old','STALE COPY')),/removed/);});
test('starting fresh changes the account generation used to fence off old devices',async()=>{const db=database();await invoke(db,'icp:alice','/api/account');const old=await accountGeneration(db,'icp:alice');await invoke(db,'icp:alice','/api/account/delete');assert.equal(await accountGeneration(db,'icp:alice'),0);await new Promise(r=>setTimeout(r,2));await invoke(db,'icp:alice','/api/account',{startFresh:true});assert.notEqual(await accountGeneration(db,'icp:alice'),old);});

test('a generation already in flight cannot restore story or topic text after account reset',async()=>{
 const db=database();await invoke(db,'icp:alice','/api/account');const version=await accountGeneration(db,'icp:alice');
 const story={id:'old',name:'Our story',updatedAt:10,brief:{storyAnswers:['PRIVATE MEMORY']}};
 await saveStory(db,'icp:alice',story,version);await invoke(db,'icp:alice','/api/account/delete');await new Promise(r=>setTimeout(r,2));await invoke(db,'icp:alice','/api/account',{startFresh:true});
 await assert.rejects(saveStory(db,'icp:alice',story,version));
 await assert.rejects(accountRequest('/api/topic/save',topic('stale','PRIVATE OLD TOPIC'),'icp:alice',{DB:db},false,version));
 const exported=(await invoke(db,'icp:alice','/api/account/export')).data;assert.deepEqual(exported.stories,[]);assert.deepEqual(exported.topics,[]);
});
