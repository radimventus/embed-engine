import type { DecisionOutcome } from "../decision-outcome";
import {
  DECISION_TERMINAL_SCHEMA_VERSION,
  type DecisionTerminal,
} from "./DecisionTerminal";

/**
 * Decision Terminal Composer (CAP-DTR-001).
 *
 * Sole input: DecisionOutcome.
 * Forbidden: Interpretation, Story, Moves, Presentation as direct inputs.
 * Forbidden: recomputing or enriching Outcome semantics.
 *
 * Outcome → Terminal. Never Story → Terminal. Never Interpretation → Terminal.
 */
export function composeDecisionTerminal(
  outcome: DecisionOutcome,
): DecisionTerminal {
  return Object.freeze({
    id: `terminal:${outcome.id}`,
    schemaVersion: DECISION_TERMINAL_SCHEMA_VERSION,
    outcome,
  });
}
