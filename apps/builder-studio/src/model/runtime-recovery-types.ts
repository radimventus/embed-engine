/**
 * Runtime Recovery Orchestrator (EPIC-BLD-43).
 * Builds Recovery Sequences only — never executes recovery / restart / checkpoint restore.
 */

export type RecoveryRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type RecoveryStepAction =
  | 'ConfirmHealth'
  | 'PreserveAudit'
  | 'RestoreCheckpoint'
  | 'RestartModule'
  | 'RestartRuntime'
  | 'RevalidateState'
  | 'EscalateOperator'
  | 'ContinueSession';

export type RecoveryStep = {
  readonly id: string;
  readonly order: number;
  readonly action: RecoveryStepAction;
  readonly description: string;
  readonly dependsOn: readonly string[];
  readonly metadata: {
    readonly notes: string;
    readonly sourceActionId: string | null;
    readonly estimatedSeconds: number;
  };
};

export type RecoverySequence = {
  readonly id: string;
  readonly runtimeExecutionId: string | null;
  readonly steps: readonly RecoveryStep[];
  readonly estimatedDuration: number;
  readonly riskLevel: RecoveryRiskLevel;
  readonly createdAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly sessionId: string;
    readonly planId: string | null;
    readonly recoveryStrategy: string | null;
  };
};

export type RuntimeRecoveryPackage = {
  readonly id: string;
  readonly version: string;
  readonly sequence: RecoverySequence;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
    readonly planId: string | null;
  };
  readonly validation: RuntimeRecoveryValidation | null;
};

export type RuntimeRecoveryValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeRecoveryValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeRecoveryValidationIssue[];
  readonly validatedAt: string;
};

export type BuildRecoverySequenceInput = {
  readonly sessionId: string;
  readonly runtimeExecutionId?: string | null;
  readonly title?: string;
  readonly planId?: string | null;
  readonly recoveryStrategy?:
    | 'CONTINUE'
    | 'RESTORE_CHECKPOINT'
    | 'RESTART_MODULE'
    | 'RESTART_RUNTIME'
    | 'MANUAL_INTERVENTION'
    | null;
  readonly recommendedSteps?: readonly {
    readonly id: string;
    readonly step: number;
    readonly description: string;
    readonly priority: number;
  }[];
  readonly severity?: 'info' | 'warning' | 'error' | 'critical' | null;
};

export type RuntimeRecoveryIndexEntry = {
  readonly packageId: string;
  readonly sequenceId: string;
  readonly sessionId: string;
  readonly riskLevel: RecoveryRiskLevel;
};

export type RuntimeRecoveryEventType =
  | 'RecoverySequenceBuilt'
  | 'RecoverySequenceValidated'
  | 'RecoveryPackagePublished'
  | 'RecoveryOverviewUpdated';

export type RuntimeRecoveryEvent = {
  readonly eventId: string;
  readonly type: RuntimeRecoveryEventType;
  readonly packageId: string;
  readonly sequenceId: string | null;
  readonly at: string;
  readonly message: string;
};
