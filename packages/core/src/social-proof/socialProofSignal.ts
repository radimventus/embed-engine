import {
  CUSTOMER_FACING_PRIORITY_IDS,
  type CustomerFacingPriorityId,
  type CustomerFacingTimeWindow,
} from "../customer-language/czechRealization";

export const SOCIAL_PROOF_SIGNAL_KINDS = Object.freeze([
  "LIVE",
  "SAVE",
  "RETURN",
  "PRIORITY_COMPLETION",
  "PRIORITY_PREFERENCE",
  "TOUR_COMPLETION",
] as const);

export type SocialProofSignalKind =
  (typeof SOCIAL_PROOF_SIGNAL_KINDS)[number];

export type SocialProofAggregationWindow = Extract<
  CustomerFacingTimeWindow,
  "ROLLING_7_DAYS" | "ROLLING_WEEK" | "ROLLING_MONTH"
>;

type HouseScopedSignal = {
  readonly houseId: string;
};

type HistoricalCountSignal = HouseScopedSignal & {
  readonly count: number;
  readonly window: SocialProofAggregationWindow;
};

export type LiveSocialProofSignal = HouseScopedSignal & {
  readonly kind: "LIVE";
  readonly count: number;
  readonly window: "LIVE";
};

export type SaveSocialProofSignal = HistoricalCountSignal & {
  readonly kind: "SAVE";
};

export type ReturnSocialProofSignal = HistoricalCountSignal & {
  readonly kind: "RETURN";
};

export type PriorityCompletionSocialProofSignal = HistoricalCountSignal & {
  readonly kind: "PRIORITY_COMPLETION";
};

export type PriorityPreferenceSocialProofSignal = HouseScopedSignal & {
  readonly kind: "PRIORITY_PREFERENCE";
  readonly percentage: number;
  readonly priorityId: CustomerFacingPriorityId;
  readonly window: SocialProofAggregationWindow;
};

export type TourCompletionSocialProofSignal = HistoricalCountSignal & {
  readonly kind: "TOUR_COMPLETION";
};

export type SocialProofSignal =
  | LiveSocialProofSignal
  | SaveSocialProofSignal
  | ReturnSocialProofSignal
  | PriorityCompletionSocialProofSignal
  | PriorityPreferenceSocialProofSignal
  | TourCompletionSocialProofSignal;

export type SocialProofSignalCandidate =
  | (HouseScopedSignal & {
      readonly kind: "LIVE";
      readonly count: number;
      readonly window: CustomerFacingTimeWindow;
      readonly evidence: "VERIFIED_CONCURRENT_PRESENCE" | "HISTORICAL_VISITOR_AGGREGATE";
    })
  | (HouseScopedSignal & {
      readonly kind: "SAVE";
      readonly count: number;
      readonly window: CustomerFacingTimeWindow | null;
      readonly evidence: "HOUSE_SAVED" | "PURCHASE_INTENT_INFERENCE";
    })
  | (HouseScopedSignal & {
      readonly kind: "RETURN";
      readonly count: number;
      readonly window: CustomerFacingTimeWindow | null;
      readonly evidence: "RETURNING_VISITOR" | "INTEREST_INFERENCE";
    })
  | (HouseScopedSignal & {
      readonly kind: "PRIORITY_COMPLETION";
      readonly count: number;
      readonly window: CustomerFacingTimeWindow | null;
      readonly evidence: "PRIORITY_SETUP_COMPLETED" | "PRIORITY_ENTRY";
    })
  | (HouseScopedSignal & {
      readonly kind: "PRIORITY_PREFERENCE";
      readonly percentage: number;
      readonly priorityId: string;
      readonly window: CustomerFacingTimeWindow | null;
      readonly evidence:
        | "QUALIFYING_PRIORITY_SELECTION_AGGREGATE"
        | "ALL_VISITORS_AGGREGATE";
    })
  | (HouseScopedSignal & {
      readonly kind: "TOUR_COMPLETION";
      readonly count: number;
      readonly window: CustomerFacingTimeWindow | null;
      readonly evidence: "TOUR_TRANSITIONED_TO_PRIORITY" | "TOUR_VIEW";
    });

function isValidHouseId(value: string): boolean {
  return value.trim().length > 0;
}

function isValidPersonCount(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 1;
}

function isAggregationWindow(
  value: CustomerFacingTimeWindow | null,
): value is SocialProofAggregationWindow {
  return (
    value === "ROLLING_7_DAYS" ||
    value === "ROLLING_WEEK" ||
    value === "ROLLING_MONTH"
  );
}

function isPriorityId(value: string): value is CustomerFacingPriorityId {
  return CUSTOMER_FACING_PRIORITY_IDS.includes(value as CustomerFacingPriorityId);
}

function isValidPercentage(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0 && value <= 100;
}

/**
 * Converts only semantically verified aggregate evidence to a normalized,
 * customer-language-free Social Proof signal. Any weaker evidence is absent.
 */
export function normalizeSocialProofSignal(
  candidate: SocialProofSignalCandidate,
): SocialProofSignal | null {
  if (!isValidHouseId(candidate.houseId)) {
    return null;
  }

  switch (candidate.kind) {
    case "LIVE":
      return candidate.evidence === "VERIFIED_CONCURRENT_PRESENCE" &&
        candidate.window === "LIVE" &&
        isValidPersonCount(candidate.count)
        ? Object.freeze({
            kind: "LIVE" as const,
            houseId: candidate.houseId,
            count: candidate.count,
            window: "LIVE" as const,
          })
        : null;
    case "SAVE":
      return candidate.evidence === "HOUSE_SAVED" &&
        isAggregationWindow(candidate.window) &&
        isValidPersonCount(candidate.count)
        ? Object.freeze({
            kind: "SAVE" as const,
            houseId: candidate.houseId,
            count: candidate.count,
            window: candidate.window,
          })
        : null;
    case "RETURN":
      return candidate.evidence === "RETURNING_VISITOR" &&
        isAggregationWindow(candidate.window) &&
        isValidPersonCount(candidate.count)
        ? Object.freeze({
            kind: "RETURN" as const,
            houseId: candidate.houseId,
            count: candidate.count,
            window: candidate.window,
          })
        : null;
    case "PRIORITY_COMPLETION":
      return candidate.evidence === "PRIORITY_SETUP_COMPLETED" &&
        isAggregationWindow(candidate.window) &&
        isValidPersonCount(candidate.count)
        ? Object.freeze({
            kind: "PRIORITY_COMPLETION" as const,
            houseId: candidate.houseId,
            count: candidate.count,
            window: candidate.window,
          })
        : null;
    case "PRIORITY_PREFERENCE":
      return candidate.evidence ===
        "QUALIFYING_PRIORITY_SELECTION_AGGREGATE" &&
        isAggregationWindow(candidate.window) &&
        isPriorityId(candidate.priorityId) &&
        isValidPercentage(candidate.percentage)
        ? Object.freeze({
            kind: "PRIORITY_PREFERENCE" as const,
            houseId: candidate.houseId,
            priorityId: candidate.priorityId,
            percentage: candidate.percentage,
            window: candidate.window,
          })
        : null;
    case "TOUR_COMPLETION":
      return candidate.evidence === "TOUR_TRANSITIONED_TO_PRIORITY" &&
        isAggregationWindow(candidate.window) &&
        isValidPersonCount(candidate.count)
        ? Object.freeze({
            kind: "TOUR_COMPLETION" as const,
            houseId: candidate.houseId,
            count: candidate.count,
            window: candidate.window,
          })
        : null;
  }
}
