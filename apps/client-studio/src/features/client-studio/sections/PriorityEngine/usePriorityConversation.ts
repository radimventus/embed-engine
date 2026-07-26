import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { scrollToSection } from '../../foundation/scrollToSection';
import { PILOT_SECTION_IDS } from '../../pilot/pilotVocabulary';
import {
  CONIS_MICROINTERACTION_MS,
  dialogQuestionFor,
  pickDialogPriorityIds,
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

export type PriorityTagView = {
  readonly id: string;
  readonly title: string;
  readonly percent: number;
};

export type PriorityConversationView = {
  readonly phase: PriorityConversationPhase;
  readonly selectionOrder: readonly string[];
  readonly selectedCount: number;
  readonly tags: readonly PriorityTagView[];
  readonly currentQuestion: PriorityDialogQuestion | null;
  readonly answers: Readonly<Record<string, string>>;
  readonly canAddMore: boolean;
  readonly isAdvancing: boolean;
  readonly pendingOptionId: string | null;
  readonly progress: PriorityConversationProgress;
  readonly finishSelection: () => void;
  readonly addMorePriorities: () => void;
  readonly acknowledgePrep: () => void;
  readonly answerQuestion: (priorityId: string, optionId: string) => void;
  readonly continueToFaq: () => void;
  readonly askConis: () => void;
};

function focusAdvisorChat(): void {
  scrollToSection(PILOT_SECTION_IDS.aiAdvisor);
  window.setTimeout(() => {
    const root = document.getElementById(PILOT_SECTION_IDS.aiAdvisor);
    const field = root?.querySelector<HTMLTextAreaElement>('textarea');
    field?.focus();
  }, 450);
}

/**
 * Priority right-panel dramaturgy (PT-PRIORITY-TUNING-02).
 * Presentation pacing only — Conis never interrupts mid-task; no Runtime dispatch.
 */
export function usePriorityConversation(): PriorityConversationView {
  const { cards, selectedCount, categories } = usePriorityExperience();
  const progressRef = useRef<PriorityConversationProgress>(
    createPriorityConversationProgress(),
  );
  const progress = progressRef.current;
  const advanceTimerRef = useRef<number | null>(null);

  const [selectionOrder, setSelectionOrder] = useState<string[]>([]);
  const [selectionClosed, setSelectionClosed] = useState(false);
  const [awaitingMore, setAwaitingMore] = useState(false);
  const [prepAcknowledged, setPrepAcknowledged] = useState(false);
  const [dialogQueue, setDialogQueue] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null);
  const phaseRef = useRef<PriorityConversationPhase>('instruction');
  const intensityRef = useRef<Record<string, number>>({});

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  const runAfterConfirmation = useCallback((action: () => void) => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
    }
    setIsAdvancing(true);
    advanceTimerRef.current = window.setTimeout(() => {
      action();
      setPendingOptionId(null);
      setIsAdvancing(false);
      advanceTimerRef.current = null;
    }, CONIS_MICROINTERACTION_MS);
  }, []);

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

      if (next.added.length > 0 || next.removed.length > 0) {
        setAwaitingMore(false);
      }

      if (next.order.length < PRIORITY_CONVERSATION_MINIMUM) {
        setSelectionClosed(false);
        setPrepAcknowledged(false);
        setDialogQueue([]);
        setAnswers({});
      }

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
    if (dialogQueue.length === 0) {
      return false;
    }
    return dialogQueue.every((id) => answers[id] !== undefined);
  }, [answers, dialogQueue]);

  const phase: PriorityConversationPhase = (() => {
    if (selectedCount <= 0) {
      return 'instruction';
    }
    if (!selectionClosed) {
      if (
        selectedCount >= PRIORITY_CONVERSATION_MINIMUM &&
        !awaitingMore
      ) {
        return 'collection-gate';
      }
      return 'collecting';
    }
    if (!prepAcknowledged) {
      return 'prep';
    }
    if (!dialogComplete) {
      return 'dialog';
    }
    return 'complete';
  })();

  useEffect(() => {
    if (phaseRef.current === phase) {
      return;
    }
    phaseRef.current = phase;
    progress.record({ type: 'phase', phase, at: Date.now() });
  }, [phase, progress]);

  const tags = useMemo((): PriorityTagView[] => {
    const titleById = Object.fromEntries(
      categories.map((category) => [category.id, category.title]),
    );
    return selectionOrder.map((id) => ({
      id,
      title: titleById[id] ?? id,
      percent: Math.round((cards[id]?.importance ?? 0) * 100),
    }));
  }, [cards, categories, selectionOrder]);

  const currentQuestion = useMemo((): PriorityDialogQuestion | null => {
    if (phase !== 'dialog') {
      return null;
    }
    const nextId = dialogQueue.find((id) => answers[id] === undefined);
    if (nextId === undefined) {
      return null;
    }
    return dialogQuestionFor(nextId);
  }, [answers, dialogQueue, phase]);

  const finishSelection = () => {
    if (selectedCount < PRIORITY_CONVERSATION_MINIMUM || isAdvancing) {
      return;
    }
    runAfterConfirmation(() => {
      const intensityById = Object.fromEntries(
        selectionOrder.map((id) => [id, cards[id]?.importance ?? 0]),
      );
      const queue = pickDialogPriorityIds(selectionOrder, intensityById);
      setDialogQueue(queue);
      setAnswers({});
      setSelectionClosed(true);
      setAwaitingMore(false);
      setPrepAcknowledged(false);
      progress.record({
        type: 'selection-finished',
        order: selectionOrder,
        at: Date.now(),
      });
    });
  };

  const addMorePriorities = () => {
    if (isAdvancing) {
      return;
    }
    setAwaitingMore(true);
    progress.record({ type: 'add-more', at: Date.now() });
  };

  const acknowledgePrep = () => {
    if (isAdvancing) {
      return;
    }
    runAfterConfirmation(() => {
      setPrepAcknowledged(true);
    });
  };

  const answerQuestion = (priorityId: string, optionId: string) => {
    if (isAdvancing) {
      return;
    }
    setPendingOptionId(optionId);
    runAfterConfirmation(() => {
      setAnswers((current) => ({ ...current, [priorityId]: optionId }));
      progress.record({
        type: 'dialog-answer',
        priorityId,
        optionId,
        at: Date.now(),
      });
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
    tags,
    currentQuestion,
    answers,
    canAddMore: selectedCount < categories.length,
    isAdvancing,
    pendingOptionId,
    progress,
    finishSelection,
    addMorePriorities,
    acknowledgePrep,
    answerQuestion,
    continueToFaq,
    askConis,
  };
}
