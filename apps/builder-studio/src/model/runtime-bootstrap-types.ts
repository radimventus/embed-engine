/**
 * Runtime Session Bootstrap (EPIC-BLD-60).
 * Deterministic Runtime input preparation without executing Runtime.
 */

export type RuntimeSessionModel = {
  readonly id: string;
  readonly publicationId: string;
  readonly objectId: string;
  readonly runtimeVersion: string;
  readonly bootstrapVersion: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly readinessStatus:
      | 'READY'
      | 'READY_WITH_WARNINGS'
      | 'NOT_READY'
      | 'UNKNOWN';
    readonly sessionState: 'Prepared' | 'Validated' | 'Published';
  };
};

export type RuntimeBootstrapValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeBootstrapValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeBootstrapValidationIssue[];
  readonly validatedAt: string;
};

export type RuntimeBootstrapPackage = {
  readonly id: string;
  readonly version: string;
  readonly runtimeSession: RuntimeSessionModel;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Active' | 'Published' | 'Disposed';
  };
  readonly validation: RuntimeBootstrapValidation | null;
};

export type BuildRuntimeBootstrapInput = {
  readonly publicationId: string;
  readonly objectId: string;
  readonly runtimeVersion: string;
  readonly bootstrapVersion: string;
  readonly title?: string;
  readonly notes?: string;
  readonly readinessStatus?: RuntimeSessionModel['metadata']['readinessStatus'];
};

export type InitializeRuntimeBootstrapInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly bootstrap?: BuildRuntimeBootstrapInput;
};

export type RuntimeBootstrapIndexEntry = {
  readonly packageId: string;
  readonly runtimeSessionId: string;
  readonly publicationId: string;
  readonly objectId: string;
  readonly runtimeVersion: string;
  readonly bootstrapVersion: string;
  readonly sessionState: RuntimeSessionModel['metadata']['sessionState'];
};

export type RuntimeBootstrapEventType =
  | 'RuntimeBootstrapCreated'
  | 'RuntimeBootstrapValidated'
  | 'RuntimeBootstrapPublished'
  | 'RuntimeBootstrapFailed';

export type RuntimeBootstrapEvent = {
  readonly eventId: string;
  readonly type: RuntimeBootstrapEventType;
  readonly packageId: string;
  readonly runtimeSessionId: string | null;
  readonly publicationId: string | null;
  readonly at: string;
  readonly message: string;
};
