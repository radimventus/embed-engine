/**
 * Priority Domain Model §2.4 — Confirmation.
 *
 * Makes Selection a conscious decision context.
 * Speaks about user intent only — not object quality, scores, or purchase CTA.
 */

import type { ConfirmationMicrocopy } from "./PriorityDefinition";
import type { PrioritySelection } from "./PrioritySelection";

/**
 * Intent-only presentation payload for Confirmation stage.
 * Same units as Content Model Confirmation microcopy.
 */
export type ConfirmationPresentationPayload = ConfirmationMicrocopy;

export type Confirmation = {
  readonly selectionSnapshot: PrioritySelection;
  readonly accepted: boolean;
  readonly presentationPayload: ConfirmationPresentationPayload;
};
