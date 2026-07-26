import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  buildPriorityHypothesisSummary,
  coachChatOpeningFromPriorities,
  coachFaqItemsFromPriorities,
  coachingProgressPercent,
  interpretationFor,
  questionIntentFor,
} from './priorityCoachingDialogue';
import {
  dialogQuestionFor,
  pickDialogPriorityIds,
  PRIORITY_CONVERSATION_INTRO_LINES,
  PRIORITY_CONVERSATION_MINIMUM,
  PRIORITY_CONVERSATION_PREP_LINES,
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
  'Vyberte',
  'Potřebuji informace',
];

describe('PT-PRIORITY-DIALOGUE-01 coaching dialogue', () => {
  it('keeps coaching intents, interpretations, and user-paced continue', () => {
    for (const question of Object.values(PRIORITY_DIALOG_QUESTIONS)) {
      assert.ok(question.options.length >= 2 && question.options.length <= 3);
      assert.ok(questionIntentFor(question.priorityId).length > 10);
      for (const option of question.options) {
        assert.ok(
          interpretationFor(question.priorityId, option.id).length > 10,
        );
      }
    }
    assert.equal(PRIORITY_CONVERSATION_MINIMUM, 3);
    assert.equal(PRIORITY_DIALOG_QUESTION_COUNT, 3);
    assert.match(PRIORITY_CONVERSATION_INTRO_LINES.join(' '), /Conis/i);
    assert.match(PRIORITY_CONVERSATION_START_LINES.join(' '), /Zkusme společně/i);
    assert.equal(
      PRIORITY_CONVERSATION_PREP_LINES.some((line) => line.startsWith('Děkuji')),
      false,
    );
    assert.ok(dialogQuestionFor('privacy')?.options.length === 3);

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

    assert.equal(
      coachingProgressPercent({
        phase: 'collection-gate',
        selectedCount: 3,
        dialogAnswered: 0,
        dialogTotal: 0,
        isInterpreting: false,
      }),
      30,
    );

    const summary = buildPriorityHypothesisSummary({
      tags: [
        { id: 'privacy', title: 'Soukromí' },
        { id: 'layout', title: 'Dispozice' },
      ],
      answers: { privacy: 'garden', layout: 'open-space' },
    });
    assert.match(summary.lead, /Děkuji/);
    assert.match(summary.prioritiesLine, /Soukromí/);
    assert.match(summary.pictureLine, /První obraz/);
  });

  it('builds priority FAQ and chat opening without Runtime', () => {
    const faq = coachFaqItemsFromPriorities(['plot', 'layout', 'privacy']);
    assert.equal(faq.length, 3);
    assert.match(faq[0]!.question, /\?$/);
    assert.match(faq[0]!.question, /pozemek/i);

    const opening = coachChatOpeningFromPriorities([
      'privacy',
      'layout',
      'operating-costs',
    ]);
    assert.ok(opening);
    assert.match(opening!, /Soukromí/);
    assert.match(opening!, /Dispozice/);
    assert.match(opening!, /úplně nejdůležitější/);
  });

  it('tracks selection and dialog continue events without Runtime', () => {
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
    progress.record({
      type: 'dialog-continue',
      priorityId: 'energy',
      at: 3,
    });
    assert.equal(progress.events().length, 3);
  });

  it('wires coaching dialogue presentation cues', () => {
    const panel = stripComments(read('PriorityConversationPanel.tsx'));
    assert.match(panel, /priority-conversation-question-intent/);
    assert.match(panel, /priority-conversation-interpretation/);
    assert.match(panel, /priority-conversation-dialog-continue/);
    assert.match(panel, /PRIORITY_CONVERSATION_DIALOG_CONTINUE/);
    assert.match(panel, /priority-conversation-progress/);
    assert.match(panel, /priority-conversation-audit-service/);
    assert.match(panel, /priority-conversation-hypothesis/);
    assert.match(
      read('priorityConversation.constants.ts'),
      /PRIORITY_CONVERSATION_DIALOG_CONTINUE = 'Pokračovat'/,
    );
    assert.equal(panel.includes('Hlavní'), false);

    const hook = stripComments(read('usePriorityConversation.ts'));
    assert.match(hook, /continueDialog/);
    assert.match(hook, /dialogBeat/);
    assert.equal(hook.includes('CONIS_QUIZ_ADVANCE_MS'), false);
    assert.equal(hook.includes('dispatch('), false);
    assert.equal(hook.includes('@embed-engine/runtime'), false);

    for (const name of readdirSync(here).filter(
      (file) =>
        (file.toLowerCase().includes('conversation') ||
          file.toLowerCase().includes('coaching') ||
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
