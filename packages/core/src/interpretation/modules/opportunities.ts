import type { InterpretationFactor } from "../Interpretation";
import type { ResolvedLens } from "./lens";

function factor(
  id: string,
  code: string,
  weight: number,
): InterpretationFactor {
  return Object.freeze({ id, code, weight });
}

/**
 * Semantic module — opportunities only.
 */
export function resolveOpportunities(
  lens: ResolvedLens,
): readonly InterpretationFactor[] {
  if (lens === "layout") {
    return Object.freeze([
      factor("o.household", "family.household-fit", 0.75),
    ]);
  }
  if (lens === "investment") {
    return Object.freeze([
      factor("o.yield", "investment.yield-stability", 0.7),
    ]);
  }
  if (lens === "design") {
    return Object.freeze([
      factor("o.coherence", "design.coherence", 0.8),
    ]);
  }
  if (lens === "energy") {
    return Object.freeze([
      factor("o.generation", "sustainability.future-generation", 0.65),
    ]);
  }
  return Object.freeze([
    factor("o.select-priority", "baseline.select-priority", 0.5),
  ]);
}
