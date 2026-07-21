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
 * Semantic module — frictions only.
 */
export function resolveFrictions(
  lens: ResolvedLens,
): readonly InterpretationFactor[] {
  if (lens === "layout") {
    return Object.freeze([
      factor("f.upper-floor", "family.upper-floor", 0.45),
      factor("f.storage", "family.storage", 0.3),
    ]);
  }
  if (lens === "investment") {
    return Object.freeze([
      factor("f.price", "investment.price", 0.7),
      factor("f.roi", "investment.roi", 0.55),
    ]);
  }
  if (lens === "design") {
    return Object.freeze([
      factor("f.storage", "design.storage", 0.5),
      factor("f.glazing", "design.glazing", 0.35),
    ]);
  }
  if (lens === "energy") {
    return Object.freeze([
      factor("f.solar", "sustainability.solar-not-included", 0.5),
      factor("f.rainwater", "sustainability.rainwater", 0.3),
    ]);
  }
  return Object.freeze([
    factor("f.open-lens", "baseline.open-lens", 0.6),
  ]);
}
