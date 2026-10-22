import { Actor, HttpAgent } from '@icp-sdk/core/agent';
const actors = new Map();
const sessionIDL = ({ IDL }) => IDL.Service({ checkServiceSession: IDL.Func([IDL.Text], [IDL.Opt(IDL.Principal)], ['query']) });
export async function sessionOwner(token, canister, lookup) {
  if (!/^[a-f0-9]{64}$/.test(token || '') || !canister) throw new Error('Sign in from Common Thread to continue.');
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token)))).map(b=>b.toString(16).padStart(2,'0')).join('');
  if (!lookup) {
    if (!actors.has(canister)) actors.set(canister, Actor.createActor(sessionIDL, { canisterId: canister, agent: new HttpAgent({ host: 'https://icp-api.io', verifyQuerySignatures: true, retryTimes: 0, fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(15000) }) }) }));
    lookup = value => actors.get(canister).checkServiceSession(value);
  }
  const result = await lookup(hash);
  if (result.length !== 1 || result[0].isAnonymous()) throw new Error('Your sign-in expired. Please sign in again.');
  return `icp:${result[0].toText()}`;
}
export const accountRoutes = ['/api/account', '/api/account/delete', '/api/account/export', '/api/topic/save', '/api/topic/list', '/api/topic/load', '/api/topic/delete', '/api/topic/connect', '/api/visitors', '/api/restore-beta'];
export async function accountDeleted(db,user) {
  if(!user.startsWith('icp:'))return false;
  return Boolean((await db.prepare('SELECT deleted_at FROM accounts WHERE owner=?').bind(user).all()).results[0]?.deleted_at);
}
export async function accountGeneration(db,user) {
  return (await db.prepare('SELECT first_seen FROM accounts WHERE owner=?').bind(user).all()).results[0]?.first_seen;
}
export async function relatedLearning(db,user,id) {
  if(!user.startsWith('icp:') || typeof id!=='string')return [];
  const current=(await db.prepare('SELECT data FROM topics WHERE owner=? AND id=?').bind(user,id).all()).results[0];
  if(!current || !JSON.parse(current.data).connect)return [];
  const rows=(await db.prepare('SELECT data FROM topics WHERE owner=? AND id<>? ORDER BY updated_at DESC LIMIT 80').bind(user,id).all()).results;
  return rows.map(r=>JSON.parse(r.data)).filter(t=>t.connect).slice(0,5).map(t=>({topic:t.topic,material:typeof t.material==='string'?t.material.slice(0,3000):''}));
}
const clean = (v, max) => { if (typeof v !== 'string' || v.length > max) throw new Error('This saved item is too long or invalid.'); return v; };
export function topicRecord(input) {
  if (!input || !/^[\w-]{1,80}$/.test(input.id) || !['topic','material'].includes(input.kind)) throw new Error('Invalid topic.');
  const title=clean(input.topic,500), material=input.kind==='material'?clean(input.material,100000):'';
  if (!title.trim() && !material.trim()) throw new Error('Add a topic or some material.');
  const history=Array.isArray(input.history)?input.history.slice(-40):[];
  if (JSON.stringify(history).length>60000) throw new Error('Topic history is too long.');
  return {id:input.id,kind:input.kind,topic:title,material,connect:input.connect===true,history,updatedAt:Date.now()};
}
export async function accountRequest(path, input, user, env, nativeOwner, version) {
  const db=env.DB;
  if(path==='/api/visitors') {
    if(!nativeOwner) return {status:403,data:{error:'Owner access required.'}};
    const summary=(await db.prepare('SELECT COUNT(*) AS players FROM accounts WHERE deleted_at=0').bind().all()).results[0];
    const visitors=(await db.prepare("SELECT email,first_seen,last_seen FROM accounts WHERE show_email=1 AND email<>'' ORDER BY last_seen DESC LIMIT 200").bind().all()).results;
    return {data:{summary,visitors:visitors.map(v=>({...v,emailVerified:false}))}};
  }
  if(path==='/api/restore-beta') return {status:403,data:{error:'Restore requires the original private beta account.'}};
  if(!user.startsWith('icp:')) return {status:403,data:{error:'Sign in to your game account first.'}};
  if(await accountDeleted(db,user) && !(path==='/api/account' && input.startFresh===true)) return {status:410,data:{error:'This account’s saved data was deleted. Choose Start fresh to use it again.',code:'account_deleted'}};
  if(path==='/api/account') {
    if(input.startFresh===true) await db.prepare('UPDATE accounts SET deleted_at=0,first_seen=?,last_seen=? WHERE owner=?').bind(Date.now(),Date.now(),user).run();
    const email=typeof input.email==='string'?input.email.trim():'';
    const consent=input.showEmail===true;
    if(consent && email && (email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) throw Error('Check your email address.');
    // Email is optional, user supplied, and not represented as Google-verified.
    if(input.update === true) await db.prepare(`INSERT INTO accounts (owner,email,show_email,first_seen,last_seen) VALUES (?,?,?,?,?) ON CONFLICT(owner) DO UPDATE SET email=excluded.email,show_email=excluded.show_email,last_seen=excluded.last_seen`).bind(user,consent?email:'',consent?1:0,Date.now(),Date.now()).run();
    else await db.prepare(`INSERT INTO accounts (owner,email,show_email,first_seen,last_seen) VALUES (?,?,?,?,?) ON CONFLICT(owner) DO UPDATE SET last_seen=excluded.last_seen`).bind(user,'',0,Date.now(),Date.now()).run();
    const account=(await db.prepare('SELECT email,show_email,first_seen FROM accounts WHERE owner=?').bind(user).all()).results[0];
    return {data:{saved:true,account}};
  }
  if(path==='/api/account/delete') {
    await db.batch([
      db.prepare('DELETE FROM stories WHERE owner=?').bind(user),
      db.prepare('DELETE FROM topics WHERE owner=?').bind(user),
      db.prepare("INSERT INTO accounts(owner,email,show_email,first_seen,last_seen,deleted_at) VALUES (?,'',0,0,0,?) ON CONFLICT(owner) DO UPDATE SET email='',show_email=0,first_seen=0,last_seen=0,deleted_at=excluded.deleted_at").bind(user,Date.now()),
    ]);
    return {data:{deleted:true}};
  }
  if(path==='/api/account/export') {
    const stories=(await db.prepare('SELECT data FROM stories WHERE owner=?').bind(user).all()).results.map(r=>JSON.parse(r.data));
    const topics=(await db.prepare("SELECT data FROM topics WHERE owner=? AND json_extract(data,'$.deleted') IS NOT 1").bind(user).all()).results.map(r=>JSON.parse(r.data));
    const account=(await db.prepare('SELECT email,show_email,first_seen,last_seen FROM accounts WHERE owner=?').bind(user).all()).results[0];
    return {data:{account,stories,topics}};
  }
  if(path==='/api/topic/save') {
    const t=topicRecord(input);
    const removed=(await db.prepare('SELECT data FROM topics WHERE owner=? AND id=?').bind(user,t.id).all()).results[0];
    if(removed && JSON.parse(removed.data).deleted)throw Error('This topic was removed. Choose New topic to save a new copy.');
    const result=await db.prepare(`INSERT INTO topics (owner,id,title,data,updated_at) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM accounts WHERE owner=? AND deleted_at=0 AND first_seen=?) AND ((SELECT COUNT(*) FROM topics WHERE owner=? AND json_extract(data,'$.deleted') IS NOT 1)<80 OR EXISTS(SELECT 1 FROM topics WHERE owner=? AND id=?)) ON CONFLICT(owner,id) DO UPDATE SET title=excluded.title,data=json_set(excluded.data,'$.connect',json(CASE WHEN json_extract(topics.data,'$.connect') THEN 'true' ELSE 'false' END)),updated_at=excluded.updated_at WHERE json_extract(topics.data,'$.deleted') IS NOT 1`).bind(user,t.id,t.topic||'My notes',JSON.stringify(t),t.updatedAt,user,Number(version),user,user,t.id).run();
    if(!result.meta.changes)throw Error('Your topic library is full. Export or remove an old topic first.');
    const saved=(await db.prepare('SELECT data FROM topics WHERE owner=? AND id=?').bind(user,t.id).all()).results[0];
    return {data:{topic:JSON.parse(saved.data)}};
  }
  if(path==='/api/topic/connect') {
    const now=Date.now();
    const result=await db.prepare("UPDATE topics SET data=json_set(data,'$.connect',json(?),'$.updatedAt',?),updated_at=? WHERE owner=? AND id=? AND json_extract(data,'$.deleted') IS NOT 1").bind(JSON.stringify(input.connect===true),now,now,user,clean(input.id,80)).run();
    return result.meta.changes?{data:{saved:true}}:{status:404,data:{error:'Topic not found.'}};
  }
  if(path==='/api/topic/list') return {data:{topics:(await db.prepare("SELECT id,title,updated_at FROM topics WHERE owner=? AND json_extract(data,'$.deleted') IS NOT 1 ORDER BY updated_at DESC LIMIT 80").bind(user).all()).results}};
  if(path==='/api/topic/load') {
    const row=(await db.prepare('SELECT data FROM topics WHERE owner=? AND id=?').bind(user,clean(input.id,80)).all()).results[0];
    return row && !JSON.parse(row.data).deleted?{data:{topic:JSON.parse(row.data)}}:{status:404,data:{error:'Topic not found.'}};
  }
  if(path==='/api/topic/delete') {await db.prepare("UPDATE topics SET title='',data=?,updated_at=? WHERE owner=? AND id=?").bind(JSON.stringify({deleted:true}),Date.now(),user,clean(input.id,80)).run();return {data:{deleted:true}};}
  return {status:404,data:{error:'Not found'}};
}
