import { useEffect, useMemo, useRef, useState } from 'react';

import { scrollToSection } from '../../foundation/scrollToSection';
import { PILOT_SECTION_IDS } from '../../pilot/pilotVocabulary';
import {
  dialogQuestionFor,
  PRIORITY_CONVERSATION_MINIMUM,
  type PriorityDialogQuestion,
} from './priorityConversation.constants';
import {
  createPriorityConversationProgress,
  nextSelectionOrder,
  type PriorityConversationPhase,
  type PriorityConversationProgress,
} from './priorityConversationProgress';
import { usePriorityExperience } from './PriorityExperienceProvider';

export type PriorityConversationView = {
  readonly phase: PriorityConversationPhase;
  readonly selectionOrder: readonly string[];
  readonly selectedCount: number;
  readonly currentQuestion: PriorityDialogQuestion | null;
  readonly answers: Readonly<Record<string, string>>;
  readonly progress: PriorityConversationProgress;
  readonly answerQuestion: (priorityId: string, optionId: string) => void;
  readonly continueToFaq: () => void;
  readonly askConis: () => void;
};

function resolvePhase(
  selectedCount: number,
  dialogComplete: boolean,
): PriorityConversationPhase {
  if (selectedCount <= 0) {
    return 'instruction';
  }
  if (selectedCount < PRIORITY_CONVERSATION_MINIMUM) {
    return 'confirmation';
  }
  if (!dialogComplete) {
    return 'dialog';
  }
  return 'complete';
}

function focusAdvisorChat(): void {
  scrollToSection(PILOT_SECTION_IDS.aiAdvisor);
  window.setTimeout(() => {
    const root = document.getElementById(PILOT_SECTION_IDS.aiAdvisor);
    const field = root?.querySelector<HTMLTextAreaElement>('textarea');
    field?.focus();
  }, 450);
}

/**
 * Priority right-panel conversation UX (PT-PRIORITY-DESIGN-02).
 * Reads card selection chrome only — does not dispatch Runtime or interpret.
 */
export function usePriorityConversation(): PriorityConversationView {
  const { cards, selectedCount } = usePriorityExperience();
  const progressRef = useRef<PriorityConversationProgress>(
    createPriorityConversationProgress(),
  );
  const progress = progressRef.current;

  const [selectionOrder, setSelectionOrder] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const phaseRef = useRef<PriorityConversationPhase>('instruction');
  const intensityRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const selectedIds = Object.entries(cards)
      .filter(([, card]) => card.selected)
      .map(([id]) => id);

    setSelectionOrder((previous) => {
      const next = nextSelectionOrder(previous, selectedIds);
      if (
        next.added.length === 0 &&
        next.removed.length === 0 &&
        next.order.length === previous.length
      ) {
        return previous;
      }

      progress.record({
        type: 'priority-change',
        added: next.added,
        removed: next.removed,
        order: next.order,
        at: Date.now(),
      });
      progress.record({
        type: 'priority-count',
        count: next.order.length,
        at: Date.now(),
      });
      progress.record({
        type: 'priority-order',
        order: next.order,
        at: Date.now(),
      });

      if (next.removed.length > 0) {
        setAnswers((current) => {
          const trimmed = { ...current };
          for (const id of next.removed) {
            delete trimmed[id];
          }
          return trimmed;
        });
      }

      return next.order;
    });
  }, [cards, progress]);

  useEffect(() => {
    for (const [priorityId, card] of Object.entries(cards)) {
      if (!card.selected) {
        continue;
      }
      const previous = intensityRef.current[priorityId];
      if (previous === card.importance) {
        continue;
      }
      intensityRef.current[priorityId] = card.importance;
      if (previous === undefined) {
        continue;
      }
      progress.record({
        type: 'intensity',
        priorityId,
        value: card.importance,
        at: Date.now(),
      });
    }
  }, [cards, progress]);

  const dialogComplete = useMemo(() => {
    if (selectionOrder.length < PRIORITY_CONVERSATION_MINIMUM) {
      return false;
    }
    return selectionOrder.every((id) => answers[id] !== undefined);
  }, [answers, selectionOrder]);

  const phase = resolvePhase(selectedCount, dialogComplete);

  useEffect(() => {
    if (phaseRef.current === phase) {
      return;
    }
    phaseRef.current = phase;
    progress.record({ type: 'phase', phase, at: Date.now() });
  }, [phase, progress]);

  const currentQuestion = useMemo((): PriorityDialogQuestion | null => {
    if (phase !== 'dialog') {
      return null;
    }
    const nextId = selectionOrder.find((id) => answers[id] === undefined);
    if (nextId === undefined) {
      return null;
    }
    return dialogQuestionFor(nextId);
  }, [answers, phase, selectionOrder]);

  const answerQuestion = (priorityId: string, optionId: string) => {
    setAnswers((current) => ({ ...current, [priorityId]: optionId }));
    progress.record({
      type: 'dialog-answer',
      priorityId,
      optionId,
      at: Date.now(),
    });
  };

  const continueToFaq = () => {
    progress.record({ type: 'completion-path', path: 'faq', at: Date.now() });
    scrollToSection(PILOT_SECTION_IDS.aiAdvisor);
  };

  const askConis = () => {
    progress.record({ type: 'completion-path', path: 'chat', at: Date.now() });
    focusAdvisorChat();
  };

  return {
    phase,
    selectionOrder,
    selectedCount,
    currentQuestion,
    answers,
    progress,
    answerQuestion,
    continueToFaq,
    askConis,
  };
}
