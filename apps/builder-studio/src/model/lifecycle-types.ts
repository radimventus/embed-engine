/**
 * Project Lifecycle & Platform Integration (EPIC-BLD-06).
 * Builder orchestration only — no persistence, no Git, no cloud.
 */

export type LifecycleStatus =
  | 'Draft'
  | 'ReadyForBuild'
  | 'Built'
  | 'ReadyForPublish'
  | 'Published'
  | 'Archived';

export type ProjectType = 'decision-experience';

/**
 * Platform Project Manifest — SSOT for project identity & lifecycle.
 * Distinct from package content ProjectManifest (EPIC-BLD-03).
 */
export type BuilderProjectManifest = {
  readonly projectId: string;
  readonly projectType: ProjectType;
  readonly version: string;
  readonly status: LifecycleStatus;
  readonly owner: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly buildVersion: string | null;
  readonly publishVersion: string | null;
  readonly runtimeVersion: string | null;
};

export type VersionInfo = {
  readonly project: string;
  readonly build: string | null;
  readonly publish: string | null;
  readonly runtime: string | null;
};

export type ReadinessIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly message: string;
  readonly recommendation: string;
};

export type ReadinessReport = {
  readonly projectId: string;
  readonly overallPercent: number;
  readonly mediaPercent: number;
  readonly layoutPercent: number;
  readonly knowledgePercent: number;
  readonly buildPercent: number;
  readonly publishPercent: number;
  readonly errors: readonly ReadinessIssue[];
  readonly warnings: readonly ReadinessIssue[];
  readonly recommendations: readonly string[];
};

export type PlatformEventType =
  | 'ProjectCreated'
  | 'BuildFinished'
  | 'PublishFinished'
  | 'PreviewOpened'
  | 'ProjectArchived';

export type PlatformEvent = {
  readonly eventId: string;
  readonly type: PlatformEventType;
  readonly projectId: string;
  readonly at: string;
  readonly message: string;
};

export type TimelineEntry = {
  readonly entryId: string;
  readonly at: string;
  readonly label: string;
  readonly eventType: PlatformEventType;
};

/**
 * Future Runtime integration contract — no implementation in BLD-06.
 */
export type RuntimeGateway = {
  readonly openSession: (input: {
    readonly packageId: string;
    readonly runtimeEntry: string;
  }) => Promise<{ readonly sessionId: string }>;
  readonly closeSession: (sessionId: string) => Promise<void>;
};

/**
 * Future Publish distribution contract — no implementation in BLD-06.
 */
export type PublishGateway = {
  readonly deploy: (input: {
    readonly packageId: string;
    readonly targetId: string;
  }) => Promise<{ readonly deploymentId: string }>;
};

/**
 * Future storage contract — no implementation in BLD-06.
 */
export type StorageGateway = {
  readonly putObject: (input: {
    readonly key: string;
    readonly contentType: string;
  }) => Promise<{ readonly uri: string }>;
  readonly deleteObject: (key: string) => Promise<void>;
};
