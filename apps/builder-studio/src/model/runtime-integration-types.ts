/**
 * Runtime Integration Hub (EPIC-BLD-48).
 * Integration catalog of published Runtime packages — no new Runtime objects.
 */

export type RuntimeIntegrationPackageType =
  | 'Policy'
  | 'Governance'
  | 'Observability'
  | 'Health'
  | 'Audit'
  | 'Enforcement'
  | 'Resilience'
  | 'Recovery'
  | 'Operations'
  | 'Other';

export type RuntimeIntegrationRecord = {
  readonly id: string;
  readonly packageId: string;
  readonly packageType: RuntimeIntegrationPackageType;
  readonly version: string;
  readonly source: string;
  readonly publishedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly status: string;
  };
};

export type RuntimeIntegrationCatalog = {
  readonly id: string;
  readonly records: readonly RuntimeIntegrationRecord[];
  readonly createdAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly sessionId: string;
  };
};

export type RuntimeIntegrationPackage = {
  readonly id: string;
  readonly version: string;
  readonly catalog: RuntimeIntegrationCatalog;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: RuntimeIntegrationValidation | null;
};

export type RuntimeIntegrationValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeIntegrationValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeIntegrationValidationIssue[];
  readonly validatedAt: string;
};

export type RegisterRuntimePackageInput = {
  readonly packageId: string;
  readonly packageType: RuntimeIntegrationPackageType;
  readonly version: string;
  readonly source: string;
  readonly publishedAt?: string | null;
  readonly title?: string;
  readonly status?: string | null;
  readonly notes?: string | null;
};

export type InitializeIntegrationInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly packages?: readonly RegisterRuntimePackageInput[];
};

export type RuntimeIntegrationIndexEntry = {
  readonly integrationPackageId: string;
  readonly catalogId: string;
  readonly recordId: string;
  readonly packageId: string;
  readonly packageType: RuntimeIntegrationPackageType;
  readonly source: string;
};

export type RuntimeIntegrationEventType =
  | 'RuntimePackageRegistered'
  | 'RuntimeCatalogUpdated'
  | 'RuntimeIntegrationPublished'
  | 'RuntimeIntegrationValidated';

export type RuntimeIntegrationEvent = {
  readonly eventId: string;
  readonly type: RuntimeIntegrationEventType;
  readonly packageId: string;
  readonly catalogId: string | null;
  readonly recordId: string | null;
  readonly at: string;
  readonly message: string;
};
