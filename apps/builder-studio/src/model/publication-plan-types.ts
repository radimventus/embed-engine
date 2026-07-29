/**
 * Publication Plan Builder (EPIC-BLD-63).
 * Deterministic publication planning without execution.
 */

export type PublicationPlanStepOperation = 'PUBLISH' | 'SKIP' | 'VERIFY';

export type PublicationPlanStep = {
  readonly id: string;
  readonly artifactId: string;
  readonly order: number;
  readonly operation: PublicationPlanStepOperation;
  readonly status: 'Pending' | 'Planned' | 'Published';
};

export type PublicationPlan = {
  readonly id: string;
  readonly rootArtifactId: string;
  readonly steps: readonly PublicationPlanStep[];
  readonly dependencies: readonly string[];
  readonly status: 'Draft' | 'Valid' | 'Published' | 'Invalid';
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
  };
};

export type PublicationPlanValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type PublicationPlanValidation = {
  readonly valid: boolean;
  readonly issues: readonly PublicationPlanValidationIssue[];
  readonly validatedAt: string;
};

export type PublicationPlanPackage = {
  readonly id: string;
  readonly version: string;
  readonly plan: PublicationPlan;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Active' | 'Published' | 'Disposed';
  };
  readonly validation: PublicationPlanValidation | null;
};

export type BuildPublicationPlanInput = {
  readonly rootArtifactId: string;
  readonly dependencies: readonly {
    readonly sourceArtifactId: string;
    readonly targetArtifactId: string;
    readonly dependencyType: 'REQUIRES' | 'OPTIONAL' | 'DERIVED_FROM' | 'REFERENCES';
    readonly status: 'Active' | 'Removed';
  }[];
  readonly title?: string;
  readonly notes?: string;
};

export type InitializePublicationPlanInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly plan?: BuildPublicationPlanInput;
};

export type PublicationPlanIndexEntry = {
  readonly packageId: string;
  readonly planId: string;
  readonly rootArtifactId: string;
  readonly status: PublicationPlan['status'];
  readonly stepCount: number;
};

export type PublicationPlanEventType =
  | 'PublicationPlanBuilt'
  | 'PublicationPlanValidated'
  | 'PublicationPlanPublished'
  | 'PublicationPlanInvalidated';

export type PublicationPlanEvent = {
  readonly eventId: string;
  readonly type: PublicationPlanEventType;
  readonly packageId: string;
  readonly planId: string | null;
  readonly rootArtifactId: string | null;
  readonly at: string;
  readonly message: string;
};
