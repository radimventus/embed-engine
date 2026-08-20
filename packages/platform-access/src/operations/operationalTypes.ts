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
  readonly priorities: readonly OperationalPrioritySelection[];
  readonly insight: string;
  /** Measured Index rozhodovací jistoty, or null when insufficient / incompatible. */
  readonly score: number | null;
  readonly journey: readonly OperationalJourneyStep[];
};

export type OperationalPrioritySelection = {
  readonly id: string;
  readonly label: string;
  readonly importance: number | null;
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
  readonly decisionSessionId: string | null;
};

export type OperationalDecisionEvent =
  | {
      readonly type: 'RoomSelected';
      readonly roomId: string;
      readonly at: number;
    }
  | {
      readonly type: 'PriorityChanged';
      readonly priorityIds: readonly string[];
      readonly intensities?: readonly {
        readonly priorityId: string;
        readonly importance: number;
      }[];
      readonly at: number;
    }
  | {
      readonly type: string;
      readonly at: number;
    };

export type OperationalDecisionSnapshot = {
  readonly decisionSessionId: string;
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
  readonly priorityIds: readonly string[];
  readonly priorityIntensities: Readonly<Record<string, number>> | null;
  readonly activeRoomId: string | null;
  readonly events: readonly OperationalDecisionEvent[];
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
