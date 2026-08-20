import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { createCardsFromPriorityIds } from './useDecisionCards';
import {
  DECISION_CATEGORIES,
  SELECTABLE_DECISION_CATEGORIES,
} from './decision-cards.constants';

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
        'plot',
        'layout',
        'privacy',
        'energy',
        'operating-costs',
        'design',
        'quality',
        'investment',
        'maintenance',
        'flexibility',
      ],
    );
  });

  it('renders the fixed eight-card Priority projection in desktop order', () => {
    assert.equal(SELECTABLE_DECISION_CATEGORIES.length, 8);
    assert.deepEqual(
      SELECTABLE_DECISION_CATEGORIES.map((category) => category.title),
      [
        'Pozemek',
        'Dispozice',
        'Soukromí',
        'Design',
        'Energie',
        'Provozní náklady',
        'Kvalita',
        'Údržba',
      ],
    );
    assert.equal(
      SELECTABLE_DECISION_CATEGORIES.some(
        (category) => category.title === 'Investice',
      ),
      false,
    );
    assert.equal(
      SELECTABLE_DECISION_CATEGORIES.some(
        (category) => category.title === 'Flexibilita',
      ),
      false,
    );
  });

  it('hydrates card selection and intensity order from Runtime priorityIds', () => {
    const cards = createCardsFromPriorityIds([
      'plot',
      'layout',
      'privacy',
      'design',
    ]);
    assert.equal(cards.plot?.selected, true);
    assert.equal(cards.layout?.selected, true);
    assert.equal(cards.privacy?.selected, true);
    assert.equal(cards.design?.selected, true);
    assert.equal(cards.energy?.selected, false);
    assert.ok((cards.plot?.importance ?? 0) > (cards.layout?.importance ?? 0));
    assert.ok((cards.layout?.importance ?? 0) > (cards.privacy?.importance ?? 0));
    assert.equal(Object.values(cards).filter((card) => card.selected).length, 4);
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

  it('exposes intensity control and four-column Priority grid', () => {
    assert.ok(readdirSync(here).includes('DecisionSlider.tsx'));
    const header = read('SectionHeader.tsx');
    assert.match(header, /Co vás na tomto domě zajímá nejvíce\?/i);
    assert.match(header, /uppercase/);
    assert.equal(header.includes('Vybráno'), false);
    assert.equal(header.includes('VYBERTE'), false);
    assert.equal(header.includes('podstatné'), false);
    const cards = read('PriorityCards.tsx');
    assert.match(cards, /grid-cols-4/);
    assert.match(cards, /mobile:grid-cols-2/);
    assert.equal(cards.includes('tablet:grid-cols-3'), false);
    const layout = read('decision-cards-layout.ts');
    assert.match(layout, /DECISION_GRID_GAP_PX = 22/);
    assert.match(layout, /desktop:h-\[155px\]/);
    assert.match(layout, /desktop:w-\[155px\]/);
    assert.match(layout, /border-\[#D4AF37\]/);
    assert.match(layout, /border-solid/);
    assert.match(layout, /bg-\[#F7F6F4\]/);
    assert.match(layout, /border-\[#E3E3E3\]/);
    const card = read('DecisionCard.tsx');
    assert.match(card, /borderStyle:\s*'solid'/);
    assert.match(card, /borderWidth:\s*isActive \? 2 : 1/);
    assert.match(card, /hasSelectedCard && isPrimary/);
    assert.match(card, /hasSelectedCard && isRelated/);
    assert.match(card, /text-\[16px\]/);
    assert.match(card, /scale-\[0\.909\]/);
    const icon = read('DecisionCategoryIcon.tsx');
    assert.match(icon, /h-\[38px\] w-\[38px\]/);
    const engine = read('PriorityEngine.tsx');
    assert.equal(engine.includes('DecisionStoryRecommendationBanner'), false);
  });

  it('uses the canonical conversation phase for the shared skip/continue CTA', () => {
    const engine = read('PriorityEngine.tsx');
    assert.match(engine, /phase === "complete" \? "Pokračovat →" : "Přeskočit →"/);
    assert.match(engine, /onClick={onContinueToRacio}/);
    assert.match(engine, /phase === "complete" && shouldShowDelayedRacioBridge/);
  });
});
