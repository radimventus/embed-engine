import type { Interpretation } from "./Interpretation";
import {
  interpretObject,
  type InterpretObjectInput,
} from "./interpretObject";

/**
 * Canonical Core producer of Interpretation (ADR-012 / PT15).
 * Owns semantic meaning only — no Experience, UI, localization, or renderers.
 */
export type InterpretationEngine = {
  readonly interpret: (input: InterpretObjectInput) => Interpretation;
};

/**
 * Creates an InterpretationEngine that encapsulates existing interpretObject logic.
 * Phase 1 — architectural separation only; no rule / AI changes.
 */
export function createInterpretationEngine(): InterpretationEngine {
  return Object.freeze({
    interpret(input: InterpretObjectInput): Interpretation {
      return interpretObject(input);
    },
  });
}

/** Shared runtime instance — single canonical Interpretation producer. */
export const interpretationEngine: InterpretationEngine =
  createInterpretationEngine();
