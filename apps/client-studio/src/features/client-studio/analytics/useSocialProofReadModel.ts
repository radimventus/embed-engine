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
    readonly completedPriorities: number;
    readonly priorityPreferences: readonly {
      readonly priorityId: string;
      readonly visitorCount: number;
      readonly percentOfVisitors: number;
    }[];
  };
};

function config(): string | null {
  const endpoint = (
    import.meta.env.VITE_PLATFORM_API_ORIGIN ??
    'https://api.conis.cz'
  )?.replace(/\/$/, '');
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
    void fetch(`${endpoint}/public/social-proof/aggregate?${query}`, {
      signal: controller.signal,
    })
      .then(async (aggregate) => {
        if (!aggregate.ok) return null;
        return {
          aggregate: await aggregate.json(),
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
