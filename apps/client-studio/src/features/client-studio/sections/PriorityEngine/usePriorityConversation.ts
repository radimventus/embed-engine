import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { prioritySupplementaryQuestionId } from '@embed-engine/platform-access';

import { scrollToSection, scrollElementIntoView, PRIORITY_BRIDGE_ANCHOR_ID } from '../../foundation/scrollToSection';
import { captureJourneyStageFromSection } from '../../foundation/journeyStageCapture';
import { PILOT_SECTION_IDS } from '../../pilot/pilotVocabulary';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import {
  buildPriorityHypothesisSummary,
  coachingProgressPercent,
  interpretationFor,
  questionIntentFor,
  type PriorityHypothesisSummary,
} from './priorityCoachingDialogue';
import {
  CONIS_MICROINTERACTION_MS,
  CONIS_THINKING_MS,
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

export type DialogBeat = 'question' | 'thinking' | 'interpretation';

export type PriorityConversationView = {
  readonly phase: PriorityConversationPhase;
  readonly dialogBeat: DialogBeat;
  readonly selectionOrder: readonly string[];
  readonly selectedCount: number;
  readonly tags: readonly PriorityTagView[];
  readonly currentQuestion: PriorityDialogQuestion | null;
  readonly questionIntent: string | null;
  readonly interpretation: string | null;
  readonly answers: Readonly<Record<string, string>>;
  readonly hypothesis: PriorityHypothesisSummary | null;
  readonly progressPercent: number;
  readonly canAddMore: boolean;
  readonly isAdvancing: boolean;
  readonly pendingOptionId: string | null;
  readonly progress: PriorityConversationProgress;
  readonly finishSelection: () => void;
  readonly addMorePriorities: () => void;
  /** Scrolls to chapter summary — only on explicit Pokračovat (CAP UX3 08). */
  readonly continueToSummary: () => void;
  readonly acknowledgePrep: () => void;
  readonly answerQuestion: (priorityId: string, optionId: string) => void;
  readonly continueDialog: () => void;
  readonly continueToFaq: () => void;
  readonly askConis: () => void;
  readonly continueToNextChapter: () => void;
  readonly continueWithPlotCheck: () => void;
  readonly continueWithPlotFind: () => void;
  readonly continueWithReport: () => void;
};

function focusAdvisorChat(): void {
  scrollToSection(PILOT_SECTION_IDS.aiAdvisor);
  window.setTimeout(() => {
    const root = document.getElementById(PILOT_SECTION_IDS.aiAdvisor);
    const field = root?.querySelector<HTMLTextAreaElement>('textarea');
    field?.focus();
  }, 450);
}

function scrollToConversion(): void {
  scrollToSection(PILOT_SECTION_IDS.audit);
}

/**
 * Priority coaching dialogue (PT-PRIORITY-CONVERSATION-03).
 * User-paced beats with thinking pause.
 * Supplementary answers persist as AnswerQuestion on the Decision Session.
 */
export function usePriorityConversation(): PriorityConversationView {
  const { cards, selectedCount, categories } = usePriorityExperience();
  const { dispatch } = useDecisionSessionRuntime();
  const progressRef = useRef<PriorityConversationProgress>(
    createPriorityConversationProgress(),
  );
  const progress = progressRef.current;
  const advanceTimerRef = useRef<number | null>(null);
  const thinkingTimerRef = useRef<number | null>(null);

  const [selectionOrder, setSelectionOrder] = useState<string[]>([]);
  const [selectionClosed, setSelectionClosed] = useState(false);
  const [awaitingMore, setAwaitingMore] = useState(false);
  const [prepAcknowledged, setPrepAcknowledged] = useState(false);
  const [dialogQueue, setDialogQueue] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [dialogBeat, setDialogBeat] = useState<DialogBeat>('question');
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [activePriorityId, setActivePriorityId] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null);
  const phaseRef = useRef<PriorityConversationPhase>('instruction');
  const intensityRef = useRef<Record<string, number>>({});

  const clearTimers = useCallback(() => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    if (thinkingTimerRef.current !== null) {
      window.clearTimeout(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const runAfterConfirmation = useCallback(
    (action: () => void, delayMs: number = CONIS_MICROINTERACTION_MS) => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
      setIsAdvancing(true);
      advanceTimerRef.current = window.setTimeout(() => {
        action();
        setIsAdvancing(false);
        advanceTimerRef.current = null;
      }, delayMs);
    },
    [],
  );

  const resetDialogState = useCallback(() => {
    clearTimers();
    setDialogQueue([]);
    setAnswers({});
    setDialogBeat('question');
    setInterpretation(null);
    setActivePriorityId(null);
    setPendingOptionId(null);
  }, [clearTimers]);

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
        resetDialogState();
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
  }, [cards, progress, resetDialogState]);

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
    if (dialogBeat === 'interpretation' || dialogBeat === 'thinking') {
      return false;
    }
    return dialogQueue.every((id) => answers[id] !== undefined);
  }, [answers, dialogBeat, dialogQueue]);

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
    if (
      (dialogBeat === 'thinking' || dialogBeat === 'interpretation') &&
      activePriorityId
    ) {
      return dialogQuestionFor(activePriorityId);
    }
    const nextId = dialogQueue.find((id) => answers[id] === undefined);
    if (nextId === undefined) {
      return null;
    }
    return dialogQuestionFor(nextId);
  }, [activePriorityId, answers, dialogBeat, dialogQueue, phase]);

  const questionIntent = useMemo(() => {
    if (phase !== 'dialog' || dialogBeat !== 'question' || !currentQuestion) {
      return null;
    }
    return questionIntentFor(currentQuestion.priorityId);
  }, [currentQuestion, dialogBeat, phase]);

  const hypothesis = useMemo((): PriorityHypothesisSummary | null => {
    if (phase !== 'complete') {
      return null;
    }
    return buildPriorityHypothesisSummary({ tags, answers });
  }, [answers, phase, tags]);

  const committedDialogAnswers = Object.keys(answers).filter((id) =>
    dialogQueue.includes(id),
  ).length;

  const progressPercent = coachingProgressPercent({
    phase,
    selectedCount,
    dialogAnswered: committedDialogAnswers,
    dialogTotal: dialogQueue.length,
    isInterpreting: dialogBeat === 'interpretation',
    isThinking: dialogBeat === 'thinking',
  });

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
      setDialogBeat('question');
      setInterpretation(null);
      setActivePriorityId(null);
      setPendingOptionId(null);
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

  /** After quiz complete — scroll to summary only when user clicks Pokračovat. */
  const continueToSummary = () => {
    if (phase !== 'complete' || isAdvancing) {
      return;
    }
    const target = document.getElementById(PRIORITY_BRIDGE_ANCHOR_ID);
    if (target) {
      scrollElementIntoView(target, 700, { easing: 'linear' });
    }
  };

  const acknowledgePrep = () => {
    if (isAdvancing) {
      return;
    }
    runAfterConfirmation(() => {
      setPrepAcknowledged(true);
      setDialogBeat('question');
      setInterpretation(null);
      setActivePriorityId(null);
      setPendingOptionId(null);
    });
  };

  const answerQuestion = (priorityId: string, optionId: string) => {
    if (dialogBeat !== 'question' || isAdvancing || thinkingTimerRef.current) {
      return;
    }

    const isFinalQuestion =
      dialogQueue.filter((id) => answers[id] === undefined).length === 1;

    setPendingOptionId(optionId);
    setActivePriorityId(priorityId);
    setInterpretation(null);
    progress.record({
      type: 'dialog-answer',
      priorityId,
      optionId,
      at: Date.now(),
    });
    dispatch({
      type: 'AnswerQuestion',
      questionId: prioritySupplementaryQuestionId(priorityId),
      answerId: optionId,
    });

    if (isFinalQuestion) {
      setAnswers((current) => ({ ...current, [priorityId]: optionId }));
      setDialogBeat('question');
      setActivePriorityId(null);
      setPendingOptionId(null);
      return;
    }

    setDialogBeat('thinking');
    progress.record({
      type: 'dialog-thinking',
      priorityId,
      at: Date.now(),
    });

    thinkingTimerRef.current = window.setTimeout(() => {
      setAnswers((current) => ({ ...current, [priorityId]: optionId }));
      setInterpretation(interpretationFor(priorityId, optionId));
      setDialogBeat('interpretation');
      thinkingTimerRef.current = null;
    }, CONIS_THINKING_MS);
  };

  const continueDialog = () => {
    if (dialogBeat !== 'interpretation' || activePriorityId === null) {
      return;
    }
    const priorityId = activePriorityId;
    progress.record({
      type: 'dialog-continue',
      priorityId,
      at: Date.now(),
    });
    setDialogBeat('question');
    setInterpretation(null);
    setActivePriorityId(null);
    setPendingOptionId(null);
  };

  const continueToFaq = () => {
    progress.record({ type: 'completion-path', path: 'faq', at: Date.now() });
    captureJourneyStageFromSection(PILOT_SECTION_IDS.aiAdvisor);
    scrollToSection(PILOT_SECTION_IDS.aiAdvisor);
  };

  const askConis = () => {
    progress.record({ type: 'completion-path', path: 'chat', at: Date.now() });
    captureJourneyStageFromSection(PILOT_SECTION_IDS.aiAdvisor);
    focusAdvisorChat();
  };

  const continueToNextChapter = () => {
    progress.record({ type: 'completion-path', path: 'next', at: Date.now() });
    captureJourneyStageFromSection(PILOT_SECTION_IDS.audit);
    scrollToConversion();
  };

  const continueWithPlotCheck = () => {
    progress.record({
      type: 'completion-path',
      path: 'plot-check',
      at: Date.now(),
    });
    captureJourneyStageFromSection(PILOT_SECTION_IDS.audit);
    scrollToConversion();
  };

  const continueWithPlotFind = () => {
    progress.record({
      type: 'completion-path',
      path: 'plot-find',
      at: Date.now(),
    });
    captureJourneyStageFromSection(PILOT_SECTION_IDS.audit);
    scrollToConversion();
  };

  const continueWithReport = () => {
    progress.record({
      type: 'completion-path',
      path: 'report',
      at: Date.now(),
    });
    captureJourneyStageFromSection(PILOT_SECTION_IDS.audit);
    scrollToConversion();
  };

  return {
    phase,
    dialogBeat,
    selectionOrder,
    selectedCount,
    tags,
    currentQuestion,
    questionIntent,
    interpretation,
    answers,
    hypothesis,
    progressPercent,
    canAddMore: selectedCount < categories.length,
    isAdvancing,
    pendingOptionId,
    progress,
    finishSelection,
    addMorePriorities,
    continueToSummary,
    acknowledgePrep,
    answerQuestion,
    continueDialog,
    continueToFaq,
    askConis,
    continueToNextChapter,
    continueWithPlotCheck,
    continueWithPlotFind,
    continueWithReport,
  };
}
