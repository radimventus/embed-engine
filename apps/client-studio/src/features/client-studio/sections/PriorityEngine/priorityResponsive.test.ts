import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));

function read(name: string): string {
  return readFileSync(join(here, name), 'utf8');
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('Responsive Priority Experience (RCS-02)', () => {
  it('keeps desktop priority grid SSOT and stacks fluid cards on mobile', () => {
    const cards = read('PriorityCards.tsx');
    const card = read('DecisionCard.tsx');
    const layout = read('decision-cards-layout.ts');
    const engine = read('PriorityEngine.tsx');

    assert.match(cards, /grid-cols-4/);
    assert.match(cards, /mobile:grid-cols-2/);
    assert.match(cards, /mobile:max-w-none/);
    assert.match(cards, /overflow-visible/);
    assert.equal(cards.includes('tablet:grid-cols-3'), false);

    assert.match(layout, /DECISION_CARD_SHELL_CLASS/);
    assert.match(layout, /desktop:h-\[155px\]/);
    assert.match(layout, /desktop:w-\[155px\]/);
    assert.match(layout, /mobile:scale-\[1\.03\]/);
    assert.match(card, /DECISION_CARD_SHELL_CLASS/);
    assert.match(engine, /mobile:grid-cols-1/);
    assert.match(engine, /mobile:overflow-visible/);
  });

  it('enlarges intensity and CTA touch targets without changing Runtime events', () => {
    const slider = read('DecisionSlider.tsx');
    const panel = read('PriorityConversationPanel.tsx');
    const bridge = stripComments(read('usePrioritySignalBridge.ts'));

    assert.match(slider, /h-11/);
    assert.match(slider, /desktop:h-7/);
    assert.match(slider, /touch-none/);
    assert.match(slider, /priority-intensity-slider/);
    assert.match(slider, /onClick=\{\(event\) => event\.stopPropagation\(\)\}/);
    assert.match(panel, /min-h-11/);
    assert.match(panel, /PRIORITY_ENGINE_MOBILE_STICKY_CTA_CLASS/);
    assert.match(panel, /priority-mobile-sticky-cta/);
    assert.match(bridge, /ChangePriority/);
    assert.equal(bridge.includes('composeDecision'), false);
  });

  it('preserves selection flow contracts and mobile conversation polish', () => {
    const panel = read('PriorityConversationPanel.tsx');
    const chapter = read('PriorityChapterBridge.tsx');
    const layout = read('priority-engine-layout.ts');

    assert.match(panel, /x:\s*-60/);
    assert.match(panel, /priority-conversation-finish-selection/);
    assert.match(panel, /mobile:!ml-0/);
    assert.match(layout, /mobile:ml-0/);
    assert.match(layout, /PRIORITY_ENGINE_MOBILE_STICKY_CTA_CLASS/);
    assert.match(chapter, /mobile:mt-8/);
    assert.match(chapter, /mobile:p-5/);
  });
});
