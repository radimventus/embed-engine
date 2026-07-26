import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { createCardsFromPriorityIds } from './useDecisionCards';
import { DECISION_CATEGORIES } from './decision-cards.constants';

const here = dirname(fileURLToPath(import.meta.url));

function read(name: string): string {
  return readFileSync(join(here, name), 'utf8');
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('Priority Experience (CSCB-04)', () => {
  it('catalogue matches the canonical Runtime priority set', () => {
    assert.deepEqual(
      DECISION_CATEGORIES.map((category) => category.id),
      [
        'energy',
        'operating-costs',
        'layout',
        'privacy',
        'design',
        'quality',
        'plot',
        'investment',
        'maintenance',
        'flexibility',
      ],
    );
  });

  it('hydrates card selection and intensity order from Runtime priorityIds', () => {
    const cards = createCardsFromPriorityIds(['plot', 'layout', 'energy']);
    assert.equal(cards.plot?.selected, true);
    assert.equal(cards.layout?.selected, true);
    assert.equal(cards.energy?.selected, true);
    assert.equal(cards.design?.selected, false);
    assert.ok((cards.plot?.importance ?? 0) > (cards.layout?.importance ?? 0));
    assert.ok((cards.layout?.importance ?? 0) > (cards.energy?.importance ?? 0));
  });

  it('dispatches ChangePriority only — no semantic composition', () => {
    const bridge = stripComments(read('usePrioritySignalBridge.ts'));
    assert.match(bridge, /ChangePriority/);
    assert.equal(bridge.includes('composeDecision'), false);
    assert.equal(bridge.includes('interpretDecision'), false);
    assert.equal(bridge.includes('@embed-engine/object-house'), false);

    const files = readdirSync(here).filter(
      (name) =>
        (name.endsWith('.ts') || name.endsWith('.tsx')) &&
        !name.endsWith('.test.ts') &&
        name !== 'RecommendationViewModel.ts',
    );

    for (const name of files) {
      const source = stripComments(read(name));
      assert.equal(
        source.includes('composeDecisionStory'),
        false,
        `${name} must not compose Decision Story`,
      );
    }
  });

  it('exposes intensity control and 5-column priority grid', () => {
    assert.ok(readdirSync(here).includes('DecisionSlider.tsx'));
    const header = read('SectionHeader.tsx');
    assert.match(header, /podstatné/i);
    assert.equal(header.includes('Vybráno'), false);
    assert.equal(header.includes('VYBERTE'), false);
    const cards = read('PriorityCards.tsx');
    assert.match(cards, /grid-cols-5/);
    assert.match(cards, /mobile:grid-cols-2/);
    assert.equal(cards.includes('tablet:grid-cols-3'), false);
    const layout = read('decision-cards-layout.ts');
    assert.match(layout, /DECISION_GRID_GAP_PX = 22/);
    assert.match(layout, /border-\[#D4AF37\]/);
    assert.match(layout, /border-solid/);
    const card = read('DecisionCard.tsx');
    assert.match(card, /borderStyle:\s*'solid'/);
    assert.match(card, /borderWidth:\s*isActive \? 2 : 1/);
    const engine = read('PriorityEngine.tsx');
    assert.equal(engine.includes('DecisionStoryRecommendationBanner'), false);
  });
});
