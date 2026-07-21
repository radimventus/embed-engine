import { useMemo } from 'react';
import {
  createDecisionContext,
  type DecisionContext,
  type Interpretation,
} from '@embed-engine/core';
import {
  interpretAndCompose,
  type Experience,
  type PriorityId,
  type PrioritySelection,
} from '@embed-engine/core/experience';

import { DECISION_CATEGORIES } from './decision-cards.constants';

const PILOT_OBJECT_ID = 'house-modern-01';

type DecisionCardState = {
  selected: boolean;
  importance: number;
};

/**
 * Priority → DecisionContext → InterpretationEngine → ExperienceComposer.
 * Pure reactive wiring — no semantic logic in the app.
 */
export function usePriorityReactiveExperience(
  cards: Record<string, DecisionCardState>,
): {
  readonly priorities: PrioritySelection;
  readonly context: DecisionContext;
  readonly interpretation: Interpretation;
  readonly experience: Experience;
} {
  const priorities = useMemo((): PrioritySelection => {
    const selected = DECISION_CATEGORIES.map((category) => category.id)
      .filter((id) => cards[id]?.selected)
      .map((id) => id as PriorityId);

    return Object.freeze({
      selected: Object.freeze(selected),
    });
  }, [cards]);

  const context = useMemo(
    () => createDecisionContext({ priorities }),
    [priorities],
  );

  const { interpretation, experience } = useMemo(
    () =>
      interpretAndCompose({
        object: { id: PILOT_OBJECT_ID },
        context,
      }),
    [context],
  );

  return { priorities, context, interpretation, experience };
}
