/**
 * Platform Publication Catalog (EPIC-BLD-57).
 * Public catalog layer over Published Object Registry — no registry mutation.
 */

export type PlatformPublicationStatus =
  | 'Registered'
  | 'Active'
  | 'Hidden'
  | 'Archived';

export type PlatformPublicationVisibility = 'public' | 'internal' | 'partner';

export type PlatformPublicationCategory =
  | 'residential'
  | 'commercial'
  | 'land'
  | 'general';

export type PlatformPublicationEntry = {
  readonly id: string;
  readonly objectId: string;
  readonly publicationVersion: string;
  readonly status: PlatformPublicationStatus;
  readonly category: PlatformPublicationCategory;
  readonly visibility: PlatformPublicationVisibility;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly sourcePublishedObjectId: string | null;
    readonly objectVersion: string;
    readonly runtimeVersion: string | null;
  };
};

export type PlatformPublicationSnapshot = {
  readonly id: string;
  readonly entries: readonly PlatformPublicationEntry[];
  readonly generatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly sessionId: string;
  };
};

export type PlatformPublicationPackage = {
  readonly id: string;
  readonly version: string;
  readonly snapshot: PlatformPublicationSnapshot;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Active' | 'Disposed';
  };
  readonly validation: PlatformPublicationValidation | null;
};

export type PlatformPublicationValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type PlatformPublicationValidation = {
  readonly valid: boolean;
  readonly issues: readonly PlatformPublicationValidationIssue[];
  readonly validatedAt: string;
};

export type RegisterPlatformPublicationInput = {
  readonly objectId: string;
  readonly publicationVersion: string;
  readonly title?: string;
  readonly notes?: string;
  readonly status?: PlatformPublicationStatus;
  readonly category?: PlatformPublicationCategory;
  readonly visibility?: PlatformPublicationVisibility;
  readonly sourcePublishedObjectId?: string | null;
  readonly objectVersion?: string;
  readonly runtimeVersion?: string | null;
};

export type InitializePlatformPublicationInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly entries?: readonly RegisterPlatformPublicationInput[];
};

export type PlatformPublicationIndexEntry = {
  readonly packageId: string;
  readonly snapshotId: string;
  readonly entryId: string;
  readonly objectId: string;
  readonly publicationVersion: string;
  readonly category: PlatformPublicationCategory;
  readonly visibility: PlatformPublicationVisibility;
  readonly status: PlatformPublicationStatus;
};

export type PlatformPublicationEventType =
  | 'PlatformPublicationRegistered'
  | 'PlatformPublicationRefreshed'
  | 'PlatformPublicationValidated'
  | 'PlatformPublicationIndexed';

export type PlatformPublicationEvent = {
  readonly eventId: string;
  readonly type: PlatformPublicationEventType;
  readonly packageId: string;
  readonly snapshotId: string | null;
  readonly entryId: string | null;
  readonly at: string;
  readonly message: string;
};
