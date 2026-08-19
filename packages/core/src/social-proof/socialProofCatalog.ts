import type { CustomerFacingPriorityId } from "../customer-language/czechRealization";

export const SOCIAL_PROOF_GROUPS = ["COUNT", "SHARE", "LIVE"] as const;
export type SocialProofGroup = (typeof SOCIAL_PROOF_GROUPS)[number];

export const SOCIAL_PROOF_TOPICS = [
  "LAND_VALIDATION",
  "LAND_SEARCH",
  "PDF",
  "RETURN_TO_TOUR",
  "OWN_QUESTION",
  "RETURN_SHARE",
  "TOP_PRIORITY",
  "SET_PRIORITIES",
  "FAQ",
  "CHAT",
  "LIVE_HOUSE_VIEWERS",
  "LIVE_SETTING_PRIORITIES",
  "LIVE_FAQ",
  "LIVE_CHAT",
  "LIVE_LAND_VALIDATION",
] as const;
export type SocialProofTopic = (typeof SOCIAL_PROOF_TOPICS)[number];

export type SocialProofHouseMode = "REAL" | "REFERENCE";

export type SocialProofMetric = {
  readonly topic: SocialProofTopic;
  readonly group: SocialProofGroup;
  readonly numerator: number;
  readonly denominator?: number;
  readonly priorityId?: CustomerFacingPriorityId;
};

export type SocialProofDataset = {
  readonly mode: SocialProofHouseMode;
  readonly historical: readonly SocialProofMetric[];
  readonly live: readonly SocialProofMetric[];
};

const REFERENCE_DENOMINATOR = 108;
const REFERENCE_HISTORICAL: readonly SocialProofMetric[] = Object.freeze([
  { topic: "LAND_VALIDATION", group: "COUNT", numerator: 14 },
  { topic: "LAND_SEARCH", group: "COUNT", numerator: 9 },
  { topic: "PDF", group: "COUNT", numerator: 37 },
  { topic: "RETURN_TO_TOUR", group: "COUNT", numerator: 47 },
  { topic: "OWN_QUESTION", group: "COUNT", numerator: 41 },
  { topic: "RETURN_SHARE", group: "SHARE", numerator: 48, denominator: REFERENCE_DENOMINATOR },
  { topic: "TOP_PRIORITY", group: "SHARE", numerator: 41, denominator: REFERENCE_DENOMINATOR, priorityId: "energy" },
  { topic: "SET_PRIORITIES", group: "SHARE", numerator: 62, denominator: REFERENCE_DENOMINATOR },
  { topic: "FAQ", group: "SHARE", numerator: 37, denominator: REFERENCE_DENOMINATOR },
  { topic: "CHAT", group: "SHARE", numerator: 31, denominator: REFERENCE_DENOMINATOR },
]);

function seedMetric(topic: SocialProofTopic): SocialProofMetric {
  return { topic, group: "COUNT", numerator: 1 };
}

export function resolveSocialProofDataset(input: {
  readonly houseId: string;
  readonly isReferenceHouse: boolean;
}): SocialProofDataset | null {
  if (input.houseId.trim().length === 0) return null;
  if (input.isReferenceHouse) {
    return Object.freeze({
      mode: "REFERENCE",
      historical: REFERENCE_HISTORICAL,
      // LIVE is always external truthful evidence; reference data never simulates it.
      live: Object.freeze([]),
    });
  }
  return Object.freeze({
    mode: "REAL",
    historical: Object.freeze([
      seedMetric("LAND_VALIDATION"),
      seedMetric("LAND_SEARCH"),
      seedMetric("PDF"),
      seedMetric("RETURN_TO_TOUR"),
      seedMetric("OWN_QUESTION"),
    ]),
    live: Object.freeze([]),
  });
}

export function derivedSocialProofPercentage(metric: SocialProofMetric): number | null {
  if (metric.group !== "SHARE" || metric.denominator === undefined || metric.denominator < 1) {
    return null;
  }
  return Math.round((metric.numerator / metric.denominator) * 100);
}
