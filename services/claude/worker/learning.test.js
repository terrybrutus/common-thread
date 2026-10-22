import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { validateBrief, claudeRequest, parseClaudeResponse } from './index.js';
import { packById } from '../shared/knowledge.js';
const reply = data => ({ stop_reason:'end_turn',content:[{type:'text',text:JSON.stringify(data)}] });
const input = (mode='topic', notes='') => ({purpose:'study',learningMode:mode,topic:'Oceans',notes});
function fixture() {
  const groups=packById('science').groups.filter(g=>['rocky','units','matter','gases'].includes(g.id)).map(g=>({...g,operation:'literal',fixedText:'',kind:'themed',entries:g.words.map(source=>({tile:source,source,evidence:source}))}));
  const notes=groups.map(g=>g.category+': '+g.words.join(', ')+'. '+g.explanation).join('\n');
  return {data:{question:'',puzzle:{title:'Science connections',topic:'Science',description:'Find four connections.',groups}},brief:validateBrief({...input('material',notes),topic:'Science'})};
}
test('custom subjects are not limited to the starter catalog and cannot carry personal story data',()=>{
  const b=validateBrief({...input(),topic:'Shakespeare and the 1970s'});
  const request=claudeRequest(b);
  assert.match(request.messages[0].content,/Shakespeare and the 1970s/);
  assert.match(request.system,/MATERIAL MODE/);
  assert.ok(request.output_config.format.schema.properties.puzzle.anyOf[1].properties.groups.items.properties.operation.enum.includes('drop-first'));
  assert.throws(()=>validateBrief({...input(),topic:''}),/subject/);
  assert.throws(()=>validateBrief({...input(),story:{id:'private'}}),/Choose/);
  assert.throws(()=>validateBrief({...input('material','short')}),/little more/);
  assert.equal(validateBrief(input('material','x'.repeat(90000))).notes.length,90000);
  assert.throws(()=>validateBrief(input('material','x'.repeat(100001))),/100,000/);
});
test('material answers need exact source excerpts, and parsed boards never expose those excerpts',()=>{
  const {data,brief}=fixture();
  const parsed=JSON.parse(parseClaudeResponse(reply(data),brief));
  assert.equal(parsed.groups.length,4);
  assert.ok(!JSON.stringify(parsed).includes('evidence'));
  data.puzzle.groups[0].entries[0]={tile:'INVENTED',source:'INVENTED',evidence:'INVENTED'};
  assert.throws(()=>parseClaudeResponse(reply(data),brief),/wasn't supported/);
});
test('new learning wordplay validates exact letter removal and anagrams and retains full sources',()=>{
  for(const operation of ['drop-first','anagram']){
    const {data,brief}=fixture();
    const sources=operation==='drop-first'?['BEAR','BOAR','MINK','FOX']:['BEAR','SEAL','LION','WOLF'];
    const tiles=operation==='drop-first'?['EAR','OAR','INK','OX']:['BARE','SALE','LOIN','FLOW'];
    data.puzzle.groups[3]={category:'Animals, transformed',clue:'Look at the letters',explanation:'Find the original animal names.',operation,kind:'themed',fixedText:'',entries:sources.map((source,i)=>({tile:tiles[i],source,evidence:source}))};
    brief.notes+='\nAnimals: '+sources.join(', ');
    const parsed=JSON.parse(parseClaudeResponse(reply(data),brief));
    assert.deepEqual(parsed.groups[3].sourceWords,sources);
    data.puzzle.groups[3].entries[0].tile='WRONG';
    assert.throws(()=>parseClaudeResponse(reply(data),brief),/letter-removal|anagram/);
  }
});
test('custom learning always passes through the independent audit and never saves personal stories or retries', async t=>{
  const {data,brief}=fixture();let calls=0;
  t.mock.method(globalThis,'fetch',async(_url,options)=>{
    calls++;const body=JSON.parse(options.body);
    if(calls===1){assert.match(body.system,/ONLY supplied material/);return Response.json(reply(data));}
    assert.match(body.system,/Independently edit/);
    return Response.json(reply({fair:false,issue:'unsupported',reason:'a relationship was unsupported'}));
  });
  const r=await worker.fetch(new Request('https://service.example/api/puzzle',{method:'POST',headers:{Origin:'https://service.example','Content-Type':'application/json','oai-authenticated-user-id':'owner'},body:JSON.stringify(brief)}),{ANTHROPIC_API_KEY:'test',DB:{prepare(){throw Error('should not save a story')}}});
  assert.equal(r.status,422);assert.equal(calls,2);
  assert.match((await r.json()).error,/accuracy and connection check/);
});
