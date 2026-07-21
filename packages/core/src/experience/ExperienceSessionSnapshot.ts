import type { Interpretation } from "../cognitive/interpretation/Interpretation";
import type { DecisionStory } from "../decision-layer/DecisionStory";
import type { RuntimeState, RuntimeStatus } from "../runtime/RuntimeState";

/**
 * Session snapshot exposed to Experience Surfaces (RI-002 / RI-003).
 * Does not expose DecisionState — facts are a read-only projection.
 */
export type ExperienceSessionSnapshot = {
  readonly version: number;
  readonly status: RuntimeStatus;
  readonly interpretation?: Interpretation;
  readonly decisionStory?: DecisionStory | null;
  readonly facts: Readonly<Record<string, unknown>>;
};

export function toExperienceSessionSnapshot(
  state: RuntimeState,
): ExperienceSessionSnapshot {
  const facts: Record<string, unknown> = {};
  for (const fact of state.decisionState?.facts ?? []) {
    facts[fact.key] = fact.value;
  }

  return Object.freeze({
    version: state.version,
    status: state.status,
    interpretation: state.interpretation,
    decisionStory: state.decisionStory ?? null,
    facts: Object.freeze(facts),
  });
}
