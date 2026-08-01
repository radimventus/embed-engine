/**
 * EPIC-BX-19 — Platform Operations Center report DTOs (aggregation only).
 * No new event / customer / release domain model.
 */

export type OpsHealth = 'healthy' | 'degraded' | 'critical' | 'unknown';

export type OpsAreaId =
  | 'platform'
  | 'builder'
  | 'manager'
  | 'sales'
  | 'runtime'
  | 'publish'
  | 'intelligence'
  | 'capability'
  | 'customer-success';

export type OpsAreaOverview = {
  readonly id: OpsAreaId;
  readonly label: string;
  readonly health: OpsHealth;
  readonly status: string;
  readonly lastActivity: string;
};

export type OpsTimelineKind =
  | 'publish'
  | 'login'
  | 'release'
  | 'runtime'
  | 'validation'
  | 'customer-success';

export type OpsTimelineEvent = {
  readonly id: string;
  readonly kind: OpsTimelineKind;
  readonly label: string;
  readonly at: string | null;
  readonly detail: string;
};

export type OpsAlertSeverity = 'critical' | 'warning' | 'info';

export type OpsAlertId =
  | 'publish-blocked'
  | 'runtime-degraded'
  | 'customer-at-risk'
  | 'missing-validation'
  | 'missing-release-approval';

export type OpsAlert = {
  readonly id: OpsAlertId;
  readonly severity: OpsAlertSeverity;
  readonly title: string;
  readonly detail: string;
};

export type OpsPlatformMetrics = {
  readonly activeCompanies: number;
  readonly activeWorkspaces: number;
  readonly activeProjects: number;
  readonly releases: number;
  readonly publishSuccess: string;
  readonly runtimeHealth: OpsHealth;
  readonly adoptionPercent: number;
};

export type OpsExecutiveView = {
  readonly currentPlatformStatus: string;
  readonly currentRisks: readonly string[];
  readonly recommendedActions: readonly string[];
};

export type OpsCenterReport = {
  readonly overview: readonly OpsAreaOverview[];
  readonly timeline: readonly OpsTimelineEvent[];
  readonly alerts: readonly OpsAlert[];
  readonly metrics: OpsPlatformMetrics;
  readonly executive: OpsExecutiveView;
};
