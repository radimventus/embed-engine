/**
 * Published Object Registry (EPIC-BLD-56).
 * Local registry of published objects — evidence only, no Object Package mutation.
 */

export type PublishedObjectStatus = 'Registered' | 'Archived' | 'Indexed';

export type PublishedObjectManifestRef = {
  readonly id: string;
  readonly objectVersion: string;
  readonly runtimeVersion: string;
  readonly contractVersion: string;
  readonly compatibilityVersion: string;
  readonly generatedAt: string;
};

export type PublishedObject = {
  readonly id: string;
  readonly objectId: string;
  readonly version: string;
  readonly publicationVersion: string;
  readonly status: PublishedObjectStatus;
  readonly manifest: PublishedObjectManifestRef;
  readonly createdAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly sourcePublicationPackageId: string | null;
    readonly sourceObjectPackageId: string | null;
    readonly checksum: string | null;
  };
};

export type PublishedObjectCatalog = {
  readonly id: string;
  readonly objects: readonly PublishedObject[];
  readonly generatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly sessionId: string;
  };
};

export type PublishedObjectPackage = {
  readonly id: string;
  readonly version: string;
  readonly catalog: PublishedObjectCatalog;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Active' | 'Disposed';
  };
  readonly validation: PublishedObjectValidation | null;
};

export type PublishedObjectValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type PublishedObjectValidation = {
  readonly valid: boolean;
  readonly issues: readonly PublishedObjectValidationIssue[];
  readonly validatedAt: string;
};

export type RegisterPublishedObjectInput = {
  readonly objectId: string;
  readonly version: string;
  readonly publicationVersion?: string;
  readonly title?: string;
  readonly notes?: string;
  readonly status?: PublishedObjectStatus;
  readonly manifest: PublishedObjectManifestRef;
  readonly sourcePublicationPackageId?: string | null;
  readonly sourceObjectPackageId?: string | null;
  readonly checksum?: string | null;
};

export type InitializePublishedObjectRegistryInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly objects?: readonly RegisterPublishedObjectInput[];
};

export type PublishedObjectIndexEntry = {
  readonly packageId: string;
  readonly catalogId: string;
  readonly publishedObjectId: string;
  readonly objectId: string;
  readonly version: string;
  readonly publicationVersion: string;
  readonly status: PublishedObjectStatus;
};

export type PublishedObjectEventType =
  | 'PublishedObjectRegistered'
  | 'PublishedObjectArchived'
  | 'PublishedObjectValidated'
  | 'PublishedObjectIndexed';

export type PublishedObjectEvent = {
  readonly eventId: string;
  readonly type: PublishedObjectEventType;
  readonly packageId: string;
  readonly catalogId: string | null;
  readonly publishedObjectId: string | null;
  readonly at: string;
  readonly message: string;
};
