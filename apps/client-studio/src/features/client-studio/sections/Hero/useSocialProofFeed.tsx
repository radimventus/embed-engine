import { createContext, useContext, type ReactNode } from 'react';
import {
  normalizeSocialProofSignal,
  presentSocialProofSignal,
} from '@embed-engine/core';
import type { SocialProofIconName } from './SocialProofIcon';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { useSocialProofReadModel } from '../../analytics/useSocialProofReadModel';

const MIN_MESSAGES_BEFORE_REPEAT = 5;

export type SocialProofEntry = {
  readonly id: string;
  readonly icon: SocialProofIconName;
  readonly value: string;
  readonly message: string;
};

const SocialProofFeedContext = createContext<readonly SocialProofEntry[]>([]);

export function SocialProofFeedProvider({ children }: { readonly children: ReactNode }) {
  // TASK-40.5: only normalized, server-derived evidence may become customer copy.
  const { analyticsScope } = useDecisionSessionRuntime();
  const model = useSocialProofReadModel(analyticsScope);
  const aggregate = model?.aggregate;
  const entries: readonly SocialProofEntry[] = [
    ...(aggregate === undefined ? [] : [
      normalizeSocialProofSignal({
        kind: 'TOUR_COMPLETION',
        houseId: analyticsScope?.houseId ?? '',
        count: aggregate.completedTours,
        window: 'ROLLING_7_DAYS',
        evidence: 'TOUR_TRANSITIONED_TO_PRIORITY',
      }),
      normalizeSocialProofSignal({
        kind: 'PRIORITY_COMPLETION',
        houseId: analyticsScope?.houseId ?? '',
        count: aggregate.completedPriorities,
        window: 'ROLLING_7_DAYS',
        evidence: 'PRIORITY_SETUP_COMPLETED',
      }),
      ...aggregate.priorityPreferences.map((item) =>
        normalizeSocialProofSignal({
          kind: 'PRIORITY_PREFERENCE',
          houseId: analyticsScope?.houseId ?? '',
          percentage: Math.round(item.percentOfVisitors),
          priorityId: item.priorityId,
          window: 'ROLLING_7_DAYS',
          evidence: 'QUALIFYING_PRIORITY_SELECTION_AGGREGATE',
        }),
      ),
    ]),
  ].flatMap((signal): readonly SocialProofEntry[] => {
    if (signal === null) return [];
    const presentation = presentSocialProofSignal(signal);
    if (presentation === null) {
      return [];
    }
    return [{
      id: presentation.id,
      icon: presentation.icon,
      value: presentation.value,
      message: presentation.text,
    }];
  });
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
  for (let step = 1; step <= entries.length; step += 1) {
    const candidate = (current + step) % entries.length;
    const message = entries[candidate]!.message;
    const lastIndex = recentMessages.lastIndexOf(message);
    if (lastIndex === -1 || recentMessages.length - lastIndex - 1 >= MIN_MESSAGES_BEFORE_REPEAT) {
      return candidate;
    }
  }
  return (current + 1) % entries.length;
}

export const SOCIAL_PROOF_MIN_MESSAGES_BEFORE_REPEAT = MIN_MESSAGES_BEFORE_REPEAT;
