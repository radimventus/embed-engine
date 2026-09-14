import assert from 'node:assert/strict';
import test from 'node:test';

import { getCanonicalHouseRuntimeContext } from '../runtime-context/canonicalHouseRuntimeContext';
import {
  HouseRelationshipOutputCache,
  generateHouseRelationshipOutput,
  houseKnowledgeVersion,
  selectHouseRelationshipEvidence,
} from './houseRelationshipOutput';

const context = getCanonicalHouseRuntimeContext('modern-4kk')!;
const lens = ['energy', 'quality', 'maintenance'];

test('selects exactly three CONNECTED and three BLINDSPOT outputs deterministically', () => {
  const first = selectHouseRelationshipEvidence({ context, selectedPriorityIds: lens });
  const second = selectHouseRelationshipEvidence({ context, selectedPriorityIds: [...lens].reverse() });
  assert.equal(first.filter((item) => item.kind === 'CONNECTED').length, 3);
  assert.equal(first.filter((item) => item.kind === 'BLINDSPOT').length, 3);
  assert.deepEqual(first.map((item) => item.outputId), second.map((item) => item.outputId));
  assert.ok(first.every((item) => item.evidence.length > 0));
  assert.ok(first.every((item) => item.evidence.every((ref) =>
    context.knowledge.some((fact) => fact.id === ref.factId && fact.houseId === context.identity.houseId),
  )));
  const selectedLabels = new Set(['energie', 'kvalita', 'údržba']);
  assert.ok(first.every((item) => !selectedLabels.has(item.title.toLocaleLowerCase('cs-CZ'))));
  assert.ok(first.every((item) => item.title.length <= 60), first.map((item) => item.title).join(' | '));
});

test('Priority lens ranks evidence without removing the canonical House corpus', () => {
  const before = context.knowledge.map((fact) => fact.id);
  selectHouseRelationshipEvidence({ context, selectedPriorityIds: lens });
  assert.deepEqual(context.knowledge.map((fact) => fact.id), before);
});

test('knowledge version changes with evidence and prevents stale cache identity', () => {
  const changed = {
    ...context,
    knowledge: context.knowledge.map((fact) => fact.id === 'product-space-efficiency'
      ? { ...fact, statement: `${fact.statement} Aktualizováno.` }
      : fact),
  };
  assert.notEqual(houseKnowledgeVersion(context), houseKnowledgeVersion(changed));
  const before = selectHouseRelationshipEvidence({ context, selectedPriorityIds: lens });
  const after = selectHouseRelationshipEvidence({ context: changed, selectedPriorityIds: lens });
  assert.notEqual(before[0]?.outputId, after[0]?.outputId);
});

test('generation is lazy, cached, evidence-bounded and isolated by House', async () => {
  const bundles = selectHouseRelationshipEvidence({ context, selectedPriorityIds: lens });
  const cache = new HouseRelationshipOutputCache();
  let calls = 0;
  const generator = async (bundle: (typeof bundles)[number]) => {
    calls += 1;
    assert.equal(bundle.houseId, 'modern-4kk');
    assert.ok(bundle.evidence.length > 0);
    return {
      connection: 'Souvislost doložená vybranými podklady.',
      houseSolution: bundle.primaryFact.statement,
      relationship: bundle.primaryFact.safeInterpretation!,
      remember: bundle.primaryFact.constraints[0] ?? 'Ověřit pro konkrétní užívání.',
      conclusion: bundle.primaryFact.interpretationPoint ?? bundle.primaryFact.safeInterpretation!,
    };
  };
  assert.equal(calls, 0);
  const bundle = bundles[0]!;
  const [first, second] = await Promise.all([
    cache.getOrGenerate(bundle, generator),
    cache.getOrGenerate(bundle, generator),
  ]);
  assert.equal(calls, 1);
  assert.deepEqual(first, second);
  assert.equal(first.houseId, context.identity.houseId);
  assert.deepEqual(first.evidence, bundle.evidence);
  assert.equal('primaryFact' in first, false);
});

test('missing evidence produces no hallucinated output', async () => {
  const empty = { ...context, knowledge: [] };
  const bundles = selectHouseRelationshipEvidence({ context: empty, selectedPriorityIds: lens });
  assert.deepEqual(bundles, []);
  assert.equal(await Promise.all(bundles.map((bundle) => generateHouseRelationshipOutput(bundle))).then((x) => x.length), 0);
});

test('unrelated House facts cannot leak into Bungalov 4KK evidence', () => {
  const contaminated = {
    ...context,
    knowledge: [...context.knowledge, {
      ...context.knowledge[0]!, id: 'foreign', houseId: 'other-house',
      factPoint: 'CIZÍ FAKT', interpretationPoint: 'CIZÍ DOPAD',
    }],
  };
  const bundles = selectHouseRelationshipEvidence({ context: contaminated, selectedPriorityIds: lens });
  assert.ok(bundles.every((bundle) => bundle.evidence.every((ref) => ref.factId !== 'foreign')));
});
