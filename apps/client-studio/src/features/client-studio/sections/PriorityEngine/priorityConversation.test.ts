import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  dialogQuestionFor,
  PRIORITY_CONVERSATION_INSTRUCTION,
  PRIORITY_CONVERSATION_MINIMUM,
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

describe('PT-PRIORITY-DESIGN-02 Priority conversation', () => {
  it('keeps every dialog question short (2–3 options)', () => {
    for (const question of Object.values(PRIORITY_DIALOG_QUESTIONS)) {
      assert.ok(question.options.length >= 2 && question.options.length <= 3);
      assert.ok(question.prompt.length > 0);
      assert.ok(question.prompt.length < 120);
    }
    assert.equal(PRIORITY_CONVERSATION_MINIMUM, 3);
    assert.match(PRIORITY_CONVERSATION_INSTRUCTION, /tři oblasti/i);
    assert.ok(dialogQuestionFor('energy')?.options.length === 3);
  });

  it('tracks selection order, changes, answers, and intensity without Runtime', () => {
    const progress = createPriorityConversationProgress();
    const first = nextSelectionOrder([], ['energy']);
    assert.deepEqual(first.order, ['energy']);
    const second = nextSelectionOrder(first.order, ['energy', 'privacy']);
    assert.deepEqual(second.order, ['energy', 'privacy']);
    assert.deepEqual(second.added, ['privacy']);

    progress.record({
      type: 'priority-count',
      count: 2,
      at: 1,
    });
    progress.record({
      type: 'dialog-answer',
      priorityId: 'energy',
      optionId: 'comfort',
      at: 2,
    });
    progress.record({
      type: 'intensity',
      priorityId: 'energy',
      value: 0.8,
      at: 3,
    });

    const events = progress.events();
    assert.equal(events.length, 3);
    assert.equal(events[0]?.type, 'priority-count');
    assert.equal(events[1]?.type, 'dialog-answer');
    assert.equal(events[2]?.type, 'intensity');
  });

  it('wires conversation into PriorityEngine without Runtime / DecisionTerminal content', () => {
    const engine = stripComments(read('PriorityEngine.tsx'));
    assert.match(engine, /PriorityConversationPanel/);
    assert.equal(engine.includes('DecisionTerminal'), false);

    const panel = stripComments(read('PriorityConversationPanel.tsx'));
    assert.match(panel, /priority-conversation-instruction/);
    assert.match(panel, /priority-conversation-tags/);
    assert.match(panel, /priority-conversation-dialog/);
    assert.match(panel, /priority-conversation-faq/);
    assert.match(panel, /priority-conversation-chat/);
    assert.match(panel, /priority-conversation-pdf-note/);
    assert.equal(panel.includes('createPortal'), false);
    assert.equal(panel.includes('tooltip'), false);

    const hook = stripComments(read('usePriorityConversation.ts'));
    assert.equal(hook.includes('dispatch('), false);
    assert.equal(hook.includes('ChangePriority'), false);
    assert.equal(hook.includes('@embed-engine/runtime'), false);

    const conversationFiles = readdirSync(here).filter(
      (name) =>
        name.toLowerCase().includes('conversation') &&
        (name.endsWith('.ts') || name.endsWith('.tsx')) &&
        !name.endsWith('.test.ts'),
    );
    for (const name of conversationFiles) {
      const source = stripComments(read(name));
      assert.equal(
        source.includes('Lorem'),
        false,
        `${name} must not use placeholder copy`,
      );
    }
  });
});
