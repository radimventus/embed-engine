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
 * Semantic module — strengths only.
 */
export function resolveStrengths(
  lens: ResolvedLens,
): readonly InterpretationFactor[] {
  if (lens === "layout") {
    return Object.freeze([
      factor("s.bedrooms", "family.bedrooms", 0.9),
      factor("s.garden", "family.garden", 0.85),
      factor("s.bathrooms", "family.bathrooms", 0.8),
    ]);
  }
  if (lens === "investment") {
    return Object.freeze([
      factor("s.opex", "investment.opex", 0.85),
      factor("s.rental", "investment.rental", 0.8),
      factor("s.location", "investment.location", 0.78),
    ]);
  }
  if (lens === "design") {
    return Object.freeze([
      factor("s.materials", "design.materials", 0.88),
      factor("s.open-living", "design.open-living", 0.84),
      factor("s.details", "design.details", 0.82),
    ]);
  }
  if (lens === "energy") {
    return Object.freeze([
      factor("s.envelope", "sustainability.envelope", 0.8),
      factor("s.heat-pump", "sustainability.heat-pump", 0.78),
      factor("s.solar-ready", "sustainability.solar", 0.7),
    ]);
  }
  return Object.freeze([]);
}
