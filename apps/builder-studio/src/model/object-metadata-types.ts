/**
 * Object Metadata Editor (EPIC-BX-04)
 * Canonical object description — not presentation content.
 * Works with Asset Manager references only.
 * No asset mutation, auto-SEO, AI, Runtime publish, or Runtime logic.
 *
 * Note: named ObjectMetadataDocument to avoid collision with
 * Object Package authoring metadata (`ObjectMetadata` in object-types).
 */

export type MetadataStatus =
  | 'DRAFT'
  | 'READY'
  | 'PUBLISHED'
  | 'ARCHIVED';

/** @deprecated Prefer MetadataStatus — kept for earlier BX drafts. */
export type ObjectMetadataStatus = MetadataStatus;

export type ObjectAttributeType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'url'
  | 'json';

export type ObjectAttribute = {
  readonly id: string;
  readonly key: string;
  readonly value: string;
  readonly type: ObjectAttributeType;
  readonly group: string;
  readonly order: number;
  readonly metadata: {
    readonly notes: string;
    readonly editable: boolean;
  };
};

export type ObjectAttributes = readonly ObjectAttribute[];

export type SeoMetadata = {
  readonly title: string;
  readonly description: string;
  readonly keywords: readonly string[];
  readonly canonicalUrl: string;
  readonly socialImageAssetId: string | null;
};

export type ObjectMetadataDocument = {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly slug: string;
  readonly summary: string;
  readonly description: string;
  readonly category: string;
  readonly language: string;
  readonly status: ObjectMetadataStatus;
  readonly tags: readonly string[];
  readonly seo: SeoMetadata;
  readonly attributes: ObjectAttributes;
  readonly assetReferences: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly notes: string;
    readonly authorLabel: string;
  };
};

export type MetadataValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type MetadataValidation = {
  readonly valid: boolean;
  readonly issues: readonly MetadataValidationIssue[];
  readonly validatedAt: string;
};

export type MetadataPackage = {
  readonly id: string;
  readonly version: string;
  readonly objectMetadata: ObjectMetadataDocument;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly projectId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Ready' | 'Disposed';
  };
  readonly validation: MetadataValidation | null;
};

export type CreateObjectMetadataInput = {
  readonly projectId: string;
  readonly title: string;
  readonly slug?: string;
  readonly summary?: string;
  readonly description?: string;
  readonly category?: string;
  readonly language?: string;
  readonly tags?: readonly string[];
  readonly seo?: Partial<SeoMetadata>;
  readonly attributes?: readonly (Omit<ObjectAttribute, 'id' | 'metadata'> & {
    readonly id?: string;
    readonly metadata?: ObjectAttribute['metadata'];
  })[];
  readonly assetReferences?: readonly string[];
  readonly notes?: string;
};

export type UpdateObjectMetadataDocumentInput = {
  readonly title?: string;
  readonly slug?: string;
  readonly summary?: string;
  readonly description?: string;
  readonly category?: string;
  readonly language?: string;
  readonly status?: ObjectMetadataStatus;
  readonly tags?: readonly string[];
  readonly seo?: Partial<SeoMetadata>;
  readonly attributes?: ObjectAttributes;
  readonly assetReferences?: readonly string[];
  readonly notes?: string;
};

export type InitializeMetadataInput = {
  readonly projectId: string;
  readonly title?: string;
};

export type MetadataIndexEntry = {
  readonly packageId: string;
  readonly metadataId: string;
  readonly projectId: string;
  readonly slug: string;
  readonly title: string;
  readonly status: ObjectMetadataStatus;
  readonly updatedAt: string;
};

export type MetadataEventType =
  | 'MetadataCreated'
  | 'MetadataUpdated'
  | 'MetadataValidated'
  | 'MetadataPublished'
  | 'SeoUpdated'
  | 'AssetReferenceAttached'
  | 'AssetReferenceDetached'
  | 'AttributeAdded'
  | 'AttributeRemoved';

export type MetadataEvent = {
  readonly eventId: string;
  readonly type: MetadataEventType;
  readonly packageId: string;
  readonly metadataId: string | null;
  readonly at: string;
  readonly message: string;
};
