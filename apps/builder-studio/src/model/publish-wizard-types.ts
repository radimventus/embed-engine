/**
 * Publish Wizard (EPIC-BX-06).
 * Orchestrates publication using Validation Dashboard + Export Certification + existing Manifest.
 * No own validation rules, no Runtime mutation, no AI.
 *
 * Naming note: BLD publish types already export PublishResult / PublishedPackage.
 * Epic PublishedArtifact is the wizard artifact model below.
 */

export type PublicationSessionStatus =
  | 'STARTED'
  | 'VALIDATED'
  | 'READY'
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'FAILED'
  | 'CANCELLED';

export type PublicationSession = {
  readonly id: string;
  readonly projectId: string;
  readonly startedAt: string;
  readonly finishedAt: string | null;
  readonly status: PublicationSessionStatus;
  readonly validationReportId: string | null;
  readonly publicationId: string | null;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly version: string | null;
    readonly step: PublishWizardStep;
  };
};

export type PublishWizardStep =
  | 'validation'
  | 'summary'
  | 'publish'
  | 'success';

export type PublishedArtifact = {
  readonly id: string;
  readonly projectId: string;
  readonly version: string;
  readonly embedId: string;
  readonly manifestId: string;
  readonly certificationId: string;
  readonly publishedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly embedCode: string;
    readonly previewUrl: string;
    readonly sessionId: string;
  };
};

export type PublishWizardInput = {
  readonly projectId: string;
  readonly title?: string;
};

export type PublishPrepareInput = {
  readonly validationReportId: string;
  readonly certificationId: string;
  readonly manifestId: string;
  readonly version?: string;
  readonly projectTitle?: string;
  readonly assetCount?: number;
  readonly metadataSlug?: string;
};

export type PublishSummary = {
  readonly projectId: string;
  readonly projectTitle: string;
  readonly assetCount: number;
  readonly metadataSlug: string;
  readonly manifestId: string;
  readonly certificationId: string;
  readonly version: string;
  readonly validationReportId: string;
  readonly readinessScore: number;
  readonly overallStatus: string;
  readonly warningCount: number;
  readonly blockedCount: number;
};

export type PublishWizardEventType =
  | 'PublishStarted'
  | 'PublishValidated'
  | 'PublicationCreated'
  | 'PublishCompleted'
  | 'PublishFailed';

export type PublishWizardEvent = {
  readonly eventId: string;
  readonly type: PublishWizardEventType;
  readonly sessionId: string;
  readonly projectId: string;
  readonly publicationId: string | null;
  readonly at: string;
  readonly message: string;
};

export type PublicationHistoryEntry = {
  readonly publicationId: string;
  readonly projectId: string;
  readonly version: string;
  readonly embedId: string;
  readonly publishedAt: string;
  readonly sessionId: string;
};

export type InitializePublishWizardInput = {
  readonly projectId: string;
  readonly title?: string;
};
