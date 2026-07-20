import type { ReactExperienceModel } from "@embed-engine/model";
import type { HousePackage } from "@embed-engine/object-house";

import { buildInterpretation } from "./buildInterpretation";
import type { DecisionRegistry } from "./DecisionRegistry";
import type { DecisionState } from "./DecisionState";
import { projectReactExperience } from "./projectReactExperience";

/**
 * Orchestrates DecisionState → Interpretation → ReactExperienceModel.
 */
export function interpretDecision(
  registry: DecisionRegistry,
  state: DecisionState,
  currentSceneId: string,
  house: HousePackage | null = null,
): ReactExperienceModel {
  const interpretation = buildInterpretation(state);

  return projectReactExperience(
    registry,
    state,
    interpretation,
    currentSceneId,
    house,
  );
}
