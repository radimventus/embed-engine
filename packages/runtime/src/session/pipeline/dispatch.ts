import type { HousePackage } from "@embed-engine/object-house";

import type { DecisionEvent } from "../DecisionEvent";
import type { DecisionSession } from "../DecisionSession";
import {
  projectFromInterpretation,
  type SessionExperience,
} from "../projectDecisionSession";
import { applyDecisionEvent } from "./applyEvent";
import { commandToEvent } from "./commandToEvent";
import {
  interpretDecisionSession,
  type SessionInterpretation,
} from "./interpretSession";
import type { RuntimeCommand } from "./RuntimeCommand";
import {
  validateCommand,
  type PipelineError,
} from "./validateCommand";

export type DispatchSuccess = {
  readonly ok: true;
  readonly session: DecisionSession;
  readonly event: DecisionEvent;
  readonly interpretation: SessionInterpretation;
  readonly experience: SessionExperience;
};

export type DispatchFailure = {
  readonly ok: false;
  readonly errors: readonly PipelineError[];
  /** Session is unchanged on failure. */
  readonly session: DecisionSession;
};

export type DispatchResult = DispatchSuccess | DispatchFailure;

export type DispatchCommandInput = {
  readonly session: DecisionSession;
  readonly housePackage: HousePackage;
  readonly command: RuntimeCommand;
  readonly now?: number;
};

/**
 * Canonical Runtime Event Pipeline (CAP-HP-002.5):
 * Command → Validation → Decision Event → Mutation → Interpretation → Projection
 *
 * Synchronous and deterministic. No UI may bypass this path.
 */
export function dispatchCommand(input: DispatchCommandInput): DispatchResult {
  const { session, housePackage, command } = input;
  const now = input.now ?? Date.now();

  const validated = validateCommand({ session, housePackage, command });
  if (!validated.ok) {
    return {
      ok: false,
      errors: validated.errors,
      session,
    };
  }

  const event = commandToEvent(command, now);
  const nextSession = applyDecisionEvent(session, event);
  const interpretation = interpretDecisionSession(nextSession, housePackage);
  const projected = projectFromInterpretation(interpretation, housePackage);

  if (!projected.ok) {
    return {
      ok: false,
      errors: [
        {
          code: "HP_PROJECTION_FAILED",
          message: projected.message,
        },
      ],
      session,
    };
  }

  return {
    ok: true,
    session: nextSession,
    event,
    interpretation,
    experience: projected.experience,
  };
}
