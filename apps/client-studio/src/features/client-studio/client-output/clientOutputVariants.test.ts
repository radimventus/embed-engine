import assert from 'node:assert/strict';
import test from 'node:test';
import type { CanonicalHouseKnowledgeSelection, HouseKnowledgeAtom, HouseRelationshipEvidenceBundle } from '@embed-engine/object-house';
import type { DecisionSessionRuntimeContextValue } from '../runtime/DecisionSessionRuntimeProvider';
import {
  buildClientOutputSnapshot,
  clientOutputConclusion,
  clientOutputMediaCaption,
  clientOutputPlotAndProcess,
  clientOutputVariantForLandOption,
} from './clientOutputSnapshot';

function fact(index: number): HouseKnowledgeAtom {
  return {
    id: `fact-${index}`, houseId: 'house', subject: `Téma ${index}`, category: 'layout',
    statement: `Ověřený fakt ${index}.`, scope: 'PRODUCT', confidence: 'CONFIRMED',
    source: { sourceId: 'kb', kind: 'CURRENT_CONFIRMED' }, validFrom: '2026-09-14',
    temporalStatus: 'CURRENT', constraints: [`INTERNÍ OMEZENÍ ${index}`],
    safeInterpretation: `Praktický přínos ${index}.`, relatedTopics: ['dispozice'],
  };
}

const facts = Array.from({ length: 10 }, (_, index) => fact(index + 1));
const knowledge: CanonicalHouseKnowledgeSelection = {
  canonicalHouseId: 'house', facts, interpretations: [], guardrails: ['INTERNÍ OMEZENÍ'],
  priorityFaq: Array.from({ length: 4 }, (_, index) => ({
    id: `faq-${index}`, houseId: 'house', priority: 'LAYOUT', constraints: [],
    question: `Otázka ${index + 1}?`, answer: `Odpověď ${index + 1}.`, knowledgeAtomIds: [`fact-${index + 1}`],
  })),
};

function relationship(index: number, kind: 'CONNECTED' | 'BLINDSPOT'): HouseRelationshipEvidenceBundle {
  return {
    houseId: 'house', knowledgeVersion: 'v04', lensId: 'design+maintenance',
    selectedPriorityIds: ['design', 'maintenance'], kind, outputId: `${kind}-${index}`,
    title: `Souvislost ${index}`, primaryFact: facts[index - 1]!,
    relatedFact: kind === 'BLINDSPOT' ? facts[(index + 1) % facts.length] : undefined,
    supportingFacts: [],
    evidence: [{ factId: `fact-${index}`, sourceId: 'kb', sourceKind: 'CURRENT_CONFIRMED' }],
  };
}

function runtime(withPriorities = false): DecisionSessionRuntimeContextValue {
  const media = (id: string, title: string, url: string, roomId?: string) => ({
    id, title, url, thumbnailUrl: url, kind: 'image' as const, ...(roomId ? { roomId } : {}),
  });
  return {
    experience: {
      house: { title: 'BUNGALOV 4KK', rooms: [
        { id: 'exterior', name: 'Exteriér', area: 0, floor: 0 },
        { id: 'kitchen', name: 'Kuchyně', area: 14, floor: 0 },
        { id: 'living-room', name: 'Obývací pokoj', area: 32, floor: 0 },
      ] },
      context: {
        hero: { heroMedia: media('hero', 'Hero', '/house-packages/h/media/hero.webp') },
        roomMedia: { gallery: [
          media('hero-duplicate', 'exterior', '/house-packages/h/media/hero.webp', 'exterior'),
          media('exterior', 'exterior', '/house-packages/h/media/exterior.webp', 'exterior'),
          media('kitchen', 'kitchen', '/house-packages/h/media/kitchen.webp', 'kitchen'),
          media('living', 'living-room', '/house-packages/h/media/living.webp', 'living-room'),
        ] },
        floorPlan: { src: '/house-packages/h/media/plan.png', rooms: [{ floor: '1' }] },
      },
    },
    houseKnowledge: knowledge,
    chatHouseKnowledge: knowledge,
    relationshipEvidence: withPriorities
      ? [...[1, 2, 3].map((index) => relationship(index, 'CONNECTED')), ...[4, 5, 6].map((index) => relationship(index, 'BLINDSPOT'))]
      : [],
    analyticsScope: { companyId: 'company', projectId: 'project-internal-id', houseId: 'house' },
    company: { companyId: 'company', companyName: 'Domy s energií', legalName: null, ico: null, city: null, country: null, email: 'info@example.test', phone: null },
    project: { projectId: 'project-internal-id' },
  } as unknown as DecisionSessionRuntimeContextValue;
}

