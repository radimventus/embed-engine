import type { InterpretationConfidenceInput } from "../Interpretation";
import type { ResolvedLens } from "./lens";

export type ConfidenceResult = {
  readonly confidenceInputs: readonly InterpretationConfidenceInput[];
  readonly matchScore: number;
};

function input(
  id: string,
  code: string,
  contribution: number,
): InterpretationConfidenceInput {
  return Object.freeze({ id, code, contribution });
}

/**
 * Semantic module — confidence inputs and match score.
 */
export function resolveConfidence(lens: ResolvedLens): ConfidenceResult {
  if (lens === "layout") {
    return Object.freeze({
      confidenceInputs: Object.freeze([
        input("c.coverage", "priority.coverage", 0.92),
      ]),
      matchScore: 92,
    });
  }
  if (lens === "investment") {
    return Object.freeze({
      confidenceInputs: Object.freeze([
        input("c.indicators", "investment.indicators", 0.76),
      ]),
      matchScore: 76,
    });
  }
  if (lens === "design") {
    return Object.freeze({
      confidenceInputs: Object.freeze([
        input("c.quality", "design.architectural-quality", 0.88),
      ]),
      matchScore: 88,
    });
  }
  if (lens === "energy") {
    return Object.freeze({
      confidenceInputs: Object.freeze([
        input("c.energy", "sustainability.energy-features", 0.71),
      ]),
      matchScore: 71,
    });
  }
  return Object.freeze({
    confidenceInputs: Object.freeze([
      input("c.inactive", "baseline.inactive-lens", 0.4),
    ]),
    matchScore: 40,
  });
}
