import type { InterpretationTradeOff } from "../Interpretation";
import type { ResolvedLens } from "./lens";

function tradeOff(
  id: string,
  code: string,
  favors: string,
  against: string,
): InterpretationTradeOff {
  return Object.freeze({ id, code, favors, against });
}

/**
 * Semantic module — trade-offs only.
 */
export function resolveTradeOffs(
  lens: ResolvedLens,
): readonly InterpretationTradeOff[] {
  if (lens === "layout") {
    return Object.freeze([
      tradeOff(
        "t.privacy-open",
        "family.privacy-vs-openness",
        "privacy",
        "open-plan",
      ),
    ]);
  }
  if (lens === "investment") {
    return Object.freeze([
      tradeOff(
        "t.entry-yield",
        "investment.entry-cost-vs-yield",
        "yield",
        "entry-price",
      ),
    ]);
  }
  if (lens === "design") {
    return Object.freeze([
      tradeOff(
        "t.clarity-storage",
        "design.clarity-vs-storage",
        "visual-clarity",
        "storage",
      ),
    ]);
  }
  if (lens === "energy") {
    return Object.freeze([
      tradeOff(
        "t.scope-efficiency",
        "sustainability.scope-vs-efficiency",
        "efficiency",
        "base-scope",
      ),
    ]);
  }
  return Object.freeze([]);
}
