import type { DecisionOutcomeContract } from "../decision-outcome";

/**
 * Decision Terminal — canonical completion surface of Decision Outcome (CAP-DTR-001 / PT-007).
 * Deterministic Runtime surface — never UI, never semantic authorship.
 *
 * Invariant: Terminal is composed exclusively from DecisionOutcome.
 * Forbidden: Interpretation → Terminal, Story → Terminal, Presentation → Terminal,
 * Outcome recomputation, semantic enrichment.
 */

export const DECISION_TERMINAL_SCHEMA_VERSION = 1 as const;

/**
 * Canonical Decision Terminal — execution surface wrapping immutable Outcome.
 * Introduces no recommendation, confidence, or rationale of its own.
 */
export type DecisionTerminal = {
  /** Deterministic Terminal identity derived from Outcome id. */
  readonly id: string;
  readonly schemaVersion: typeof DECISION_TERMINAL_SCHEMA_VERSION;
  /** Immutable Outcome payload — sole semantic content. */
  readonly outcome: DecisionOutcomeContract;
};

/**
 * Public contract for Client Studio, AI, and integrations.
 * Presentation consumes Terminal; never composes it.
 */
export type DecisionTerminalContract = DecisionTerminal;
