/**
 * Publication Readiness Validator (EPIC-BLD-59).
 * Deterministic readiness gate before Client Studio consumption.
 */

export type PublicationReadinessStatus =
  | 'READY'
  | 'READY_WITH_WARNINGS'
  | 'NOT_READY';

export type PublicationCheck = {
  readonly id: string;
  readonly name: string;
  readonly result: 'pass' | 'warning' | 'fail';
  readonly severity: 'info' | 'warning' | 'error';
  readonly message: string;
};

export type PublicationReadinessReport = {
  readonly id: string;
  readonly publicationId: string;
  readonly status: PublicationReadinessStatus;
  readonly checks: readonly PublicationCheck[];
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly objectId: string;
    readonly version: string;
  };
};

export type PublicationReadinessPackage = {
  readonly id: string;
  readonly version: string;
  readonly report: PublicationReadinessReport;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Validated' | 'Published' | 'Disposed';
  };
};

export type ValidatePublicationReadinessInput = {
  readonly publicationId: string;
  readonly objectId: string;
  readonly version: string;
  readonly title?: string;
  readonly notes?: string;
  readonly checks?: readonly PublicationCheck[];
};

export type InitializePublicationReadinessInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly publication?: ValidatePublicationReadinessInput;
};

export type PublicationReadinessIndexEntry = {
  readonly packageId: string;
  readonly reportId: string;
  readonly publicationId: string;
  readonly objectId: string;
  readonly status: PublicationReadinessStatus;
};

export type PublicationReadinessEventType =
  | 'PublicationReadinessValidated'
  | 'PublicationReadinessPassed'
  | 'PublicationReadinessFailed'
  | 'PublicationReadinessPublished';

export type PublicationReadinessEvent = {
  readonly eventId: string;
  readonly type: PublicationReadinessEventType;
  readonly packageId: string;
  readonly reportId: string | null;
  readonly publicationId: string | null;
  readonly at: string;
  readonly message: string;
};
