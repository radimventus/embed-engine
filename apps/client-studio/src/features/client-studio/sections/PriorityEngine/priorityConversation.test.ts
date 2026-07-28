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
  CONIS_THINKING_MS,
  dialogQuestionFor,
  pickDialogPriorityIds,
  PRIORITY_BRIDGE_TITLE,
  PRIORITY_CONVERSATION_INTRO_LINES,
  PRIORITY_CONVERSATION_MINIMUM,
  PRIORITY_CONVERSATION_PREP_TITLE,
  PRIORITY_CONVERSATION_START_HEADING,
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

const FORBIDDEN = [
  'Výběr je zaznamenán',
  'Pokračujte ve výběru',
  'Data byla',
  'VYBERTE',
  'Vyberte',
  'Potřebuji informace',
  'Pokračovat v Auditu',
  'Audit jako',
];

describe('PT-PRIORITY-CONVERSATION-03 decision conversation', () => {
  it('keeps coaching intents, thinking pause, and value language', () => {
    for (const question of Object.values(PRIORITY_DIALOG_QUESTIONS)) {
      assert.ok(questionIntentFor(question.priorityId).length > 10);
      for (const option of question.options) {
        assert.ok(
          interpretationFor(question.priorityId, option.id).length > 10,
        );
      }
    }
    assert.equal(PRIORITY_CONVERSATION_MINIMUM, 3);
    assert.equal(PRIORITY_DIALOG_QUESTION_COUNT, 3);
    assert.ok(CONIS_THINKING_MS >= 700 && CONIS_THINKING_MS <= 1000);
    assert.match(PRIORITY_CONVERSATION_INTRO_LINES.join(' '), /Conis/i);
    assert.equal(PRIORITY_CONVERSATION_INTRO_LINES[0], 'Dobrý den, jmenuji se Conis.');
    assert.match(PRIORITY_CONVERSATION_START_LINES.join(' '), /označte alespoň tři/i);
    assert.match(PRIORITY_CONVERSATION_START_HEADING, /^Začněme$/);
    assert.match(PRIORITY_CONVERSATION_PREP_TITLE, /Už rozumím/);
    assert.match(PRIORITY_BRIDGE_TITLE, /Už rozumím/);
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
        phase: 'complete',
        selectedCount: 3,
        dialogAnswered: 3,
        dialogTotal: 3,
        isInterpreting: false,
      }),
      100,
    );

    const summary = buildPriorityHypothesisSummary({
      tags: [
        { id: 'privacy', title: 'Soukromí' },
        { id: 'layout', title: 'Dispozice' },
      ],
      answers: { privacy: 'garden', layout: 'open-space' },
    });
    assert.match(summary.title, /Už rozumím/);
    assert.match(summary.lead, /Děkuji/);
  });

  it('builds FAQ and chat opening without Audit terminology', () => {
    const faq = coachFaqItemsFromPriorities(['plot', 'layout', 'privacy']);
    assert.ok(faq.length > 3);
    assert.equal(faq[0]!.id, 'coach-faq:plot');
    assert.equal(faq[1]!.id, 'coach-faq:layout');
    assert.equal(faq[2]!.id, 'coach-faq:privacy');
    for (const item of faq) {
      assert.equal(item.question.includes('Audit'), false);
      assert.equal(item.answer.includes('Audit'), false);
    }

    const opening = coachChatOpeningFromPriorities([
      'privacy',
      'layout',
      'operating-costs',
    ]);
    assert.ok(opening);
    assert.match(opening!, /Soukromí/);
    assert.match(opening!, /Rád bych/);
    assert.match(opening!, /úplně nejdůležitější/);
    assert.equal(opening!.includes('Audit'), false);
  });

  it('tracks thinking and continue events without Runtime', () => {
    const progress = createPriorityConversationProgress();
    assert.deepEqual(nextSelectionOrder([], ['energy']).order, ['energy']);
    progress.record({
      type: 'dialog-answer',
      priorityId: 'energy',
      optionId: 'comfort',
      at: 1,
    });
    progress.record({
      type: 'dialog-thinking',
      priorityId: 'energy',
      at: 2,
    });
    progress.record({
      type: 'dialog-continue',
      priorityId: 'energy',
      at: 3,
    });
    assert.equal(progress.events().length, 3);
  });

  it('wires conversation-03 presentation cues', () => {
    const panel = stripComments(read('PriorityConversationPanel.tsx'));
    assert.match(panel, /priority-conversation-thinking|ConisThinkingDots/);
    assert.match(panel, /priority-conversation-interpretation/);
    assert.match(panel, /priority-conversation-dialog-continue/);
    assert.match(panel, /PRIORITY_ENGINE_CONVERSATION_PANEL_CLASS/);
    assert.equal(panel.includes('maxHeight'), false);
    assert.equal(panel.includes('Pokračovat v Auditu'), false);
    assert.equal(panel.includes('Hlavní'), false);

    const bridge = stripComments(read('PriorityChapterBridge.tsx'));
    assert.match(bridge, /priority-chapter-bridge/);
    assert.match(bridge, /priority-bridge-report/);
    assert.match(bridge, /PRIORITY_BRIDGE_REPORT_TITLE/);
    assert.equal(bridge.includes('Audit'), false);
    assert.match(
      read('priorityConversation.constants.ts'),
      /Osobní rozhodovací zpráva/,
    );

    const hook = stripComments(read('usePriorityConversation.ts'));
    assert.match(hook, /CONIS_THINKING_MS/);
    assert.match(hook, /thinking/);
    assert.match(hook, /continueToNextChapter/);
    assert.equal(hook.includes('dispatch('), false);
    assert.equal(hook.includes('@embed-engine/runtime'), false);

    const engine = stripComments(read('PriorityEngine.tsx'));
    assert.match(engine, /PriorityConversationProvider/);
    assert.match(engine, /PriorityChapterBridge/);

    for (const name of readdirSync(here).filter(
      (file) =>
        (file.toLowerCase().includes('conversation') ||
          file.toLowerCase().includes('coaching') ||
          file.toLowerCase().includes('bridge') ||
          file.startsWith('Conis') ||
          file === 'SectionHeader.tsx') &&
        (file.endsWith('.ts') || file.endsWith('.tsx')) &&
        !file.endsWith('.test.ts'),
    )) {
      const source = stripComments(read(name));
      assert.equal(source.includes('Lorem'), false, `${name} placeholder`);
      for (const phrase of FORBIDDEN) {
        assert.equal(
          source.includes(phrase),
          false,
          `${name} must not include: ${phrase}`,
        );
      }
    }
  });
});
