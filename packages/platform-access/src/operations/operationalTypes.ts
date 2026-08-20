import type { HouseDataMode } from '../domain/types';

export const HIGH_INTENT_THRESHOLD = 65;

export type OperationalOrigin = 'REFERENCE' | 'LEAD';

export type OperationalJourneyStep = {
  readonly module: string;
  readonly title: string;
  readonly detail: string;
  readonly completed?: boolean;
  readonly active?: boolean;
};

/** Canonical Profil zájemce attached to a House-scoped operational case. */
export type ProfilZajemce = {
  readonly land: string;
  readonly location: string | null;
  readonly tags: readonly string[];
  readonly insight: string;
  readonly score: number;
  readonly journey: readonly OperationalJourneyStep[];
};

export type HouseOperationalCase = {
  readonly caseId: string;
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
  readonly houseName: string;
  readonly origin: OperationalOrigin;
  readonly leadId: string | null;
  readonly createdAt: string;
  readonly contact: {
    readonly name: string;
    readonly email: string;
    readonly phone: string | null;
  };
  readonly conversion: {
    readonly source: 'EMBED';
    readonly intent: 'audit';
    readonly status: 'accepted';
  };
  readonly profilZajemce: ProfilZajemce;
};

export type OperationalHouseScope = {
  readonly houseId: string;
  readonly houseName: string;
  readonly dataMode: HouseDataMode;
};

export type OperationalLeadRecord = {
  readonly leadId: string;
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
  readonly createdAt: string;
  readonly source: 'EMBED';
  readonly intent: 'audit';
  readonly status: 'accepted';
  readonly contact: {
    readonly name: string;
    readonly email: string;
    readonly phone: string | null;
  };
};

export type HouseOperationalAggregate = {
  readonly caseCount: number;
  readonly convertedCount: number;
  readonly highIntentCount: number;
  readonly priorityCounts: readonly {
    readonly label: string;
    readonly count: number;
  }[];
  readonly journeyModuleCounts: readonly {
    readonly module: string;
    readonly completedCount: number;
  }[];
};
