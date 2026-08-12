import { getCanonicalProject } from '@embed-engine/platform-access';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useSocialProofReadModel } from '../../analytics/useSocialProofReadModel';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import type { SocialProofIconName } from './SocialProofIcon';

const MIN_MESSAGES_BEFORE_REPEAT = 5;

export type SocialProofEntry = {
  readonly id: string;
  readonly icon: SocialProofIconName;
  readonly value: string;
  readonly message: string;
};

const SocialProofFeedContext = createContext<readonly SocialProofEntry[]>([]);

function readModelEntries(
  model: ReturnType<typeof useSocialProofReadModel>,
): readonly SocialProofEntry[] {
  if (model === null) return [];
  const { aggregate } = model;
  const recentEntries = model.recent.flatMap((item): readonly SocialProofEntry[] => {
    const houseName = getCanonicalProject(item.houseId)?.house?.name;
    if (houseName === undefined) return [];
    return [{
      id: `recent:${item.houseId}`,
      icon: 'viewing',
      value: String(item.activeVisitors),
      message: item.locality === null
        ? `návštěvníci právě prohlížejí ${houseName}.`
        : `návštěvníci z oblasti ${item.locality} právě prohlížejí ${houseName}.`,
    }];
  });
  return [
    aggregate.savedByVisitors > 0
      ? { id: 'saved', icon: 'saved', value: String(aggregate.savedByVisitors), message: 'návštěvníků si tento dům uložilo.' }
      : null,
    aggregate.returningVisitors > 0
      ? { id: 'returning', icon: 'viewing', value: String(aggregate.returningVisitors), message: 'návštěvníků se k domu vrátilo.' }
      : null,
    aggregate.priorityPreferences[0]
      ? { id: `preference:${aggregate.priorityPreferences[0].priorityId}`, icon: 'inquiry', value: `${aggregate.priorityPreferences[0].percentOfVisitors} %`, message: 'návštěvníků označilo tuto prioritu mezi důležitými.' }
      : null,
    ...recentEntries,
  ].filter((entry): entry is SocialProofEntry => entry !== null);
}

export function SocialProofFeedProvider({ children }: { readonly children: ReactNode }) {
  const { analyticsScope } = useDecisionSessionRuntime();
  const model = useSocialProofReadModel(analyticsScope);
  const entries = useMemo(() => readModelEntries(model), [model]);

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
