/**
 * EPIC-BX-16 — GM Readiness domain types (aggregation only).
 */

export type GmVerdict = 'PASS' | 'WARNING' | 'FAIL';

export type GmChecklistState = 'PASS' | 'TODO' | 'BLOCKED';

export type GmDomainId =
  | 'platform'
  | 'authentication'
  | 'capability'
  | 'intelligence'
  | 'runtime'
  | 'publish'
  | 'builder'
  | 'manager'
  | 'sales'
  | 'pilot';

export type GmDomainReport = {
  readonly id: GmDomainId;
  readonly label: string;
  readonly verdict: GmVerdict;
  readonly detail: string;
};

export type GmHealthId =
  | 'runtime'
  | 'publish'
  | 'session'
  | 'capability'
  | 'intelligence';

export type GmHealthItem = {
  readonly id: GmHealthId;
  readonly label: string;
  readonly verdict: GmVerdict;
  readonly detail: string;
};

export type GmOperationalHealth = {
  readonly items: readonly GmHealthItem[];
};

export type GmPilotLifecycle =
  | 'aktivni'
  | 'onboarding'
  | 'ceka-na-data'
  | 'produkce';

export type GmPilotFirmStatus = {
  readonly tenantId: string;
  readonly companyId: string;
  readonly companyName: string;
  readonly lifecycle: GmPilotLifecycle;
  readonly lifecycleLabel: string;
  readonly detail: string;
};

export type GmPilotStatusSummary = {
  readonly firms: readonly GmPilotFirmStatus[];
  readonly counts: Readonly<Record<GmPilotLifecycle, number>>;
};

export type GmChecklistItemId =
  | 'authentication'
  | 'roles'
  | 'platform-shell'
  | 'builder'
  | 'manager'
  | 'sales'
  | 'publish'
  | 'runtime'
  | 'hp'
  | 'intelligence';

export type GmChecklistItem = {
  readonly id: GmChecklistItemId;
  readonly label: string;
  readonly state: GmChecklistState;
  readonly detail: string;
};

export type GmEngineeringDebtItem = {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly area: string;
};

export type GmExecutiveStage = 'Ready for Pilot' | 'Ready for GM' | 'Not Ready';

export type GmExecutiveSummary = {
  readonly scorePercent: number;
  readonly stage: GmExecutiveStage;
  readonly passCount: number;
  readonly warningCount: number;
  readonly failCount: number;
  readonly domainCount: number;
};

export type GmReadinessReport = {
  readonly executive: GmExecutiveSummary;
  readonly domains: readonly GmDomainReport[];
  readonly health: GmOperationalHealth;
  readonly pilots: GmPilotStatusSummary;
  readonly checklist: readonly GmChecklistItem[];
  readonly debt: readonly GmEngineeringDebtItem[];
};
