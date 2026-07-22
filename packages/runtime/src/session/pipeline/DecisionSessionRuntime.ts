import type { HousePackage } from "@embed-engine/object-house";

import { createDecisionSession } from "../createDecisionSession";
import type { DecisionSession } from "../DecisionSession";
import type { InterpretationRuleset } from "../interpretation";
import { DEFAULT_HOUSE_INTERPRETATION_RULES } from "../interpretation";
import type { SessionExperience } from "../projectDecisionSession";
import { projectFromInterpretation } from "../projectDecisionSession";
import {
  dispatchCommand,
  type DispatchResult,
} from "./dispatch";
import {
  interpretDecisionSession,
  type SessionInterpretation,
} from "./interpretSession";
import type { RuntimeCommand } from "./RuntimeCommand";

export type DecisionSessionRuntimeOptions = {
  readonly housePackage: HousePackage;
  readonly session?: DecisionSession;
  readonly now?: number;
  /** Optional Interpretation Rules — defaults to house session ruleset. */
  readonly rules?: InterpretationRuleset;
};

/**
 * Command-oriented Runtime façade for an active Decision Session.
 * Public surface: dispatch(command). Internal mutation methods are not exposed.
 */
export class DecisionSessionRuntime {
  private readonly housePackage: HousePackage;
  private readonly rules: InterpretationRuleset;
  private session: DecisionSession;
  private interpretation: SessionInterpretation | null = null;
  private experience: SessionExperience | null = null;

  constructor(options: DecisionSessionRuntimeOptions) {
    this.housePackage = options.housePackage;
    this.rules = options.rules ?? DEFAULT_HOUSE_INTERPRETATION_RULES;
    this.session =
      options.session ??
      createDecisionSession({
        housePackage: options.housePackage,
        now: options.now,
      });

    this.interpretation = interpretDecisionSession(
      this.session,
      this.housePackage,
      { rules: this.rules },
    );
    const projected = projectFromInterpretation(
      this.interpretation,
      this.housePackage,
    );
    this.experience = projected.ok ? projected.experience : null;
  }

  /**
   * Canonical entry point for all semantic mutations.
   */
  dispatch(command: RuntimeCommand, now?: number): DispatchResult {
    const result = dispatchCommand({
      session: this.session,
      housePackage: this.housePackage,
      command,
      now,
      rules: this.rules,
    });

    if (result.ok) {
      this.session = result.session;
      this.interpretation = result.interpretation;
      this.experience = result.experience;
    }

    return result;
  }

  getSession(): DecisionSession {
    return this.session;
  }

  getInterpretation(): SessionInterpretation | null {
    return this.interpretation;
  }

  getExperience(): SessionExperience | null {
    return this.experience;
  }

  getHousePackage(): HousePackage {
    return this.housePackage;
  }

  getRules(): InterpretationRuleset {
    return this.rules;
  }
}

export function createDecisionSessionRuntime(
  options: DecisionSessionRuntimeOptions,
): DecisionSessionRuntime {
  return new DecisionSessionRuntime(options);
}
