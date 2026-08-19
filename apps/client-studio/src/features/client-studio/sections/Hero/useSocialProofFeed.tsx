import { createContext, useContext, type ReactNode } from 'react';
import {
  createSocialProofTickerSchedule,
  nextSocialProofTickerIndex,
  resolveSocialProofFeed,
  SOCIAL_PROOF_REPEAT_GAP,
  type SocialProofDisplayItem,
} from '@embed-engine/core';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';

export type SocialProofEntry = SocialProofDisplayItem;

const SocialProofFeedContext = createContext<readonly SocialProofEntry[]>([]);

export function SocialProofFeedProvider({ children }: { readonly children: ReactNode }) {
  const { analyticsScope } = useDecisionSessionRuntime();
  const entries = analyticsScope === null
    ? []
    : createSocialProofTickerSchedule(resolveSocialProofFeed({
        houseId: analyticsScope.houseId,
        isReferenceHouse: analyticsScope.houseId.includes("bungalov-4kk"),
      }));
  return (
    <SocialProofFeedContext.Provider value={entries}>
      {children}
    </SocialProofFeedContext.Provider>
  );
}

export function useSocialProofFeed(): readonly SocialProofEntry[] {
  return useContext(SocialProofFeedContext);
}

export function nextSocialProofIndex(
  current: number,
  entries: readonly SocialProofEntry[],
  recentMessages: readonly string[],
): number {
  return nextSocialProofTickerIndex(
    current,
    entries,
    recentMessages,
  );
}

export const SOCIAL_PROOF_MIN_MESSAGES_BEFORE_REPEAT = SOCIAL_PROOF_REPEAT_GAP;
