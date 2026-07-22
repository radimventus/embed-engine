import type { DecisionTerminal } from "../decision-terminal";
import {
  AI_CONTEXT_SCHEMA_VERSION,
  type AIContext,
} from "./AIContext";

/**
 * AI Context Reader (CAP-AI-001).
 *
 * Sole input: DecisionTerminal.
 * Forbidden: Interpretation, Story, Moves, Outcome, Presentation as direct inputs.
 * Forbidden: natural language, prompts, recommendations, confidence inventing.
 *
 * Terminal → AIContext. Never Story → AI. Never Outcome → AI (direct).
 */
export function composeAIContext(terminal: DecisionTerminal): AIContext {
  return Object.freeze({
    id: `ai-context:${terminal.id}`,
    schemaVersion: AI_CONTEXT_SCHEMA_VERSION,
    terminal,
    outcome: terminal.outcome,
  });
}
