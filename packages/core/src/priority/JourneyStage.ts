/**
 * Priority Domain Model §2.6 — JourneyStage.
 *
 * Position in Universal Journey (Blueprint §2).
 * Order is mandatory; stages must not be reordered or skipped.
 */

export const JOURNEY_STAGES = [
  "Selection",
  "Confirmation",
  "Transition",
  "Interpretation",
  "HouseMapping",
  "FollowUp",
] as const;

export type JourneyStage = (typeof JOURNEY_STAGES)[number];
