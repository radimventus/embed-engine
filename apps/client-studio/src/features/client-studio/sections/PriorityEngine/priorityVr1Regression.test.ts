import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (name: string) => readFileSync(join(here, name), 'utf8');

test('VR1 projects three personal rows plus three distinct CONIS checks', () => {
  const output = read('PriorityFitAssessment.tsx');
  assert.match(output, /count >= 2/);
  assert.match(output, /\.slice\(0, 3\)/);
  assert.match(output, /\.\.\.personalResults, \.\.\.conisChecks/);
  assert.match(output, /\['plot', 'orientation'\]/);
  assert.match(output, /\['comfort', 'fresh-air'\]/);
  assert.match(output, /\['quality', 'execution-detail'\]/);
});

test('VR1 keeps three contextual canonical media explanations', () => {
  const output = read('PriorityFitAssessment.tsx');
  assert.match(output, /roomMedia\.gallery\.find/);
  assert.match(output, /\.slice\(0, 3\)/);
  assert.match(output, /media\.length === 3/);
  assert.match(output, /mediaExplanation\(entry\)/);
});

test('VR1 reuses exactly six relationship topics and their original dialog', () => {
  const output = read('PriorityFitAssessment.tsx');
  const relationships = read('PriorityRelationships.tsx');
  assert.match(output, /<PriorityRelationships[\s\S]*?limit=\{6\}/);
  assert.match(relationships, /\.slice\(0, limit\)/);
  assert.match(relationships, /<RelationshipDialog/);
  assert.match(relationships, /openDecisionTopicInChat/);
  assert.match(relationships, /priority-relationship-ask-conis/);
});

test('VR1 routes plot CTAs to original Audit states and question directly to Chat', () => {
  const conversation = read('usePriorityConversation.ts');
  const audit = read('../AuditLeadCapture/AuditLeadCapture.tsx');
  assert.match(conversation, /openAuditLandFlow\('owned'\)/);
  assert.match(conversation, /openAuditLandFlow\('seeking'\)/);
  const askConis = conversation.slice(
    conversation.indexOf('const askConis'),
    conversation.indexOf('const continueToNextChapter'),
  );
  assert.match(askConis, /focusAdvisorChat\(\)/);
  assert.doesNotMatch(askConis, /racio/i);
  assert.match(audit, /AUDIT_LAND_HANDOFF_EVENT/);
  assert.match(audit, /setLandOption\(value\)/);
});
