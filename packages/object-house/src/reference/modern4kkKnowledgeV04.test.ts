import assert from 'node:assert/strict';
import test from 'node:test';
import { KNOWLEDGE_V04, FAQ_V04 } from './modern4kkKnowledgeV04';
import { getCanonicalHouseRuntimeContext } from '../runtime-context/canonicalHouseRuntimeContext';
import { canonicalHouseKnowledgeEntries, selectCanonicalChatHouseKnowledge } from '../runtime-context/selectCanonicalHouseKnowledge';

const context = getCanonicalHouseRuntimeContext('modern-4kk')!;
const selection = selectCanonicalChatHouseKnowledge(context);

test('XLSX04 has approved answers only, unique provenance and corrected areas', () => {
  assert.equal(KNOWLEDGE_V04.length,540);
  assert.equal(new Set(KNOWLEDGE_V04.map(x=>x.id)).size,540);
  assert.ok(KNOWLEDGE_V04.every(x=>x.statement.trim() && x.source.label?.includes('List 1')));
  assert.equal(context.specification.dimensions?.usableAreaM2,112.9);
  assert.equal(context.specification.dimensions?.builtUpAreaM2,129);
  assert.equal(context.specification.energy?.energyClass,'A');
  assert.ok(!selection.facts.some(x=>x.id==='dse-information-gaps'));
  assert.equal(FAQ_V04.length,100);
  for (const faq of FAQ_V04) {
    const source = KNOWLEDGE_V04.find(x=>x.id===faq.knowledgeAtomIds[0]);
    assert.equal(faq.answer,source?.statement);
  }
});

test('every approved question can retrieve its answer without sending the entire workbook', () => {
  for(const fact of KNOWLEDGE_V04) {
    const entries=canonicalHouseKnowledgeEntries(selection,fact.subject);
    // Duplicate questions/answers can legitimately select the other source row.
    assert.ok(entries.some(x=>x.id===fact.id || x.text.includes(fact.statement)),fact.subject);
    assert.ok(entries.length<=12);
    assert.ok(entries.reduce((n,x)=>n+x.text.length,0)<=14000);
  }
});

test('paraphrased buyer questions retrieve useful facts, including technical reference evidence', () => {
  const cases: readonly [string, RegExp][] = [
    ['Kolik má dům metrů čtverečních užitné a zastavěné plochy?',/112,9/],
    ['Jak velkou parcelu potřebuji?',/13[\s\S]*26|16[\s\S]*29/],
    ['Vejdeme se sem se třemi dětmi a potřebujeme pracovnu?',/třemi dětmi/],
    ['Čím se topí a jde i chladit?',/Zehnder/],
    ['Jakou má dům požární odolnost?',/REI 45/],
    ['Jakou má energetickou třídu?',/třídy A/],
    ['Kde budu skladovat věci?',/úlož|Úlož|šatn|podkroví/],
  ];
  for(const [question, expected] of cases) {
    assert.match(canonicalHouseKnowledgeEntries(selection,question).map(x=>x.text).join('\n'),expected,question);
  }
});

test('reference technical values do not become facts of an unrelated authored house', () => {
  const other = {...context, specification:{...context.specification,
    identity:{...context.specification.identity,role:'authored' as const}}};
  assert.ok(!selectCanonicalChatHouseKnowledge(other).facts.some(x=>x.scope==='REFERENCE_PROJECT'));
  const fire=canonicalHouseKnowledgeEntries(selection,'Jakou má dům požární odolnost?');
  assert.ok(fire.some(x=>x.text.includes('REI 45') && /referenční realizac[ei]/.test(x.text)));
});
