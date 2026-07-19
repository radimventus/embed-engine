import type { ExperienceModel } from "@embed-engine/model";
import type { HousePackage } from "@embed-engine/object-house";
import type { ExecutionContext, Interpreter } from "@embed-engine/core";

import type { DecisionRegistry } from "./DecisionRegistry";
import type { DecisionState } from "./DecisionState";
import { interpretDecision } from "./interpretDecision";

/**
 * Adapter: Core Interpreter contract → pure interpretDecision().
 */
export class DecisionInterpreter implements Interpreter {
  private readonly registry: DecisionRegistry;
  private readonly house: HousePackage | null;

  constructor(
    registry: DecisionRegistry,
    house: HousePackage | null = null,
  ) {
    this.registry = registry;
    this.house = house;
  }

  interpret(context: ExecutionContext): ExperienceModel {
    return interpretDecision(
      this.registry,
      context.state as DecisionState,
      context.currentSceneId,
      this.house,
    );
  }
}
