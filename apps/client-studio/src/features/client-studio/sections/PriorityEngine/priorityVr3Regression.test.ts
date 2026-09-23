import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (name: string) => readFileSync(new URL(name, import.meta.url), 'utf8');

test('VR4 keeps priority intensity internal and preserves every answer selection', () => {
  const output = read('PriorityFitAssessment.tsx');
  assert.match(output, /tags\.map\(\(tag\)/);
  assert.doesNotMatch(output, /PRO VÁS \{tag\.percent\} %/);
  assert.match(output, /data-result-source="priority"/);
  assert.match(output, /data-result-source="answer"/);
  assert.match(output, /answerRows\.map/);
  assert.doesNotMatch(output, /Pro tuto prioritu zatím chybí konkrétní odpověď klienta/);
  assert.match(output, /BUNGALOV_4KK_PRIORITY_LEVEL_FIT_CONTRACT/);
});

test('VR3 visual insights are eligible, concrete, exactly three, and retain zoom', () => {
  const output = read('PriorityFitAssessment.tsx');
  assert.match(output, /VISUAL_ANSWER_IDS/);
  assert.match(output, /\.slice\(0, 3\)/);
  assert.match(output, /media\.length === 3/);
  assert.match(output, /Všimněte si/);
  assert.match(output, /SpatialZoomControl/);
  assert.doesNotMatch(output, /'durability-warranty'/);
});

test('VR3 uses six unique Priority V2 topics rather than legacy fallback', () => {
  const output = read('PriorityFitAssessment.tsx');
  const relationships = read('PriorityRelationships.tsx');
  assert.match(output, /limit=\{6\}/);
  assert.match(output, /priorityV2/);
  for (const id of ['materials-technology', 'customization', 'smart-control', 'build-speed', 'fresh-air', 'access-parking']) {
    assert.match(relationships, new RegExp(`'${id}'`));
  }
  assert.match(relationships, /outputId: `priority-v2:/);
  assert.match(relationships, /entry\.evidenceFactIds\.includes/);
});

test('VR3 retains grounded popup, Chat and land handoffs', () => {
  const relationships = read('PriorityRelationships.tsx');
  const output = read('PriorityFitAssessment.tsx');
  assert.match(relationships, /evidenceBoundNarrative\(bundle\)/);
  assert.match(relationships, /Zeptat se CONIS/);
  assert.match(output, /onClick=\{continueWithPlotCheck\}/);
  assert.match(output, /onClick=\{continueWithPlotFind\}/);
  assert.match(output, /onClick=\{askConis\}/);
});
