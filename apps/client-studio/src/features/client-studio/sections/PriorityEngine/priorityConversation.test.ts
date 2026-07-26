import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  CONIS_MICROINTERACTION_MS,
  CONIS_QUIZ_ADVANCE_MS,
  dialogQuestionFor,
  pickDialogPriorityIds,
  PRIORITY_CONVERSATION_INTRO_LINES,
  PRIORITY_CONVERSATION_MINIMUM,
  PRIORITY_CONVERSATION_START_LINES,
  PRIORITY_DIALOG_QUESTION_COUNT,
  PRIORITY_DIALOG_QUESTIONS,
} from './priorityConversation.constants';
import {
  createPriorityConversationProgress,
  nextSelectionOrder,
} from './priorityConversationProgress';

const here = dirname(fileURLToPath(import.meta.url));

function read(name: string): string {
  return readFileSync(join(here, name), 'utf8');
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

const FORBIDDEN_TECHNICAL = [
  'Výběr je zaznamenán',
  'Pokračujte ve výběru',
  'Data byla',
  'VYBERTE',
];

describe('PT-PRIORITY-PILOT-READY-01 CONIS pilot readiness', () => {
  it('keeps dialog questions short and uses slower quiz pacing', () => {
    for (const question of Object.values(PRIORITY_DIALOG_QUESTIONS)) {
      assert.ok(question.options.length >= 2 && question.options.length <= 3);
      assert.ok(question.prompt.length > 0);
      assert.ok(question.prompt.length < 120);
    }
    assert.equal(PRIORITY_CONVERSATION_MINIMUM, 3);
    assert.equal(PRIORITY_DIALOG_QUESTION_COUNT, 3);
    assert.equal(CONIS_MICROINTERACTION_MS, 750);
    assert.equal(CONIS_QUIZ_ADVANCE_MS, 1500);
    assert.match(PRIORITY_CONVERSATION_INTRO_LINES[1] ?? '', /Conis/i);
    assert.match(PRIORITY_CONVERSATION_START_LINES.join(' '), /tři priorit/i);
    assert.ok(dialogQuestionFor('energy')?.options.length === 3);

    const picked = pickDialogPriorityIds(
      ['energy', 'privacy', 'layout', 'design', 'plot'],
      {
        energy: 0.4,
        privacy: 0.9,
        layout: 0.7,
        design: 0.2,
        plot: 0.8,
      },
    );
    assert.deepEqual(picked, ['privacy', 'plot', 'layout']);
  });

  it('tracks selection order and answers without Runtime', () => {
    const progress = createPriorityConversationProgress();
    const first = nextSelectionOrder([], ['energy']);
    assert.deepEqual(first.order, ['energy']);
    progress.record({ type: 'priority-count', count: 1, at: 1 });
    progress.record({
      type: 'dialog-answer',
      priorityId: 'energy',
      optionId: 'comfort',
      at: 2,
    });
    assert.equal(progress.events().length, 2);
  });

  it('wires pilot readiness presentation cues', () => {
    const panel = stripComments(read('PriorityConversationPanel.tsx'));
    assert.match(panel, /priority-conversation-start-block/);
    assert.match(panel, /priority-conversation-audit/);
    assert.match(panel, /priority-conversation-clarification/);
    assert.match(panel, /ConisMessage/);
    assert.equal(panel.includes('Hlavní'), false);

    const card = stripComments(read('DecisionCard.tsx'));
    assert.equal(card.includes('Hlavní'), false);

    const avatar = stripComments(read('ConisAvatar.tsx'));
    assert.match(avatar, /conis-avatar/);
    assert.match(avatar, /size = 40/);

    const hook = stripComments(read('usePriorityConversation.ts'));
    assert.match(hook, /CONIS_QUIZ_ADVANCE_MS/);
    assert.match(hook, /continueToAudit/);
    assert.equal(hook.includes('dispatch('), false);
    assert.equal(hook.includes('@embed-engine/runtime'), false);

    const categories = stripComments(read('decision-cards.constants.ts'));
    assert.match(categories, /PRIORITY_CLARIFICATIONS/);
    assert.match(categories, /id: 'plot'/);

    for (const name of readdirSync(here).filter(
      (file) =>
        (file.toLowerCase().includes('conversation') ||
          file.startsWith('Conis') ||
          file === 'SectionHeader.tsx') &&
        (file.endsWith('.ts') || file.endsWith('.tsx')) &&
        !file.endsWith('.test.ts'),
    )) {
      const source = stripComments(read(name));
      assert.equal(source.includes('Lorem'), false, `${name} placeholder`);
      for (const phrase of FORBIDDEN_TECHNICAL) {
        assert.equal(
          source.includes(phrase),
          false,
          `${name} must not include: ${phrase}`,
        );
      }
    }
  });
});
