/**
 * Runtime Resilience Engine (EPIC-BLD-42).
 * Creates Recovery Plans only — never executes recovery / restart / checkpoint restore.
 */

export type RecoveryStrategyKind =
  | 'CONTINUE'
  | 'RESTORE_CHECKPOINT'
  | 'RESTART_MODULE'
  | 'RESTART_RUNTIME'
  | 'MANUAL_INTERVENTION';

export type RecoverySeverity = 'info' | 'warning' | 'error' | 'critical';

export type EstimatedRecoveryLevel = 'Full' | 'Partial' | 'Minimal' | 'None';

export type RecoveryAction = {
  readonly id: string;
  readonly step: number;
  readonly description: string;
  readonly priority: number;
  readonly metadata: {
    readonly notes: string;
    readonly strategy: RecoveryStrategyKind;
  };
};

export type RecoveryPlan = {
  readonly id: string;
  readonly sessionId: string;
  readonly runtimeExecutionId: string | null;
  readonly severity: RecoverySeverity;
  readonly recoveryStrategy: RecoveryStrategyKind;
  readonly recommendedSteps: readonly RecoveryAction[];
  readonly estimatedRecoveryLevel: EstimatedRecoveryLevel;
  readonly createdAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly healthStatus: string | null;
    readonly enforcementStatus: string | null;
    readonly disruptionCodes: readonly string[];
  };
};

export type RuntimeResiliencePackage = {
  readonly id: string;
  readonly version: string;
  readonly recoveryPlan: RecoveryPlan;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: RuntimeResilienceValidation | null;
};

export type RuntimeResilienceValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeResilienceValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeResilienceValidationIssue[];
  readonly validatedAt: string;
};

export type EvaluateResilienceInput = {
  readonly sessionId: string;
  readonly runtimeExecutionId?: string | null;
  readonly title?: string;
  readonly healthStatus?:
    | 'Healthy'
    | 'Degraded'
    | 'Critical'
    | 'Unknown'
    | null;
  readonly healthScore?: number | null;
  readonly enforcementStatus?: 'ALLOW' | 'WARN' | 'RESTRICT' | 'BLOCK' | null;
  readonly disruptionCodes?: readonly string[];
  readonly moduleFailures?: readonly string[];
  readonly hasCheckpoint?: boolean;
};

export type RuntimeResilienceIndexEntry = {
  readonly packageId: string;
  readonly planId: string;
  readonly sessionId: string;
  readonly recoveryStrategy: RecoveryStrategyKind;
};

export type RuntimeResilienceEventType =
  | 'RecoveryEvaluated'
  | 'RecoveryPlanCreated'
  | 'RecoveryPublished'
  | 'RecoveryValidated';

export type RuntimeResilienceEvent = {
  readonly eventId: string;
  readonly type: RuntimeResilienceEventType;
  readonly packageId: string;
  readonly planId: string | null;
  readonly at: string;
  readonly message: string;
};
