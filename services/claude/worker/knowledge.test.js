import test from 'node:test';
import assert from 'node:assert/strict';
import { knowledgePacks, knowledgeBoard, packVariants } from '../shared/knowledge.js';
import worker, { validateBrief, claudeRequest, parseClaudeResponse, reviewPersonalPuzzle } from './index.js';
const response = selections => ({ stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify({selections}) }] });
const briefFor = id => validateBrief({purpose:'study',topic:id,notes:'',interests:'',difficulty:'balanced',familiarity:'new',knowledgePack:id});

test('all six starter boards have sixteen unique terms, bounded explanations and exact wordplay', () => {
  assert.equal(knowledgePacks.length, 6);
  const rules = new Set();
  for (const p of knowledgePacks) {
    const board = knowledgeBoard(p.id);
    assert.equal(new Set(board.groups.flatMap(g => g.words)).size,16);
    assert.ok(board.groups.some(g=>g.rule !== 'literal'));
    assert.ok(p.sources.every(s=>s.url.startsWith('https://')));
    for (const variant of packVariants(p.id)) {
      rules.add(variant.rule);
      assert.equal(variant.words.length,4);
      assert.ok(variant.words.every(w=>w.length<=24));
      assert.ok(variant.category.length<=60 && variant.explanation.length<=350 && variant.clue.length<=180);
      // Exercise every reviewed rule even when it is not on the starter board.
      const choices = [variant.id, ...p.groups.filter(g=>g.id!==variant.id).map(g=>g.id)].slice(0,4);
      if (!(p.id==='presidents' && choices.includes('rushmore') && choices.includes('early'))) knowledgeBoard(p.id,choices);
    }
  }
  for (const rule of ['fill-blank','drop-first','anagram','first-word','last-word']) assert.ok(rules.has(rule));
  assert.throws(()=>knowledgeBoard('presidents',['rushmore','early','white','bill']), /same people/);
});
test('AI can only choose complete reviewed connections, never invent facts or four literal leftovers', () => {
  const brief = briefFor('general');
  const text = parseClaudeResponse(response(['instruments','shapes','house','animals-drop']),brief);
  const board = JSON.parse(text);
  assert.deepEqual(board.groups[3].words,['EAR','OAR','INK','OX']);
  assert.deepEqual(board.groups[3].sourceWords,['BEAR','BOAR','MINK','FOX']);
  assert.throws(()=>parseClaudeResponse(response(['instruments','shapes','house','invented']),brief),/unreviewed/);
  assert.throws(()=>parseClaudeResponse({stop_reason:'end_turn',content:[{type:'text',text:'{}'}]},brief),/incomplete/);
  assert.throws(()=>parseClaudeResponse(response(['house','house','shapes','instruments']),brief),/different/);
  assert.throws(()=>parseClaudeResponse({...response(['house']),stop_reason:'max_tokens'},brief),/finish/);
  assert.throws(()=>parseClaudeResponse(response(['africa','europe','features','boats']),briefFor('rivers')),/mix knowledge/);
});
test('pack inputs cannot attach personal stories, unknown packs, or unbounded history', () => {
  const raw = {purpose:'study',topic:'World',notes:'',interests:'',difficulty:'balanced',familiarity:'new',knowledgePack:'world'};
  assert.throws(()=>validateBrief({...raw,notes:'private memories'}),/personal stories/);
  assert.throws(()=>validateBrief({...raw,story:{id:'secret'}}),/personal stories/);
  assert.throws(()=>validateBrief({...raw,knowledgePack:'unknown'}),/available/);
  assert.throws(()=>validateBrief({...raw,knowledgeBoards:Array(41).fill(['land','islands','ranges','capitals'])}),/history/);
  const req=claudeRequest(validateBrief({...raw,knowledgeHistory:['land']}));
  assert.match(req.messages[0].content,/recentlyPlayed/);
  assert.match(req.messages[0].content,/land/);
  assert.ok(!req.messages[0].content.includes('storyAnswers'));
});
test('production knowledge route performs independent review, rejects failed audits and never retries', async t => {
  const calls=[];
  t.mock.method(globalThis,'fetch',async (_url,options) => {
    calls.push(JSON.parse(options.body));
    return Response.json(calls.length%2 ? response(['capitals','islands','ranges','land']) : {stop_reason:'end_turn',content:[{type:'text',text:JSON.stringify({fair:false,issue:'overlap',reason:'test conflict'})}]});
  });
  const req=new Request('https://service.example/api/puzzle',{method:'POST',headers:{Origin:'https://service.example','Content-Type':'application/json','oai-authenticated-user-id':'test-owner'},body:JSON.stringify(briefFor('world'))});
  const result=await worker.fetch(req,{ANTHROPIC_API_KEY:'test-key',DB:{}});
  assert.equal(result.status,422);
  assert.equal(calls.length,2);
  assert.match(calls[1].system,/independently audit/);
  assert.ok(!(await result.text()).includes('PARIS'));
});
test('knowledge audit accepts a checked board and preserves exact catalog words', async t => {
  let count=0;
  t.mock.method(globalThis,'fetch',async()=>{count++;return Response.json({stop_reason:'end_turn',content:[{type:'text',text:'{"fair":true,"issue":"none","reason":""}'}]});});
  const board=JSON.stringify(knowledgeBoard('general'));
  assert.equal(await reviewPersonalPuzzle(board,briefFor('general'),'test-key'),board);
  assert.equal(count,1);
});
