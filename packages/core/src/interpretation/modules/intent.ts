import type { InterpretationRecommendedIntent } from "../Interpretation";
import type { ResolvedLens } from "./lens";

/**
 * Semantic module — recommended intent only.
 */
export function resolveIntent(
  lens: ResolvedLens,
): InterpretationRecommendedIntent {
  if (lens === "layout") {
    return "explore-layout";
  }
  if (lens === "investment") {
    return "calculate-roi";
  }
  if (lens === "design") {
    return "explore-design";
  }
  if (lens === "energy") {
    return "review-energy";
  }
  return "select-priority";
}
