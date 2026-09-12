import assert from 'node:assert/strict';
import test from 'node:test';
import { getCanonicalHouseRuntimeContext, selectCanonicalChatHouseKnowledge,
  selectCanonicalHouseKnowledge, canonicalHouseKnowledgeEntries, clientHouseFactText } from '@embed-engine/object-house';
import { faqItemsFromCanonicalHouseKnowledge } from './experiencePresentation';
import { createPromptBuilder, promptPackageToChatRequest } from '../../../../../../../packages/ai/src/prompt/PromptBuilder';

const decision = {headline: '', summary: '', focusPriority: '', secondaryPriority: '', selectedPriorities: [], recommendations: []};
const context = getCanonicalHouseRuntimeContext('modern-4kk')!;
const chat = selectCanonicalChatHouseKnowledge(context);
const editorial = /XLSX|CURRENT|schválená odpověď|odpověď schválená|původní zdroj|zdroj není|nevymýšlet citaci|interní poznámka|v této validaci|referenční validace|provenance|neprezentovat|nepřidávat neověřené|nevydávat za/i;
const priorities = ['plot','layout','privacy','energy','operating-costs','design','quality','investment','maintenance','flexibility'];
const questions = ['Má dům rekuperaci tepla z odpadní vody?', 'Jak se využívá teplo z odpadní vody?',
  'Jak je řešená energetika domu?', 'Jaká úsporná energetická řešení dům používá?', 'Je tam zpětné získávání tepla z vody?'];

test('all canonical client facts, serialized answers and Priority FAQ exclude editorial instructions', () => {
  assert.equal(context.knowledge.length, 568);
  for (const fact of context.knowledge) assert.doesNotMatch(clientHouseFactText(fact), editorial, fact.id);
  for (const entry of canonicalHouseKnowledgeEntries(chat)) assert.doesNotMatch(entry.text, editorial, entry.id);
  for (const priority of priorities) {
    for (const faq of faqItemsFromCanonicalHouseKnowledge(selectCanonicalHouseKnowledge(context, [priority]))) {
      assert.doesNotMatch(faq.answer, editorial, faq.id);
    }
  }
  const faq = faqItemsFromCanonicalHouseKnowledge(selectCanonicalHouseKnowledge(context, ['privacy']));
  const approved = context.knowledge.find(x => x.id === 'kb04-row-27')!;
  assert.equal(faq.find(x => x.question === approved.subject)!.answer, approved.statement);
  assert.match(approved.source.editorialNotes!.join(' '), /XLSX/);
  assert.ok(approved.constraints.some(x => /Nevymýšlet citaci/.test(x)));
});

test('all five queries deliver source-backed wastewater recovery through the model request', () => {
  const atom = context.knowledge.find(x => x.id === 'kb04-row-371')!;
  assert.match(atom.statement, /Akiretherm/);
  for (const question of questions) {
    const entries = canonicalHouseKnowledgeEntries(chat, question);
    assert.ok(entries.some(x => /Akiretherm/.test(x.text)), question);
    assert.ok(entries.length <= 12);
    assert.ok(JSON.stringify(entries).length <= 14050);
    for (const entry of entries) {
      const fact = chat.facts.find(x => x.id === entry.id)!;
      assert.ok(fact);
      assert.ok(entry.text.includes(clientHouseFactText(fact)));
      assert.deepEqual(entry.provenance, fact.source);
      for (const constraint of [...fact.constraints, ...(fact.unsupportedConclusions ?? [])]) {
        assert.ok(entry.modelConstraints?.includes(constraint));
      }
      assert.doesNotMatch(entry.text, editorial);
    }
    const request = promptPackageToChatRequest('kb-test', createPromptBuilder().build({
      decision, sessionId: 'kb-regression', currentUserMessage: question,
      object: {objectId: context.identity.houseId, knowledge: {entries}},
    }));
    const modelText = request.systemPrompt.content;
    assert.match(modelText, /Akiretherm/);
    assert.doesNotMatch(modelText, /XLSX|původní zdroj|Odpověď schválená/);
    assert.match(modelText, /Internal provenance \(not a client citation\)/);
    if (questions.indexOf(question) === 2 || questions.indexOf(question) === 3) assert.match(modelText, /Zehnder/);
  }
});

test('house isolation and Priority independence survive search annotations', () => {
  const foreign = {...context.knowledge.find(x => x.id === 'kb04-row-371')!, id: 'foreign', houseId: 'other-house'};
  const contaminated = {...context, knowledge: [...context.knowledge, foreign]};
  assert.ok(!selectCanonicalChatHouseKnowledge(contaminated).facts.some(x => x.id === 'foreign'));
  for (const priority of [[], ...priorities.map(x => [x])]) {
    selectCanonicalHouseKnowledge(context, priority);
    assert.deepEqual(canonicalHouseKnowledgeEntries(selectCanonicalChatHouseKnowledge(context), questions[0]),
      canonicalHouseKnowledgeEntries(chat, questions[0]));
    assert.ok(!selectCanonicalHouseKnowledge(contaminated, priority).facts.some(x => x.id === 'foreign'));
  }
  assert.equal(getCanonicalHouseRuntimeContext('other-house'), null);
});

test('unsupported conclusions reach the model separately from factual text', () => {
  const fact = {...chat.facts[0]!, unsupportedConclusions: ['Nepředpokládat garantovanou cenu ani garantovanou úsporu.']};
  const entries = canonicalHouseKnowledgeEntries({...chat, facts: [fact]}, fact.subject);
  assert.ok(entries[0]!.modelConstraints!.includes(fact.unsupportedConclusions[0]!));
  assert.ok(!entries[0]!.text.includes(fact.unsupportedConclusions[0]!));
  const request = promptPackageToChatRequest('kb-test', createPromptBuilder().build({decision, sessionId: 'constraints',
    currentUserMessage: fact.subject, object: {objectId: fact.houseId, knowledge: {entries}}}));
  assert.match(request.systemPrompt.content, /Nepředpokládat garantovanou cenu/);
});
