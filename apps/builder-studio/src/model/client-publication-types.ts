/**
 * Client Studio Publication Adapter (EPIC-BLD-58).
 * Builder publication artifacts adapted into Client Studio input.
 */

export type ClientPublicationAsset = {
  readonly id: string;
  readonly kind: string;
  readonly ref: string;
  readonly label: string;
};

export type ClientPublicationModel = {
  readonly id: string;
  readonly publicationId: string;
  readonly objectId: string;
  readonly version: string;
  readonly assets: readonly ClientPublicationAsset[];
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly sourceCatalogPackageId: string | null;
    readonly sourcePlatformEntryId: string | null;
    readonly status: 'Loaded' | 'Transformed' | 'Published';
  };
};

export type ClientPublicationPackage = {
  readonly id: string;
  readonly version: string;
  readonly publicationModel: ClientPublicationModel;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Active' | 'Published' | 'Disposed';
  };
  readonly validation: ClientPublicationValidation | null;
};

export type ClientPublicationValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type ClientPublicationValidation = {
  readonly valid: boolean;
  readonly issues: readonly ClientPublicationValidationIssue[];
  readonly validatedAt: string;
};

export type LoadClientPublicationInput = {
  readonly publicationId: string;
  readonly objectId: string;
  readonly version: string;
  readonly title?: string;
  readonly notes?: string;
  readonly sourceCatalogPackageId?: string | null;
  readonly sourcePlatformEntryId?: string | null;
  readonly assets?: readonly ClientPublicationAsset[];
};

export type InitializeClientPublicationInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly publication?: LoadClientPublicationInput;
};

export type ClientPublicationIndexEntry = {
  readonly packageId: string;
  readonly publicationModelId: string;
  readonly publicationId: string;
  readonly objectId: string;
  readonly version: string;
  readonly status: ClientPublicationModel['metadata']['status'];
};

export type ClientPublicationEventType =
  | 'ClientPublicationLoaded'
  | 'ClientPublicationTransformed'
  | 'ClientPublicationPublished'
  | 'ClientPublicationValidated';

export type ClientPublicationEvent = {
  readonly eventId: string;
  readonly type: ClientPublicationEventType;
  readonly packageId: string;
  readonly publicationModelId: string | null;
  readonly publicationId: string | null;
  readonly at: string;
  readonly message: string;
};
