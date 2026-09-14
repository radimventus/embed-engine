import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { parseRelationshipNarrative } from './relationshipNarrativeGenerator';

const here = dirname(fileURLToPath(import.meta.url));
const read = (name: string) => readFileSync(join(here, name), 'utf8');

test('parses only complete structured narrative for popup and future PDF', () => {
  const output = parseRelationshipNarrative(JSON.stringify({
    connection: 'Souvislost', houseSolution: 'Řešení domu',
    relationship: 'Vztah', remember: 'Limit', conclusion: 'Závěr',
    bullets: ['Bod'],
  }));
  assert.deepEqual(output, {
    connection: 'Souvislost', houseSolution: 'Řešení domu',
    relationship: 'Vztah', remember: 'Limit', conclusion: 'Závěr',
    bullets: ['Bod'],
  });
  assert.equal(parseRelationshipNarrative('{"connection":"bez evidence"}'), null);
});

test('wires six relationship labels to one lazy cached evidence output', () => {
  const component = read('PriorityRelationships.tsx');
  const generator = read('relationshipNarrativeGenerator.ts');
  const provider = read('../../runtime/DecisionSessionRuntimeProvider.tsx');
  assert.match(component, /priority-relationship-connected/);
  assert.match(component, /priority-relationship-blindspot/);
  assert.match(component, /active !== null \? <RelationshipDialog/);
  assert.match(component, /outputCache\.getOrGenerate\(bundle, generator\)/);
  assert.match(component, /role="dialog"/);
  assert.match(component, /Souvislost/);
  assert.match(component, /Jak je to řešené u tohoto domu/);
  assert.match(component, /Co spolu souvisí/);
  assert.match(component, /Na co nezapomenout/);
  assert.match(component, /Závěr/);
  assert.doesNotMatch(component, /Lorem/i);
  assert.match(generator, /Nevymýšlej vlastnost domu/);
  assert.match(generator, /bundle\.primaryFact, bundle\.relatedFact/);
  assert.match(generator, /parseRelationshipNarrative\(response\.content\) \?\? fallback/);
  assert.match(provider, /selectHouseRelationshipEvidence/);
});
