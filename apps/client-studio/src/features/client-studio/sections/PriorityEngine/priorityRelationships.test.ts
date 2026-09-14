import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { parseRelationshipNarrative } from './relationshipNarrativeGenerator';

const here = dirname(fileURLToPath(import.meta.url));
const read = (name: string) => readFileSync(join(here, name), 'utf8');

test('parses only complete structured narrative with emphasized evidence facts', () => {
  const output = parseRelationshipNarrative(JSON.stringify({
    connection: 'Souvislost', houseSolution: 'Řešení domu',
    relationship: 'Vztah', remember: 'Limit', conclusion: 'Závěr',
    bullets: ['Bod 1', 'Bod 2'],
  }));
  assert.deepEqual(output, {
    connection: 'Souvislost', houseSolution: 'Řešení domu',
    relationship: 'Vztah', remember: 'Limit', conclusion: 'Závěr',
    bullets: ['Bod 1', 'Bod 2'],
  });
  assert.equal(parseRelationshipNarrative('{"connection":"bez evidence"}'), null);
  assert.equal(parseRelationshipNarrative(JSON.stringify({
    connection: 'Souvislost', houseSolution: 'Řešení domu', relationship: 'Vztah',
    remember: 'Limit', conclusion: 'Závěr', bullets: ['Jediný bod'],
  })), null);
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
  assert.match(component, /createPortal/);
  assert.match(component, /document\.body/);
  assert.match(component, /items-start/);
  assert.match(component, /grid-cols-6/);
  assert.match(component, /Díváme se, co pro vás znamená/);
  assert.match(component, /animate-pulse/);
  assert.match(component, /Ověřená fakta/);
  assert.match(component, /font-bold leading-\[1\.3\] text-white/);
  assert.doesNotMatch(component, />Souvisí<\/span>/);
  assert.doesNotMatch(component, />Nepřehlédnout<\/span>/);
  assert.match(component, /priority-relationship-connected[\s\S]*priority-relationship-blindspot/);
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

test('places relationship controls immediately below the priority section title', () => {
  const bridge = read('PriorityChapterBridge.tsx');
  const title = bridge.indexOf('{PRIORITY_BRIDGE_TITLE}');
  const relationships = bridge.indexOf('<PriorityRelationships />');
  const supportingCopy = bridge.indexOf('PRIORITY_PAYOFF_UPPER_LINES.map');
  const panels = bridge.indexOf('data-testid="priority-payoff-panels"');
  assert.ok(title >= 0 && relationships > title);
  assert.ok(supportingCopy < relationships);
  assert.ok(relationships < panels);
  assert.equal(bridge.lastIndexOf('<PriorityRelationships />'), relationships);
});

test('uses bold typography for shared navy journey actions', () => {
  const cta = read('../../foundation/journeyCta.ts');
  assert.match(cta, /bg-\[#001930\][^']*font-bold/);
  assert.doesNotMatch(cta, /bg-\[#001930\][^']*font-medium/);
});
