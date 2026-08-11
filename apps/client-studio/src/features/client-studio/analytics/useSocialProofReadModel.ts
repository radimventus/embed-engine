import { useEffect, useState } from 'react';

export type SocialProofReadScope = {
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
};

export type SocialProofReadModel = {
  readonly aggregate: {
    readonly uniqueVisitors: number;
    readonly visits: number;
    readonly returningVisitors: number;
    readonly savedByVisitors: number;
    readonly completedTours: number;
    readonly priorityPreferences: readonly {
      readonly priorityId: string;
      readonly visitorCount: number;
      readonly percentOfVisitors: number;
    }[];
  };
  readonly recent: readonly {
    readonly houseId: string;
    readonly activeVisitors: number;
    readonly locality: string | null;
  }[];
};

function config(): string | null {
  if (import.meta.env.VITE_SOCIAL_PROOF_ANALYTICS_CONSENT !== 'granted') {
    return null;
  }
  const endpoint = import.meta.env.VITE_SOCIAL_PROOF_ANALYTICS_API?.replace(/\/$/, '');
  return endpoint && /^https?:\/\//.test(endpoint) ? endpoint : null;
}

export function useSocialProofReadModel(
  scope: SocialProofReadScope | null,
): SocialProofReadModel | null {
  const [model, setModel] = useState<SocialProofReadModel | null>(null);

  useEffect(() => {
    const endpoint = config();
    if (scope === null || endpoint === null) {
      setModel(null);
      return;
    }
    const controller = new AbortController();
    const to = new Date().toISOString();
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const query = new URLSearchParams({ ...scope, from, to });
    void Promise.all([
      fetch(`${endpoint}/local-pilot/social-proof/aggregate?${query}`, {
        signal: controller.signal,
      }),
      fetch(`${endpoint}/local-pilot/social-proof/recent?${query}&minimumVisitors=2`, {
        signal: controller.signal,
      }),
    ])
      .then(async ([aggregate, recent]) => {
        if (!aggregate.ok || !recent.ok) return null;
        return {
          aggregate: await aggregate.json(),
          recent: await recent.json(),
        } as SocialProofReadModel;
      })
      .then((next) => {
        if (!controller.signal.aborted) setModel(next);
      })
      .catch(() => {
        if (!controller.signal.aborted) setModel(null);
      });
    return () => controller.abort();
  }, [scope]);

  return model;
}
