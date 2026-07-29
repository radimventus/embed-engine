/**
 * Runtime Health & Diagnostics Engine (EPIC-BLD-37).
 * Read-only health diagnostics — never mutates Runtime / State / Knowledge.
 */

export type RuntimeOverallHealth =
  | 'Healthy'
  | 'Degraded'
  | 'Critical'
  | 'Unknown';

export type DiagnosticSeverity = 'info' | 'warning' | 'error';

export type DiagnosticCategory =
  | 'RuntimeHealth'
  | 'SessionHealth'
  | 'ModuleHealth'
  | 'StateConsistency'
  | 'TransitionConsistency'
  | 'ValidationSummary';

export type DiagnosticFinding = {
  readonly id: string;
  readonly severity: DiagnosticSeverity;
  readonly category: DiagnosticCategory;
  readonly description: string;
  readonly source: string;
  readonly timestamp: string;
  readonly metadata: {
    readonly code: string;
    readonly notes: string;
  };
};

export type RuntimeHealthReport = {
  readonly id: string;
  readonly sessionId: string;
  readonly runtimeExecutionId: string | null;
  readonly overallHealth: RuntimeOverallHealth;
  readonly warnings: readonly DiagnosticFinding[];
  readonly errors: readonly DiagnosticFinding[];
  readonly findings: readonly DiagnosticFinding[];
  readonly score: number;
  readonly createdAt: string;
  readonly metadata: {
    readonly title: string;
    readonly observabilityPackageId: string | null;
    readonly notes: string;
  };
};

export type RuntimeHealthPackage = {
  readonly id: string;
  readonly version: string;
  readonly report: RuntimeHealthReport;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: RuntimeHealthValidation | null;
};

export type RuntimeHealthValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeHealthValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeHealthValidationIssue[];
  readonly validatedAt: string;
};

export type InspectRuntimeInput = {
  readonly sessionId: string;
  readonly runtimeExecutionId?: string | null;
  readonly title?: string;
  readonly observabilityPackageId?: string | null;
  readonly observationCount?: number;
  readonly executionCount?: number;
  readonly moduleEventCount?: number;
  readonly stateEventCount?: number;
  readonly observabilityHealth?: 'Healthy' | 'Degraded' | 'Unknown';
  readonly observabilityHealthScore?: number;
  readonly hasTimeline?: boolean;
  readonly stateConsistent?: boolean;
  readonly transitionConsistent?: boolean;
  readonly validationPassed?: boolean | null;
};

export type RuntimeHealthIndexEntry = {
  readonly packageId: string;
  readonly reportId: string;
  readonly sessionId: string;
  readonly overallHealth: RuntimeOverallHealth;
  readonly score: number;
};

export type RuntimeHealthEventType =
  | 'RuntimeHealthCalculated'
  | 'DiagnosticFindingCreated'
  | 'RuntimeHealthPublished'
  | 'RuntimeHealthValidated';

export type RuntimeHealthEvent = {
  readonly eventId: string;
  readonly type: RuntimeHealthEventType;
  readonly packageId: string;
  readonly reportId: string | null;
  readonly findingId: string | null;
  readonly at: string;
  readonly message: string;
};
