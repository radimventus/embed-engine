/**
 * Object Publication Pipeline (EPIC-BLD-55).
 * Local publishable artifact — no Runtime mutation, Experience, or remote deploy.
 *
 * Naming note: epic "ObjectPackage" is exported as PublicationObjectPackage
 * to avoid collision with BLD-08 authoring ObjectPackage.
 */

export type PublicationObjectAsset = {
  readonly id: string;
  readonly kind: string;
  readonly label: string;
  readonly ref: string;
};

export type PublicationManifest = {
  readonly id: string;
  readonly objectVersion: string;
  readonly runtimeVersion: string;
  readonly contractVersion: string;
  readonly compatibilityVersion: string;
  readonly generatedAt: string;
};

/**
 * Publishable Object Package (epic ObjectPackage).
 */
export type PublicationObjectPackage = {
  readonly id: string;
  readonly objectId: string;
  readonly version: string;
  readonly manifest: PublicationManifest;
  readonly assets: readonly PublicationObjectAsset[];
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly sourceObjectId: string;
    readonly sourceProjectId: string;
  };
  readonly checksum: string;
};

export type PublicationPackage = {
  readonly id: string;
  readonly version: string;
  readonly objectPackage: PublicationObjectPackage;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Built' | 'Validated' | 'Published' | 'Failed' | 'Disposed';
  };
  readonly validation: PublicationValidation | null;
};

export type PublicationValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type PublicationValidation = {
  readonly valid: boolean;
  readonly issues: readonly PublicationValidationIssue[];
  readonly validatedAt: string;
};

export type BuildObjectPublicationInput = {
  readonly objectId: string;
  readonly objectVersion?: string;
  readonly title?: string;
  readonly runtimeVersion?: string;
  readonly contractVersion?: string;
  readonly compatibilityVersion?: string;
  readonly sourceProjectId?: string;
  readonly assets?: readonly PublicationObjectAsset[];
};

export type InitializePublicationInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly build?: BuildObjectPublicationInput;
};

export type PublicationIndexEntry = {
  readonly packageId: string;
  readonly objectPackageId: string;
  readonly objectId: string;
  readonly version: string;
  readonly status: PublicationPackage['metadata']['status'];
  readonly checksum: string;
};

export type ObjectPublicationEventType =
  | 'ObjectPublicationCreated'
  | 'ObjectPublicationValidated'
  | 'ObjectPublicationPublished'
  | 'ObjectPublicationFailed';

export type ObjectPublicationEvent = {
  readonly eventId: string;
  readonly type: ObjectPublicationEventType;
  readonly packageId: string;
  readonly objectPackageId: string | null;
  readonly objectId: string | null;
  readonly at: string;
  readonly message: string;
};
