import type { InterpretationPriorityId } from '@embed-engine/core/cognitive';
import { INTERPRETATION_PRIORITY_IDS } from '@embed-engine/core/cognitive';

/**
 * Presentation chrome for Priority cards (labels only).
 * Not Cognitive truth — Interpretation owns weights / rank / reason / highlight.
 * Isolated temporary catalog until Behavior Pack / i18n supplies titles (Living Experience debt).
 */
export type PriorityPresentation = {
  readonly id: InterpretationPriorityId | string;
  readonly title: string;
};

const PRIORITY_TITLES_CS: Record<string, string> = {
  energy: 'Energie',
  'operating-costs': 'Provozní náklady',
  layout: 'Dispozice',
  privacy: 'Soukromí',
  design: 'Design',
  quality: 'Kvalita',
  plot: 'Pozemek',
  investment: 'Investice',
  maintenance: 'Údržba',
  flexibility: 'Flexibilita',
};

/** Presentation threshold: “selected” for pilot progress chrome (not Cognitive). */
export const PRIORITY_SELECTED_WEIGHT = 0.5;

/** Pilot UX: encourage exploring at least this many elevated priorities. */
export const PRIORITY_MINIMUM_SELECTION = 3;

export function titleForPriorityId(id: string): string {
  return PRIORITY_TITLES_CS[id] ?? id;
}

export function presentationForPriorityId(id: string): PriorityPresentation {
  return { id, title: titleForPriorityId(id) };
}

/** Stable display order matching Cognitive INTERPRETATION_PRIORITY_IDS. */
export const PRIORITY_DISPLAY_ORDER: readonly string[] = INTERPRETATION_PRIORITY_IDS;
