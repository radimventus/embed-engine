/**
 * Export Schema Registry (EPIC-BLD-66).
 * Central registry of supported export schemas for platform artifacts.
 */

export type ExportSchemaStatus = 'Active' | 'Deprecated' | 'Removed';

export type ExportSchema = {
  readonly id: string;
  readonly name: string;
  readonly schemaVersion: string;
  readonly status: ExportSchemaStatus;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
  };
};

export type ExportSchemaValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type ExportSchemaValidation = {
  readonly valid: boolean;
  readonly issues: readonly ExportSchemaValidationIssue[];
  readonly validatedAt: string;
};

export type ExportSchemaPackage = {
  readonly id: string;
  readonly version: string;
  readonly schemas: readonly ExportSchema[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Active' | 'Disposed';
  };
  readonly validation: ExportSchemaValidation | null;
};

export type RegisterExportSchemaInput = {
  readonly name: string;
  readonly schemaVersion: string;
  readonly title?: string;
  readonly notes?: string;
  readonly status?: ExportSchemaStatus;
};

export type InitializeExportSchemaRegistryInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly schema?: RegisterExportSchemaInput;
};

export type ExportSchemaIndexEntry = {
  readonly packageId: string;
  readonly schemaId: string;
  readonly name: string;
  readonly schemaVersion: string;
  readonly status: ExportSchemaStatus;
};

export type ExportSchemaEventType =
  | 'ExportSchemaRegistered'
  | 'ExportSchemaValidated'
  | 'ExportSchemaDeprecated'
  | 'ExportSchemaRemoved';

export type ExportSchemaEvent = {
  readonly eventId: string;
  readonly type: ExportSchemaEventType;
  readonly packageId: string;
  readonly schemaId: string | null;
  readonly at: string;
  readonly message: string;
};
