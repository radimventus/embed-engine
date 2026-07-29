/**
 * Runtime Governance Engine (EPIC-BLD-39).
 * Deterministic platform compliance — never mutates Runtime / State / Knowledge.
 */

export type GovernanceRuleCategory =
  | 'Observability'
  | 'Health'
  | 'Audit'
  | 'Session'
  | 'Execution'
  | 'Validation';

export type GovernanceSeverity = 'info' | 'warning' | 'error' | 'critical';

export type GovernanceOverallStatus =
  | 'Compliant'
  | 'Warning'
  | 'NonCompliant'
  | 'Unknown';

export type GovernanceRule = {
  readonly id: string;
  readonly name: string;
  readonly category: GovernanceRuleCategory;
  readonly severity: GovernanceSeverity;
  readonly description: string;
  readonly metadata: {
    readonly code: string;
    readonly notes: string;
  };
};

export type GovernanceEvaluation = {
  readonly id: string;
  readonly sessionId: string;
  readonly runtimeExecutionId: string | null;
  readonly passedRules: readonly GovernanceRule[];
  readonly failedRules: readonly GovernanceRule[];
  readonly overallStatus: GovernanceOverallStatus;
  readonly score: number;
  readonly createdAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly evaluatedRuleCount: number;
  };
};

export type RuntimeGovernancePackage = {
  readonly id: string;
  readonly version: string;
  readonly evaluation: GovernanceEvaluation;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: RuntimeGovernanceValidation | null;
};

export type RuntimeGovernanceValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeGovernanceValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeGovernanceValidationIssue[];
  readonly validatedAt: string;
};

export type EvaluateGovernanceInput = {
  readonly sessionId: string;
  readonly runtimeExecutionId?: string | null;
  readonly title?: string;
  readonly hasObservability?: boolean;
  readonly observabilityHealthy?: boolean;
  readonly healthScore?: number;
  readonly healthOverall?: 'Healthy' | 'Degraded' | 'Critical' | 'Unknown';
  readonly hasAuditTrail?: boolean;
  readonly auditImmutable?: boolean;
  readonly auditValidated?: boolean;
  readonly healthValidated?: boolean;
  readonly observabilityValidated?: boolean;
};

export type RuntimeGovernanceIndexEntry = {
  readonly packageId: string;
  readonly evaluationId: string;
  readonly sessionId: string;
  readonly overallStatus: GovernanceOverallStatus;
  readonly score: number;
};

export type RuntimeGovernanceEventType =
  | 'GovernanceEvaluated'
  | 'GovernancePublished'
  | 'GovernanceValidated';

export type RuntimeGovernanceEvent = {
  readonly eventId: string;
  readonly type: RuntimeGovernanceEventType;
  readonly packageId: string;
  readonly evaluationId: string | null;
  readonly at: string;
  readonly message: string;
};
