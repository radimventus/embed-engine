export type DecisionJourneyScene = {
  readonly id: string;
  readonly label: string;
};

const BASE_DECISION_JOURNEY_SCENES: readonly DecisionJourneyScene[] = [
  { id: "journey-scene-orientation", label: "Orientace" },
  { id: "journey-scene-priority", label: "Priority" },
  { id: "journey-scene-racio", label: "Racio" },
  { id: "journey-scene-decision", label: "Rozhodnutí" },
] as const;

/** Four meaning-driven guided scenes — not raw technical sections. */
export function decisionJourneyScenes(): readonly DecisionJourneyScene[] {
  return BASE_DECISION_JOURNEY_SCENES;
}
