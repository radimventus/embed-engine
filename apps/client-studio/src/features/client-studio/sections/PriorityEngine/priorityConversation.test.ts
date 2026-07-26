import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  CONIS_MICROINTERACTION_MS,
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

describe('PT-PRIORITY-TUNING-02 CONIS Constitution integration', () => {
  it('keeps dialog questions short and caps refinement at 3', () => {
    for (const question of Object.values(PRIORITY_DIALOG_QUESTIONS)) {
      assert.ok(question.options.length >= 2 && question.options.length <= 3);
      assert.ok(question.prompt.length > 0);
      assert.ok(question.prompt.length < 120);
    }
    assert.equal(PRIORITY_CONVERSATION_MINIMUM, 3);
    assert.equal(PRIORITY_DIALOG_QUESTION_COUNT, 3);
    assert.equal(CONIS_MICROINTERACTION_MS >= 400, true);
    assert.equal(CONIS_MICROINTERACTION_MS <= 600, true);
    assert.match(PRIORITY_CONVERSATION_INTRO_LINES[0] ?? '', /Conis/i);
    assert.match(PRIORITY_CONVERSATION_START_LINES.join(' '), /třemi priorit/i);
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

  it('wires Constitution presentation: avatar, intro, paced answers, unified paths', () => {
    const panel = stripComments(read('PriorityConversationPanel.tsx'));
    assert.match(panel, /ConisMessage/);
    assert.match(panel, /priority-conversation-instruction/);
    assert.match(panel, /priority-conversation-start-block/);
    assert.match(panel, /priority-conversation-next-paths/);
    assert.match(panel, /priority-conversation-answer-ack/);
    assert.match(panel, /conis-avatar|ConisAvatar|ConisMessage/);

    const avatar = stripComments(read('ConisAvatar.tsx'));
    assert.match(avatar, /conis-avatar/);
    assert.equal(avatar.includes('img'), false);
    assert.equal(avatar.toLowerCase().includes('face'), false);

    const hook = stripComments(read('usePriorityConversation.ts'));
    assert.match(hook, /CONIS_MICROINTERACTION_MS/);
    assert.equal(hook.includes('dispatch('), false);
    assert.equal(hook.includes('ChangePriority'), false);
    assert.equal(hook.includes('@embed-engine/runtime'), false);

    const header = stripComments(read('SectionHeader.tsx'));
    assert.equal(header.includes('VYBERTE'), false);

    const conversationFiles = readdirSync(here).filter(
      (name) =>
        (name.toLowerCase().includes('conversation') ||
          name.startsWith('Conis') ||
          name === 'SectionHeader.tsx') &&
        (name.endsWith('.ts') || name.endsWith('.tsx')) &&
        !name.endsWith('.test.ts'),
    );
    for (const name of conversationFiles) {
      const source = stripComments(read(name));
      assert.equal(source.includes('Lorem'), false, `${name} placeholder`);
      for (const phrase of FORBIDDEN_TECHNICAL) {
        assert.equal(
          source.includes(phrase),
          false,
          `${name} must not include technical phrase: ${phrase}`,
        );
      }
    }
  });
});
