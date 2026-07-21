import { dispositionPriorityLabel } from '@embed-engine/object-house';
import type { InterpretationPriorityId } from '@embed-engine/core/cognitive';
import { INTERPRETATION_PRIORITY_IDS } from '@embed-engine/core/cognitive';

/**
 * Presentation chrome for Priority cards (labels only).
 * Titles from Behavior Pack presentation (`dispositionPriorityLabel`).
 * Interpretation owns weights / rank / reason / highlight.
 */
export type PriorityPresentation = {
  readonly id: InterpretationPriorityId | string;
  readonly title: string;
};

/** Presentation threshold: “selected” for pilot progress chrome (not Cognitive). */
export const PRIORITY_SELECTED_WEIGHT = 0.5;

/** Pilot UX: encourage exploring at least this many elevated priorities. */
export const PRIORITY_MINIMUM_SELECTION = 3;

export function titleForPriorityId(id: string): string {
  return dispositionPriorityLabel(id);
}

export function presentationForPriorityId(id: string): PriorityPresentation {
  return { id, title: titleForPriorityId(id) };
}

/** Stable display order matching Cognitive INTERPRETATION_PRIORITY_IDS. */
export const PRIORITY_DISPLAY_ORDER: readonly string[] = INTERPRETATION_PRIORITY_IDS;
