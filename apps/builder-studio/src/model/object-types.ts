/**
 * Object Package (EPIC-BLD-08).
 * Authoring model of an object — not a Build/Publish artifact.
 * Project = lifecycle container; Object Package = project content.
 */

import type { CollectedAssetRef } from './build-types';
import type { DecisionKnowledgePackage } from './decision-types';
import type { Experience } from './experience-types';
import type { KnowledgePackage } from './knowledge-types';

export type ObjectModuleId =
  | 'hero'
  | 'market-pulse'
  | 'house-navigator'
  | 'priority'
  | 'faq'
  | 'ai-advisor'
  | 'lead-capture';

export type ObjectType = 'house' | 'apartment' | 'land' | 'commercial';

export type ObjectLifecycleStatus = 'Draft' | 'Active' | 'Archived';

export type ObjectModuleDefinition = {
  readonly id: ObjectModuleId;
  readonly label: string;
  readonly description: string;
};

export type ObjectMetadata = {
  readonly name: string;
  readonly objectType: ObjectType;
  readonly location: string;
  readonly status: ObjectLifecycleStatus;
  readonly description: string;
  readonly tags: readonly string[];
};

export type ObjectTimestamps = {
  readonly createdAt: string;
  readonly updatedAt: string;
};

/**
 * Complete authoring model of an object.
 * Runtime never mutates this package.
 * Experience + Knowledge + Decision Knowledge are authoring layers.
 */
export type ObjectPackage = {
  readonly objectId: string;
  readonly projectId: string;
  readonly metadata: ObjectMetadata;
  readonly media: {
    readonly hero: readonly CollectedAssetRef[];
    readonly photographs: readonly CollectedAssetRef[];
    readonly video: readonly CollectedAssetRef[];
  };
  readonly layouts: {
    readonly svg: readonly CollectedAssetRef[];
    readonly floorplan: readonly CollectedAssetRef[];
    readonly csvRooms: readonly CollectedAssetRef[];
    readonly csvImages: readonly CollectedAssetRef[];
  };
  readonly knowledge: readonly CollectedAssetRef[];
  readonly modules: readonly ObjectModuleId[];
  readonly experience: Experience | null;
  readonly knowledgePackage: KnowledgePackage | null;
  readonly decisionKnowledge: DecisionKnowledgePackage | null;
  readonly tags: readonly string[];
  readonly version: string;
  readonly timestamps: ObjectTimestamps;
};

export type CreateObjectInput = {
  readonly projectId: string;
  readonly name: string;
  readonly objectType?: ObjectType;
  readonly location?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly modules?: readonly ObjectModuleId[];
};

export type UpdateObjectMetadataInput = {
  readonly name?: string;
  readonly objectType?: ObjectType;
  readonly location?: string;
  readonly status?: ObjectLifecycleStatus;
  readonly description?: string;
  readonly tags?: readonly string[];
};

export type ObjectEventType =
  | 'ObjectCreated'
  | 'ObjectUpdated'
  | 'ModuleAssigned'
  | 'MetadataChanged';

export type ObjectEvent = {
  readonly eventId: string;
  readonly type: ObjectEventType;
  readonly objectId: string;
  readonly projectId: string;
  readonly at: string;
  readonly message: string;
};

export type ObjectContentSnapshot = {
  readonly media: ObjectPackage['media'];
  readonly layouts: ObjectPackage['layouts'];
  readonly knowledge: ObjectPackage['knowledge'];
};
