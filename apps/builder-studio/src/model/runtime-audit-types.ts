/**
 * Runtime Audit Engine (EPIC-BLD-38).
 * Immutable audit trail — never mutates Runtime / State / Knowledge.
 */

export type AuditEntityKind =
  | 'DecisionExecution'
  | 'RuntimeExecution'
  | 'ModuleExecution'
  | 'StateTransition'
  | 'PublishedPackage'
  | 'ValidationEvent';

export type RuntimeAuditRecord = {
  readonly id: string;
  readonly sessionId: string;
  readonly runtimeExecutionId: string | null;
  readonly moduleExecutionId: string | null;
  readonly entity: AuditEntityKind;
  readonly action: string;
  readonly timestamp: string;
  readonly metadata: {
    readonly source: string;
    readonly notes: string;
    readonly packageId: string | null;
  };
};

export type RuntimeAuditTrail = {
  readonly id: string;
  readonly sessionId: string;
  readonly records: readonly RuntimeAuditRecord[];
  readonly startedAt: string;
  readonly completedAt: string | null;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly status: 'Open' | 'Finalized';
  };
};

export type RuntimeAuditPackage = {
  readonly id: string;
  readonly version: string;
  readonly trail: RuntimeAuditTrail;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
    readonly immutable: true;
  };
  readonly validation: RuntimeAuditValidation | null;
};

export type RuntimeAuditValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeAuditValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeAuditValidationIssue[];
  readonly validatedAt: string;
};

export type AuditEventSource = {
  readonly sessionId: string;
  readonly runtimeExecutionId?: string | null;
  readonly moduleExecutionId?: string | null;
  readonly entity: AuditEntityKind;
  readonly action: string;
  readonly timestamp: string;
  readonly source: string;
  readonly packageId?: string | null;
};

export type RecordAuditInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly sources: readonly AuditEventSource[];
};

export type AppendAuditInput = {
  readonly packageId: string;
  readonly sources: readonly AuditEventSource[];
};

export type RuntimeAuditIndexEntry = {
  readonly packageId: string;
  readonly trailId: string;
  readonly sessionId: string;
  readonly recordCount: number;
  readonly status: RuntimeAuditPackage['metadata']['status'];
};

export type RuntimeAuditEventType =
  | 'AuditRecordCreated'
  | 'AuditTrailUpdated'
  | 'AuditPublished'
  | 'AuditValidated';

export type RuntimeAuditEvent = {
  readonly eventId: string;
  readonly type: RuntimeAuditEventType;
  readonly packageId: string;
  readonly trailId: string | null;
  readonly recordId: string | null;
  readonly at: string;
  readonly message: string;
};
