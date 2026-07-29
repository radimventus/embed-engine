/**
 * Artifact Dependency Registry (EPIC-BLD-62).
 * Formal registry of relationships between published artifacts.
 */

export type ArtifactDependencyType =
  | 'REQUIRES'
  | 'OPTIONAL'
  | 'DERIVED_FROM'
  | 'REFERENCES';

export type ArtifactDependency = {
  readonly id: string;
  readonly sourceArtifactId: string;
  readonly targetArtifactId: string;
  readonly dependencyType: ArtifactDependencyType;
  readonly status: 'Active' | 'Removed';
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
  };
};

export type ArtifactDependencyValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type ArtifactDependencyValidation = {
  readonly valid: boolean;
  readonly issues: readonly ArtifactDependencyValidationIssue[];
  readonly validatedAt: string;
};

export type ArtifactDependencyPackage = {
  readonly id: string;
  readonly version: string;
  readonly dependencies: readonly ArtifactDependency[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Active' | 'Disposed';
  };
  readonly validation: ArtifactDependencyValidation | null;
};

export type RegisterArtifactDependencyInput = {
  readonly sourceArtifactId: string;
  readonly targetArtifactId: string;
  readonly dependencyType: ArtifactDependencyType;
  readonly title?: string;
  readonly notes?: string;
};

export type InitializeArtifactDependencyRegistryInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly dependency?: RegisterArtifactDependencyInput;
};

export type ArtifactDependencyIndexEntry = {
  readonly packageId: string;
  readonly dependencyId: string;
  readonly sourceArtifactId: string;
  readonly targetArtifactId: string;
  readonly dependencyType: ArtifactDependencyType;
  readonly status: ArtifactDependency['status'];
};

export type ArtifactDependencyEventType =
  | 'ArtifactDependencyRegistered'
  | 'ArtifactDependencyRemoved'
  | 'ArtifactDependencyValidated'
  | 'ArtifactDependencyIndexed';

export type ArtifactDependencyEvent = {
  readonly eventId: string;
  readonly type: ArtifactDependencyEventType;
  readonly packageId: string;
  readonly dependencyId: string | null;
  readonly sourceArtifactId: string | null;
  readonly at: string;
  readonly message: string;
};