test('maps audit modes to distinct personalized snapshot variants', () => {
  assert.equal(clientOutputVariantForLandOption('owned'), 'HAS_LAND');
  assert.equal(clientOutputVariantForLandOption('seeking'), 'SEEKING_LAND');
  assert.notDeepEqual(clientOutputPlotAndProcess('HAS_LAND'), clientOutputPlotAndProcess('SEEKING_LAND'));
});

test('Universal preserves media references and provides complete canonical House fallback', () => {
  const output = buildClientOutputSnapshot(runtime(), 'UNIVERSAL', new Date('2026-09-14T08:00:00Z'));
  assert.equal(output.cover?.[0]?.url, '/house-packages/h/media/hero.webp');
  assert.equal(output.cover?.[0]?.role, 'cover');
  assert.equal(output.exterior[0]?.url, '/house-packages/h/media/exterior.webp');
  assert.equal(output.exterior[0]?.role, 'exterior');
  assert.equal(output.floorPlans[0]?.url, '/house-packages/h/media/plan.png');
  assert.equal(output.interiors[0]?.url, '/house-packages/h/media/kitchen.webp');
  assert.deepEqual(output.interiors.map((item) => item.role), ['interior', 'interior']);
  assert.equal(new Set([...output.cover ?? [], ...output.exterior].map((item) => item.url)).size, 2);
  assert.equal(output.connectedTopics.length, 3);
  assert.equal(output.blindspots.length, 3);
  assert.equal(output.faq.length, 4);
  assert.equal(output.project.name, 'Domy s energií');
  assert.deepEqual(output.priorities, []);
  assert.doesNotMatch(JSON.stringify(output), /project-internal-id.*Osobní|Probíhá/);
});

test('captions are Czech client copy grounded in House knowledge, without raw media keys', () => {
  const caption = clientOutputMediaCaption({ title: 'kitchen', roomId: 'kitchen' }, knowledge);
  assert.match(caption, /Kuchyně/);
  assert.match(caption, /Praktický přínos/);
  assert.doesNotMatch(caption, /kitchen:|prostor posuzovaný/);
});

test('personalized output uses Czech Priority labels and excludes constraints and provenance', () => {
  const output = buildClientOutputSnapshot(runtime(true), 'HAS_LAND');
  assert.deepEqual(output.priorities, ['Design', 'Údržba']);
  assert.equal(output.connectedTopics.length, 3);
  assert.equal(output.blindspots.length, 3);
  const clientCopy = JSON.stringify({ connected: output.connectedTopics, blindspots: output.blindspots });
  assert.doesNotMatch(clientCopy, /INTERNÍ OMEZENÍ|CURRENT_CONFIRMED|sourceId|nevydávat za záruku/);
  assert.doesNotMatch(clientCopy, /Souvislost vede přes vlastnost/);
  output.priorityNarratives.forEach((item) => assert.notEqual(item.fact, item.userImpact));
});

test('media selection uses canonical room semantics instead of filenames or array position', () => {
  const output = buildClientOutputSnapshot(runtime(true), 'HAS_LAND');
  assert.deepEqual(output.exterior.map((item) => item.label), ['Exteriér']);
  assert.deepEqual(output.interiors.map((item) => item.label), ['Kuchyně', 'Obývací pokoj']);
  assert.notEqual(output.interiors[0]?.caption, output.interiors[1]?.caption);
  assert.ok(output.interiors.every((item) => item.role === 'interior'));
  assert.ok(output.exterior.every((item) => item.role === 'exterior'));
  assert.equal(new Set([...output.cover ?? [], ...output.exterior, ...output.interiors].map((item) => item.url)).size, 4);
});

test('specific land variants reuse the canonical Audit workflow', () => {
  assert.deepEqual(clientOutputPlotAndProcess('HAS_LAND'), [
    'Mám pozemek: Získáme informace o vašem pozemku.',
    'Osazení domu: Navrhneme optimální umístění domu na pozemku.',
    'Stanoviska: Prověříme podmínky a regulace.',
    'Doporučení: Navrhneme dům, který sedí na váš pozemek.',
  ]);
  assert.equal(clientOutputPlotAndProcess('SEEKING_LAND')[1], 'Lokalita: Prověříme lokalitu a její možnosti.');
});

test('final copy is complete and variant-specific', () => {
  assert.doesNotMatch(clientOutputConclusion('UNIVERSAL', false), /Probíhá/);
  assert.match(clientOutputConclusion('HAS_LAND', true), /konkrétní pozemek/);
  assert.match(clientOutputConclusion('SEEKING_LAND', true), /hledaného pozemku/);
});
