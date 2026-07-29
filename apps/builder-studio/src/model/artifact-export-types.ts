/**
 * Artifact Export Contract (EPIC-BLD-65).
 * Public deterministic export contract for platform artifacts.
 */

export type ArtifactExportModel = {
  readonly id: string;
  readonly artifactId: string;
  readonly artifactType: string;
  readonly exportVersion: string;
  readonly schemaVersion: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Active' | 'Exported';
  };
};

export type ArtifactExportValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type ArtifactExportValidation = {
  readonly valid: boolean;
  readonly issues: readonly ArtifactExportValidationIssue[];
  readonly validatedAt: string;
};

export type ArtifactExportPackage = {
  readonly id: string;
  readonly version: string;
  readonly exportModel: ArtifactExportModel;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Active' | 'Exported' | 'Disposed';
  };
  readonly validation: ArtifactExportValidation | null;
};

export type BuildArtifactExportInput = {
  readonly artifactId: string;
  readonly artifactType: string;
  readonly exportVersion: string;
  readonly schemaVersion: string;
  readonly title?: string;
  readonly notes?: string;
  readonly status?: 'Draft' | 'Active' | 'Exported';
};

export type InitializeArtifactExportInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly export?: BuildArtifactExportInput;
};

export type ArtifactExportIndexEntry = {
  readonly packageId: string;
  readonly artifactId: string;
  readonly artifactType: string;
  readonly exportVersion: string;
  readonly schemaVersion: string;
  readonly status: ArtifactExportPackage['metadata']['status'];
};

export type ArtifactExportEventType =
  | 'ArtifactExportBuilt'
  | 'ArtifactExportValidated'
  | 'ArtifactExportPublished'
  | 'ArtifactExportInvalidated';

export type ArtifactExportEvent = {
  readonly eventId: string;
  readonly type: ArtifactExportEventType;
  readonly packageId: string;
  readonly exportModelId: string | null;
  readonly artifactId: string | null;
  readonly at: string;
  readonly message: string;
};
