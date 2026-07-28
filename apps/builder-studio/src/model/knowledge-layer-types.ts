/**
 * Knowledge Layers (EPIC-BLD-14).
 * Architecture of knowledge origin and scope boundaries.
 * No AI, no sync, no cross-project learning, no federation.
 */

export type KnowledgeLayerId =
  | 'platform'
  | 'company'
  | 'object'
  | 'session';

export type KnowledgeLayerDefinition = {
  readonly id: KnowledgeLayerId;
  readonly scope: string;
  readonly owner: string;
  readonly description: string;
};

export type KnowledgeLayerTimestamps = {
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type KnowledgeLayerMetadata = {
  readonly title: string;
  readonly description: string;
  readonly status: 'Draft' | 'Active' | 'Archived';
};

/**
 * Platform Knowledge — never contains customer data.
 */
export type PlatformKnowledge = {
  readonly id: string;
  readonly layer: 'platform';
  readonly metadata: KnowledgeLayerMetadata;
  readonly timestamps: KnowledgeLayerTimestamps;
};

/**
 * Company Knowledge — isolated per company.
 */
export type CompanyKnowledge = {
  readonly id: string;
  readonly layer: 'company';
  readonly companyId: string;
  readonly metadata: KnowledgeLayerMetadata;
  readonly timestamps: KnowledgeLayerTimestamps;
};

/**
 * Object Knowledge — belongs to one Object Package.
 */
export type ObjectKnowledge = {
  readonly id: string;
  readonly layer: 'object';
  readonly objectId: string;
  readonly metadata: KnowledgeLayerMetadata;
  readonly timestamps: KnowledgeLayerTimestamps;
};

/**
 * Session Knowledge — temporary, session-scoped.
 */
export type SessionKnowledge = {
  readonly id: string;
  readonly layer: 'session';
  readonly sessionId: string;
  readonly objectId: string;
  readonly metadata: KnowledgeLayerMetadata;
  readonly timestamps: KnowledgeLayerTimestamps;
};

export type KnowledgeLayerModel =
  | PlatformKnowledge
  | CompanyKnowledge
  | ObjectKnowledge
  | SessionKnowledge;

export type KnowledgeReferenceType =
  | 'catalog'
  | 'policy'
  | 'fact'
  | 'entity'
  | 'faq'
  | 'document'
  | 'other';

/**
 * Reference from Knowledge Package to a layer target.
 * No data copying between layers.
 */
export type KnowledgeReference = {
  readonly id: string;
  readonly layer: KnowledgeLayerId;
  readonly targetId: string;
  readonly type: KnowledgeReferenceType;
};

export type AddKnowledgeReferenceInput = {
  readonly layer: KnowledgeLayerId;
  readonly targetId: string;
  readonly type?: KnowledgeReferenceType;
};

export type KnowledgeLayerEventType =
  | 'LayerRegistered'
  | 'LayerReferenceAdded'
  | 'LayerReferenceRemoved';

export type KnowledgeLayerEvent = {
  readonly eventId: string;
  readonly type: KnowledgeLayerEventType;
  readonly layerId: KnowledgeLayerId;
  readonly targetId: string;
  readonly at: string;
  readonly message: string;
};

export type ResolvedLayerReferences = {
  readonly layer: KnowledgeLayerId;
  readonly layerModel: KnowledgeLayerModel | null;
  readonly references: readonly KnowledgeReference[];
};

export type KnowledgeLayerBundle = {
  readonly platform: PlatformKnowledge;
  readonly company: CompanyKnowledge;
  readonly object: ObjectKnowledge;
  readonly session: SessionKnowledge;
};
