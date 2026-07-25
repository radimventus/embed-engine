/**
 * PT-013 — Serialize RecommendationContext for PromptPackage (no scoring).
 */

import type { RecommendationContext } from "../../recommendation/models/RecommendationContext";

export function formatRecommendationContextSection(
  recommendation: RecommendationContext,
): string {
  const lines = ["Recommendation Context"];

  lines.push(
    formatList(
      "recommendedOptions",
      recommendation.recommendedOptions.map((item) => `${item.id}: ${item.label}`),
    ),
  );
  lines.push(
    formatList(
      "avoidedOptions",
      recommendation.avoidedOptions.map((item) => `${item.id}: ${item.label}`),
    ),
  );
  lines.push(formatList("reasoning", [...recommendation.reasoning]));
  lines.push(
    formatList("matchedPreferences", [...recommendation.matchedPreferences]),
  );
  lines.push(
    formatList("violatedConstraints", [...recommendation.violatedConstraints]),
  );

  return lines.join("\n");
}

function formatList(label: string, items: readonly string[]): string {
  if (items.length === 0) {
    return `${label}: (none)`;
  }
  return `${label}:\n${items.map((item) => `  - ${item}`).join("\n")}`;
}
