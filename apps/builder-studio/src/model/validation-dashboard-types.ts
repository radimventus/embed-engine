/**
 * Validation Dashboard (EPIC-BX-05 / readiness aggregation).
 * Aggregates existing validators — no own rules, no mutations, no AI, no publish.
 *
 * Naming note: BLD-07 already exports `ValidationReport` (quality gate).
 * Epic deliverable ValidationReport ≡ DashboardValidationReport.
 * Epic ValidationCheck ≡ DashboardValidationCheck.
 * Epic OverallStatus ≡ DashboardOverallStatus (READY|WARNING|BLOCKED).
 */

export type DashboardOverallStatus = 'READY' | 'WARNING' | 'BLOCKED';

export type ValidationCheckSource =
  | 'WORKSPACE'
  | 'ASSETS'
  | 'METADATA'
  | 'PUBLICATION'
  | 'EXPORT'
  | 'CUSTOM';

export type ValidationCheckSeverity = 'INFO' | 'WARNING' | 'ERROR';

export type DashboardValidationCheck = {
  readonly id: string;
  readonly source: ValidationCheckSource;
  readonly severity: ValidationCheckSeverity;
  readonly title: string;
  readonly description: string;
  readonly status: DashboardOverallStatus;
  readonly recommendation: string;
  readonly metadata: {
    readonly code: string;
    readonly notes: string;
  };
};

export type DashboardValidationReport = {
  readonly id: string;
  readonly projectId: string;
  readonly overallStatus: DashboardOverallStatus;
  readonly readinessScore: number;
  readonly checks: readonly DashboardValidationCheck[];
  readonly summary: {
    readonly readyCount: number;
    readonly warningCount: number;
    readonly blockedCount: number;
    readonly totalCount: number;
    readonly notes: string;
  };
  readonly generatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly sources: readonly ValidationCheckSource[];
  };
};

export type InitializeValidationDashboardInput = {
  readonly projectId: string;
  readonly title?: string;
};

export type ValidationDashboardIndexEntry = {
  readonly reportId: string;
  readonly projectId: string;
  readonly overallStatus: DashboardOverallStatus;
  readonly readinessScore: number;
  readonly generatedAt: string;
};

export type ValidationDashboardEventType =
  | 'ValidationStarted'
  | 'ValidationCompleted'
  | 'ValidationReportGenerated'
  | 'ValidationReportUpdated';

export type ValidationDashboardEvent = {
  readonly eventId: string;
  readonly type: ValidationDashboardEventType;
  readonly projectId: string;
  readonly reportId: string | null;
  readonly at: string;
  readonly message: string;
};

/** Epic aliases — prefer Dashboard* names in code to avoid BLD-07 collisions. */
export type ValidationCheck = DashboardValidationCheck;
export type ValidationDashboardReportAlias = DashboardValidationReport;
