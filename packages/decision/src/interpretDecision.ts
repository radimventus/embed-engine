import type { ExperienceModel } from "@embed-engine/model";

import type { DecisionDefinition } from "./DecisionDefinition";
import type { DecisionRegistry } from "./DecisionRegistry";
import type { DecisionState } from "./DecisionState";

/**
 * Pure interpretation: DecisionRegistry + DecisionState (+ scene) → ExperienceModel.
 * No mutation, no IO, no Runtime services.
 */
export function interpretDecision(
  registry: DecisionRegistry,
  state: DecisionState,
  currentSceneId: string,
): ExperienceModel {
  const answers: Record<string, unknown> = Object.fromEntries(
    state.answers.entries(),
  );

  const decisions = [...state.answers.keys()]
    .map((id) => registry.get(id))
    .filter((definition): definition is DecisionDefinition => definition !== undefined)
    .map((definition) => ({
      id: definition.id,
      question: definition.question,
      type: definition.type,
    }));

  return {
    currentSceneId,
    answers,
    decisions,
  };
}
