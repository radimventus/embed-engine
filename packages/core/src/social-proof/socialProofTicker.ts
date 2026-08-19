export const SOCIAL_PROOF_TICK_MS = 12_000;
export const SOCIAL_PROOF_DIRECTION = "RIGHT_TO_LEFT" as const;
export const SOCIAL_PROOF_REPEAT_GAP = 5;

export type SocialProofTickerItem = {
  readonly id: string;
  readonly group: "COUNT" | "SHARE" | "LIVE";
};

/**
 * Makes the feed a deterministic cycle of unique proofs. Removing duplicate
 * identities (rather than synthesising filler) gives every proof the longest
 * available repeat distance: the complete corpus length.
 */
export function createSocialProofTickerSchedule<T extends SocialProofTickerItem>(
  entries: readonly T[],
): readonly T[] {
  const seen = new Set<string>();
  return Object.freeze(entries.filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  }));
}

export function nextSocialProofTickerIndex(
  current: number,
  entries: readonly SocialProofTickerItem[],
  _recentIds: readonly string[] = [],
): number {
  if (entries.length === 0) return 0;
  // A shorter corpus cannot satisfy five intervening positions without
  // fabricating content, so it remains stationary instead of repeating early.
  if (entries.length <= SOCIAL_PROOF_REPEAT_GAP) return current % entries.length;
  // A scheduler advancement always moves exactly one right-to-left position.
  // `createSocialProofTickerSchedule` establishes the repeat-safe corpus.
  return (current + 1) % entries.length;
}
