import { useCallback, useMemo } from 'react';
import type {
  InterpretationEvent,
  InterpretationPriority,
} from '@embed-engine/core/cognitive';

import {
  applyQuestionOpened,
  useApplyCognitiveSignal,
} from '../../cognitive/CognitiveRuntimeContext';
import { useExperienceSession } from '../../cognitive/ExperienceBindingProvider';
import {
  PRIORITY_DISPLAY_ORDER,
  PRIORITY_MINIMUM_SELECTION,
  PRIORITY_SELECTED_WEIGHT,
  presentationForPriorityId,
  type PriorityPresentation,
} from './priorityPresentation';

export type PriorityCardModel = {
  readonly presentation: PriorityPresentation;
  readonly priority: InterpretationPriority;
  readonly isFocused: boolean;
  readonly percent: number;
};

export type PriorityExperienceStatus = 'loading' | 'empty' | 'ready';

/**
 * Priority Experience — Session snapshot → Interpretation → Signals (S-003).
 * No Runtime / DecisionState access.
 */
export function usePriorityExperience() {
  const session = useExperienceSession();
  const applySignal = useApplyCognitiveSignal();
  const interpretation = session.interpretation;

  const status: PriorityExperienceStatus = useMemo(() => {
    if (
      session.status === 'idle' ||
      session.status === 'loading' ||
      interpretation === undefined
    ) {
      return 'loading';
    }
    if (interpretation.priorities.length === 0) {
      return 'empty';
    }
    return 'ready';
  }, [interpretation, session.status]);

  const priorityById = useMemo(() => {
    const map = new Map<string, InterpretationPriority>();
    for (const priority of interpretation?.priorities ?? []) {
      map.set(priority.id, priority);
    }
    return map;
  }, [interpretation]);

  const cards: readonly PriorityCardModel[] = useMemo(() => {
    if (interpretation === undefined) {
      return [];
    }

    const orderedIds =
      interpretation.priorities.length > 0
        ? PRIORITY_DISPLAY_ORDER.filter((id) => priorityById.has(id)).concat(
            interpretation.priorities
              .map((priority) => priority.id)
              .filter((id) => !PRIORITY_DISPLAY_ORDER.includes(id)),
          )
        : [];

    return orderedIds.map((id) => {
      const priority = priorityById.get(id)!;
      return {
        presentation: presentationForPriorityId(id),
        priority,
        isFocused: priority.weight === 1,
        percent: Math.round(priority.weight * 100),
      };
    });
  }, [interpretation, priorityById]);

  const focusPriority = useCallback(
    (id: string) => {
      const title = presentationForPriorityId(id).title;
      applyQuestionOpened(applySignal, id, `Priority focus: ${title}`);
    },
    [applySignal],
  );

  const selectedCount = useMemo(
    () =>
      (interpretation?.priorities ?? []).filter(
        (priority) => priority.weight > PRIORITY_SELECTED_WEIGHT,
      ).length,
    [interpretation],
  );

  const elevatedPriorities = useMemo(
    () =>
      [...(interpretation?.priorities ?? [])]
        .filter((priority) => priority.reason)
        .sort((left, right) => right.weight - left.weight),
    [interpretation],
  );

  const events: readonly InterpretationEvent[] = interpretation?.events ?? [];

  return {
    status,
    sessionVersion: session.version,
    cards,
    elevatedPriorities,
    events,
    selectedCount,
    minimumSelection: PRIORITY_MINIMUM_SELECTION,
    minimumMet: selectedCount >= PRIORITY_MINIMUM_SELECTION,
    activeTopic: interpretation?.activeTopic,
    nextAction: interpretation?.nextAction,
    focusPriority,
  };
}
