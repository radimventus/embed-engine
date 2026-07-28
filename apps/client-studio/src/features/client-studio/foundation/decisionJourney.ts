export type DecisionJourneyScene = {
  readonly id: string;
  readonly label: string;
};

const BASE_DECISION_JOURNEY_SCENES: readonly DecisionJourneyScene[] = [
  { id: 'journey-scene-orientation', label: 'Orientace' },
  { id: 'journey-scene-interpretation', label: 'Interpretace' },
  { id: 'journey-scene-decision', label: 'Rozhodnutí' },
] as const;

/** Three meaning-driven guided scenes — not raw technical sections. */
export function decisionJourneyScenes(): readonly DecisionJourneyScene[] {
  return BASE_DECISION_JOURNEY_SCENES;
}
