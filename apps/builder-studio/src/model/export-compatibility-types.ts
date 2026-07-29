/**
 * Export Compatibility Registry (EPIC-BLD-67).
 * Registry of compatibility between export schema versions.
 */

export type ExportCompatibilityLevel = 'FULL' | 'BACKWARD' | 'FORWARD' | 'INCOMPATIBLE';

export type ExportCompatibilityStatus = 'Active' | 'Deprecated' | 'Removed';

export type ExportCompatibility = {
  readonly id: string;
  readonly sourceSchemaVersion: string;
  readonly targetSchemaVersion: string;
  readonly compatibilityLevel: ExportCompatibilityLevel;
  readonly status: ExportCompatibilityStatus;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
  };
};

export type ExportCompatibilityValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type ExportCompatibilityValidation = {
  readonly valid: boolean;
  readonly issues: readonly ExportCompatibilityValidationIssue[];
  readonly validatedAt: string;
};

export type ExportCompatibilityPackage = {
  readonly id: string;
  readonly version: string;
  readonly compatibilities: readonly ExportCompatibility[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Active' | 'Disposed';
  };
  readonly validation: ExportCompatibilityValidation | null;
};

export type RegisterExportCompatibilityInput = {
  readonly sourceSchemaVersion: string;
  readonly targetSchemaVersion: string;
  readonly compatibilityLevel: ExportCompatibilityLevel;
  readonly title?: string;
  readonly notes?: string;
};

export type InitializeExportCompatibilityRegistryInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly compatibility?: RegisterExportCompatibilityInput;
};

export type ExportCompatibilityIndexEntry = {
  readonly packageId: string;
  readonly compatibilityId: string;
  readonly sourceSchemaVersion: string;
  readonly targetSchemaVersion: string;
  readonly compatibilityLevel: ExportCompatibilityLevel;
  readonly status: ExportCompatibilityStatus;
};

export type ExportCompatibilityEventType =
  | 'ExportCompatibilityRegistered'
  | 'ExportCompatibilityValidated'
  | 'ExportCompatibilityDeprecated'
  | 'ExportCompatibilityRemoved';

export type ExportCompatibilityEvent = {
  readonly eventId: string;
  readonly type: ExportCompatibilityEventType;
  readonly packageId: string;
  readonly compatibilityId: string | null;
  readonly at: string;
  readonly message: string;
};
