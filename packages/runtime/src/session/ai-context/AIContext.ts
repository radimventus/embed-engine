import type { DecisionOutcomeContract } from "../decision-outcome";
import type { DecisionTerminalContract } from "../decision-terminal";

/**
 * AI Context — structured, machine-readable projection for LLM consumption (CAP-AI-001 / PT-006).
 * Deterministic projection — never UI, never prompts, never semantic authorship.
 *
 * Invariant: AIContext is composed exclusively from DecisionTerminal.
 * Forbidden: Story → AI, Outcome → AI (direct), Interpretation → AI, Presentation → AI,
 * natural language, prompts, invented recommendations, confidence inventing.
 */

export const AI_CONTEXT_SCHEMA_VERSION = 1 as const;

/**
 * Canonical AI Context — projection of Terminal (and its nested Outcome).
 * Contains only Runtime identifiers and machine-readable keys already present on Terminal.
 */
export type AIContext = {
  /** Deterministic identity derived from Terminal id. */
  readonly id: string;
  readonly schemaVersion: typeof AI_CONTEXT_SCHEMA_VERSION;
  /** Immutable Terminal surface — sole composition input. */
  readonly terminal: DecisionTerminalContract;
  /**
   * Nested Outcome reference (same object as terminal.outcome).
   * Exposed for consumers that bind Outcome fields without walking Terminal.
   * Not a second semantic composition path.
   */
  readonly outcome: DecisionOutcomeContract;
};

/**
 * Public contract for AI Advisor / LLM adapters.
 * Adapters consume AIContext; never compose Runtime semantics.
 */
export type AIContextContract = AIContext;
