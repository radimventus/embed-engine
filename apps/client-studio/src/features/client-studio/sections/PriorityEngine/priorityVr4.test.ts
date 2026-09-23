import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { MODERN_4KK_KNOWLEDGE } from '../../../../../../../packages/object-house/src/reference/modern4kkFaqSource';
import { canonicalHouseKnowledgeEntries } from '../../../../../../../packages/object-house/src/runtime-context/selectCanonicalHouseKnowledge';

import { BUNGALOV_4KK_PRIORITY_LEVEL_FIT_CONTRACT } from './priorityFitContract';

const read = (url: URL) => readFileSync(url, 'utf8');

test('VR4 maps all eight approved house-level results and WHY copy', () => {
  const contract = BUNGALOV_4KK_PRIORITY_LEVEL_FIT_CONTRACT;
  assert.equal(contract.length, 8);
  assert.deepEqual(contract.map(({ priorityId, resultType, rating }) => ({ priorityId, resultType, rating })), [
    { priorityId: 'plot', resultType: 'verify', rating: undefined },
    { priorityId: 'layout', resultType: 'rating', rating: 5 },
    { priorityId: 'comfort', resultType: 'rating', rating: 5 },
    { priorityId: 'design', resultType: 'rating', rating: 5 },
    { priorityId: 'energy', resultType: 'rating', rating: 5 },
    { priorityId: 'realization', resultType: 'knowledge-gap', rating: undefined },
    { priorityId: 'quality', resultType: 'rating', rating: 5 },
    { priorityId: 'maintenance', resultType: 'rating', rating: 4 },
  ]);
  assert.ok(contract.every((entry) => entry.why.length > 40));

  const output = read(new URL('PriorityFitAssessment.tsx', import.meta.url));
  assert.doesNotMatch(output, /PRO VÁS/);
  assert.equal((output.match(/border-2 border-white bg-embed-brand-navy/g) ?? []).length, 3);
  assert.match(output, /onClick=\{continueWithPlotCheck\}/);
  assert.match(output, /onClick=\{continueWithPlotFind\}/);
  assert.match(output, /onClick=\{askConis\}/);
});

test('VR4 additions are canonical, house-scoped, retrievable and not duplicated in the surface', () => {
  const additions = MODERN_4KK_KNOWLEDGE.filter((fact) => fact.id.startsWith('task120-vr4-'));
  assert.equal(additions.length, 5);
  assert.equal(new Set(additions.map((fact) => fact.id)).size, 5);
  assert.ok(additions.every((fact) => fact.houseId === 'modern-4kk' && fact.temporalStatus === 'CURRENT'));

  const chat = { canonicalHouseId: 'modern-4kk', facts: MODERN_4KK_KNOWLEDGE, interpretations: [], guardrails: [], priorityFaq: [] };
  const energy = canonicalHouseKnowledgeEntries(chat, 'Jakou roli má baterie a jak funguje chytré řízení energie?');
  const maintenance = canonicalHouseKnowledgeEntries(chat, 'Co vyžaduje servis a vyžadují topné fólie pravidelný servis?');
  assert.ok(energy.some((entry) => entry.id === 'task120-vr4-energy-battery'));
  assert.ok(maintenance.some((entry) => entry.id === 'task120-vr4-maintenance-system'));
  assert.ok(maintenance.some((entry) => entry.id === 'task120-vr4-maintenance-foils-ampio'));
  assert.ok(!BUNGALOV_4KK_PRIORITY_LEVEL_FIT_CONTRACT.find((entry) => entry.priorityId === 'energy')!.evidenceFactIds.includes('task120-vr4-energy-mobility-context'));

  const output = read(new URL('PriorityFitAssessment.tsx', import.meta.url));
  assert.doesNotMatch(output, /20 kWh|elektromobil|topné fólie.*servis/i);
});

test('VR4 scopes the 600px guard to expanded desktop Priority and leaves mobile/default at 80', () => {
  const page = read(new URL('../../ClientStudioPage.tsx', import.meta.url));
  assert.match(page, /activeSceneId === scenes\[1\]\?\.id/);
  assert.match(page, /matchMedia\("\(min-width: 768px\)"\)/);
  assert.match(page, /getElementById\(PRIORITY_BRIDGE_ANCHOR_ID\)/);
  assert.match(page, /\? 600\s*:\s*80/);
});
