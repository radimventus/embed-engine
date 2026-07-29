/**
 * Artifact Version Manager (EPIC-BLD-61).
 * Central version metadata registry for platform artifacts.
 */

export type ArtifactVersionStatus =
  | 'ACTIVE'
  | 'SUPPORTED'
  | 'DEPRECATED'
  | 'ARCHIVED';

export type ArtifactVersion = {
  readonly id: string;
  readonly artifactId: string;
  readonly version: string;
  readonly status: ArtifactVersionStatus;
  readonly createdAt: string;
  readonly metadata: {
    readonly title: string;
    readonly artifactType:
      | 'PublicationObject'
      | 'PublishedObject'
      | 'ClientPublication'
      | 'RuntimeBootstrap'
      | 'Unknown';
    readonly notes: string;
    readonly active: boolean;
  };
};

export type ArtifactVersionPackage = {
  readonly id: string;
  readonly version: string;
  readonly artifactVersions: readonly ArtifactVersion[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Active' | 'Disposed';
  };
  readonly validation: ArtifactVersionValidation | null;
};

export type ArtifactVersionValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type ArtifactVersionValidation = {
  readonly valid: boolean;
  readonly issues: readonly ArtifactVersionValidationIssue[];
  readonly validatedAt: string;
};

export type RegisterArtifactVersionInput = {
  readonly artifactId: string;
  readonly version: string;
  readonly artifactType?: ArtifactVersion['metadata']['artifactType'];
  readonly title?: string;
  readonly notes?: string;
  readonly active?: boolean;
};

export type InitializeArtifactVersionManagerInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly version?: RegisterArtifactVersionInput;
};

export type ArtifactVersionIndexEntry = {
  readonly packageId: string;
  readonly artifactVersionId: string;
  readonly artifactId: string;
  readonly version: string;
  readonly status: ArtifactVersionStatus;
  readonly active: boolean;
};

export type ArtifactVersionEventType =
  | 'ArtifactVersionRegistered'
  | 'ArtifactVersionActivated'
  | 'ArtifactVersionDeprecated'
  | 'ArtifactVersionValidated';

export type ArtifactVersionEvent = {
  readonly eventId: string;
  readonly type: ArtifactVersionEventType;
  readonly packageId: string;
  readonly artifactVersionId: string | null;
  readonly artifactId: string | null;
  readonly at: string;
  readonly message: string;
};
