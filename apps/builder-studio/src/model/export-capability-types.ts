/**
 * Export Capability Registry (EPIC-BLD-68)
 * Pure metadata registry describing which export capabilities are supported
 * by which export schema versions.
 */

export type ExportCapabilityStatus = 'Active' | 'Deprecated' | 'Removed';

export type ExportCapability = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly supportedSchemaVersions: readonly string[];
  readonly status: ExportCapabilityStatus;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
  };
};

export type ExportCapabilityValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type ExportCapabilityValidation = {
  readonly valid: boolean;
  readonly issues: readonly ExportCapabilityValidationIssue[];
  readonly validatedAt: string;
};

export type ExportCapabilityPackage = {
  readonly id: string;
  readonly version: string;
  readonly capabilities: readonly ExportCapability[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Active' | 'Disposed';
  };
  readonly validation: ExportCapabilityValidation | null;
};

export type RegisterExportCapabilityInput = {
  readonly name: string;
  readonly description: string;
  readonly supportedSchemaVersions: readonly string[];
  readonly title?: string;
  readonly notes?: string;
  readonly status?: ExportCapabilityStatus;
};

export type InitializeExportCapabilityRegistryInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly capability?: RegisterExportCapabilityInput;
};

export type ExportCapabilityIndexEntry = {
  readonly packageId: string;
  readonly capabilityId: string;
  readonly name: string;
  readonly supportedSchemaVersions: readonly string[];
  readonly status: ExportCapabilityStatus;
};

export type ExportCapabilityEventType =
  | 'ExportCapabilityRegistered'
  | 'ExportCapabilityValidated'
  | 'ExportCapabilityDeprecated'
  | 'ExportCapabilityRemoved';

export type ExportCapabilityEvent = {
  readonly eventId: string;
  readonly type: ExportCapabilityEventType;
  readonly packageId: string;
  readonly capabilityId: string | null;
  readonly at: string;
  readonly message: string;
};

