import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { consumeAuditLandFlow, openAuditLandFlow } from '../AuditLeadCapture/auditLandHandoff';

const here = dirname(fileURLToPath(import.meta.url));
const read = (name: string) => readFileSync(join(here, name), 'utf8');

test('VR2 renders every selected Priority and every multi-select answer without TOP-3 truncation', () => {
  const output = read('PriorityFitAssessment.tsx');
  assert.match(output, /tags\.flatMap\(\(tag\)/);
  assert.match(output, /derivePriorityResult\([\s\S]*?tag\.percent,[\s\S]*?selected/);
  assert.match(output, /\.\.\.selected/);
  const resultProjection = output.slice(output.indexOf('const resultRows'), output.indexOf('const media'));
  assert.doesNotMatch(resultProjection, /slice\(0, 3\)/);
  assert.match(output, /rowKind: 'priority'/);
  assert.match(output, /rowKind: 'answer'/);
});

test('VR2 renders contextual copy under all three canonical images and reuses TOUR zoom', () => {
  const output = read('PriorityFitAssessment.tsx');
  assert.match(output, /roomMedia\.gallery\.find/);
  assert.match(output, /media\.length === 3/);
  assert.match(output, /data-testid="priority-context-copy"/);
  assert.match(output, /\{mediaExplanation\(entry\)\}/);
  assert.match(output, /<SpatialZoomControl/);
  assert.match(output, /<MediaLightbox/);
  assert.match(output, /w-\[80%\]/);
});

test('VR2 places six existing Decision topics before synthesis and guarantees grounded detail', () => {
  const output = read('PriorityFitAssessment.tsx');
  const relationships = read('PriorityRelationships.tsx');
  const topics = output.indexOf('data-testid="priority-additional-topics"');
  const synthesis = output.indexOf('Celkový obraz');
  assert.ok(topics > 0 && topics < synthesis);
  assert.match(output, /<PriorityRelationships[\s\S]*?limit=\{6\}/);
  assert.match(relationships, /\.slice\(0, limit\)/);
  assert.match(relationships, /evidenceBoundNarrative\(bundle\)/);
  assert.match(relationships, /priority-relationship-ask-conis/);
  assert.match(relationships, /openDecisionTopicInChat/);
  assert.match(relationships, /navigateToJourneySection\(PILOT_SECTION_IDS\.aiAdvisor\)/);
});

test('VR2 preserves the selected Audit brochure state across scene mounting', () => {
  Object.defineProperty(globalThis, 'window', { configurable: true, value: new EventTarget() });
  openAuditLandFlow('owned');
  assert.equal(consumeAuditLandFlow(), 'owned');
  openAuditLandFlow('seeking');
  assert.equal(consumeAuditLandFlow(), 'seeking');
  const audit = read('../AuditLeadCapture/AuditLeadCapture.tsx');
  assert.match(audit, /consumeAuditLandFlow\(\) \?\? 'owned'/);
  assert.match(audit, /<SituationSelect/);
  assert.match(audit, /<AssessmentWorkflow landOption=\{landOption\}/);
});

test('VR2 routes plot choices through journey reveal and question to Chat, never RACIO', () => {
  const conversation = read('usePriorityConversation.ts');
  assert.match(conversation, /openAuditLandFlow\('owned'\)[\s\S]*navigateToJourneySection\(PILOT_SECTION_IDS\.audit\)/);
  assert.match(conversation, /openAuditLandFlow\('seeking'\)[\s\S]*navigateToJourneySection\(PILOT_SECTION_IDS\.audit\)/);
  const askConis = conversation.slice(conversation.indexOf('const askConis'), conversation.indexOf('const continueToNextChapter'));
  assert.match(askConis, /focusAdvisorChat\(\)/);
  assert.doesNotMatch(askConis, /racio/i);
});
