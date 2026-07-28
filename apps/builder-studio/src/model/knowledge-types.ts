/**
 * Knowledge Package (EPIC-BLD-11).
 * Authoring model of structured object knowledge.
 * No AI, no embeddings, no Decision Engine, no inference.
 */

export type KnowledgeTimestamps = {
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type KnowledgeMetadata = {
  readonly title: string;
  readonly description: string;
  readonly status: 'Draft' | 'Active' | 'Archived';
};

export type FactCategory =
  | 'construction'
  | 'energy'
  | 'dimensions'
  | 'heating'
  | 'equipment'
  | 'other';

export type Fact = {
  readonly id: string;
  readonly title: string;
  readonly value: string;
  readonly category: FactCategory;
  readonly source: string;
  readonly tags: readonly string[];
};

export type EntityType =
  | 'system'
  | 'feature'
  | 'material'
  | 'space'
  | 'other';

export type Entity = {
  readonly id: string;
  readonly type: EntityType;
  readonly label: string;
  readonly aliases: readonly string[];
  readonly metadata: {
    readonly notes: string;
  };
};

export type Relationship = {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly relation: string;
  readonly confidence: number;
};

export type FaqEntry = {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly tags: readonly string[];
  readonly relatedEntities: readonly string[];
};

export type KnowledgeDocumentType = 'pdf' | 'docx' | 'xlsx' | 'other';

export type KnowledgeDocument = {
  readonly id: string;
  readonly type: KnowledgeDocumentType;
  readonly title: string;
  readonly assetRef: string;
  readonly metadata: {
    readonly notes: string;
  };
};

/**
 * Structured authoring knowledge for an object.
 * Belonging to Object Package — Runtime only reads.
 */
export type KnowledgePackage = {
  readonly knowledgeId: string;
  readonly objectId: string;
  readonly version: string;
  readonly facts: readonly Fact[];
  readonly entities: readonly Entity[];
  readonly relationships: readonly Relationship[];
  readonly documents: readonly KnowledgeDocument[];
  readonly faqs: readonly FaqEntry[];
  readonly metadata: KnowledgeMetadata;
  readonly timestamps: KnowledgeTimestamps;
};

export type CreateKnowledgeInput = {
  readonly objectId: string;
  readonly title?: string;
  readonly description?: string;
};

export type UpdateKnowledgeInput = {
  readonly title?: string;
  readonly description?: string;
  readonly status?: KnowledgeMetadata['status'];
};

export type AddFactInput = {
  readonly title: string;
  readonly value: string;
  readonly category?: FactCategory;
  readonly source?: string;
  readonly tags?: readonly string[];
};

export type AddEntityInput = {
  readonly type?: EntityType;
  readonly label: string;
  readonly aliases?: readonly string[];
  readonly notes?: string;
};

export type AddRelationshipInput = {
  readonly from: string;
  readonly to: string;
  readonly relation: string;
  readonly confidence?: number;
};

export type AddFaqInput = {
  readonly question: string;
  readonly answer: string;
  readonly tags?: readonly string[];
  readonly relatedEntities?: readonly string[];
};

export type RegisterDocumentInput = {
  readonly type?: KnowledgeDocumentType;
  readonly title: string;
  readonly assetRef: string;
  readonly notes?: string;
};

export type KnowledgeEventType =
  | 'KnowledgeCreated'
  | 'FactAdded'
  | 'EntityAdded'
  | 'RelationshipAdded'
  | 'FaqAdded'
  | 'DocumentRegistered';

export type KnowledgeEvent = {
  readonly eventId: string;
  readonly type: KnowledgeEventType;
  readonly knowledgeId: string;
  readonly objectId: string;
  readonly at: string;
  readonly message: string;
};
