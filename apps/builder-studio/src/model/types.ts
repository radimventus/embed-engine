/**
 * Builder Studio domain model (EPIC-BLD-01 / EPIC-BLD-02 / EPIC-BLD-06).
 * Pure TypeScript — no React, no browser, no HTTP.
 * No Runtime interpretation data.
 */

import type { LifecycleStatus } from './lifecycle-types';

/** @deprecated Use LifecycleStatus — alias kept for gradual migration. */
export type ProjectStatus = LifecycleStatus;

export type SyncStatus = 'Synchronizing' | 'Synced' | 'Error';

export type ValidationStatus = 'Ready' | 'Validation Error' | 'Pending';

export type BuildStatus = 'Idle' | 'Ready' | 'Failed';

export type PublishReadyStatus = 'Ready' | 'Blocked' | 'Idle';

export type WorkspaceSectionId =
  | 'projects'
  | 'assets'
  | 'overview'
  | 'experience'
  | 'knowledge-package'
  | 'decision'
  | 'ai-context'
  | 'knowledge-layers'
  | 'learning'
  | 'decision-engine'
  | 'decision-runtime'
  | 'rule-evaluation'
  | 'decision-story'
  | 'runtime-session'
  | 'behavior'
  | 'analytics'
  | 'learning-pipeline'
  | 'learning-package-mgr'
  | 'pattern-extraction'
  | 'pattern-intelligence'
  | 'heuristic-engine'
  | 'knowledge-synthesis'
  | 'ai-decision-gateway'
  | 'personalization-engine'
  | 'personalization-runtime'
  | 'decision-orchestrator'
  | 'experience-runtime'
  | 'experience-modules'
  | 'experience-state'
  | 'observability'
  | 'runtime-health'
  | 'runtime-audit'
  | 'runtime-governance'
  | 'runtime-policies'
  | 'runtime-enforcement'
  | 'runtime-resilience'
  | 'runtime-recovery'
  | 'runtime-recovery-execution'
  | 'runtime-recovery-coordinator'
  | 'runtime-recovery-reporting'
  | 'runtime-operations'
  | 'runtime-integration'
  | 'runtime-registry'
  | 'runtime-manifest'
  | 'runtime-api'
  | 'runtime-compatibility'
  | 'runtime-contracts'
  | 'runtime-extensions'
  | 'object-publication'
  | 'published-objects'
  | 'platform-publication'
  | 'client-publication'
  | 'publication-readiness'
  | 'runtime-bootstrap'
  | 'artifact-versions'
  | 'artifact-dependencies'
  | 'publication-plan'
  | 'publication-execution'
  | 'artifact-export'
  | 'export-schemas'
  | 'export-compatibility'
  | 'export-capabilities'
  | 'export-policies'
  | 'export-certification'
  | 'media'
  | 'layout'
  | 'knowledge';

/** Presentation + collection readiness for asset cards. */
export type AssetUiState = 'Empty' | 'Loading' | 'Ready' | 'Error';

export type MediaAssetCategory = 'photographs' | 'video' | 'hero';

export type LayoutAssetCategory =
  | 'svg'
  | 'csv-rooms'
  | 'csv-images'
  | 'floorplan';

export type KnowledgeAssetCategory = 'pdf' | 'docx' | 'xlsx';

export type AssetCategoryId =
  | MediaAssetCategory
  | LayoutAssetCategory
  | KnowledgeAssetCategory;

export type AssetSectionId = 'media' | 'layout' | 'knowledge';

export type PartnerCard = {
  readonly id: string;
  readonly name: string;
};

export type ProjectRecord = {
  readonly projectId: string;
  readonly name: string;
  readonly customer: string;
  readonly status: LifecycleStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly manifestPath: string;
  readonly lastSyncedAt: string;
  readonly syncStatus: SyncStatus;
};

export type ProjectMetadata = {
  readonly title: string;
  readonly partnerName: string;
  readonly locationLabel: string;
  readonly notes: string;
};

export type AssetMetadata = {
  readonly label: string;
  readonly description: string;
  readonly altText: string;
};

export type AssetFile = {
  readonly assetId: string;
  readonly name: string;
  readonly sizeBytes: number;
  readonly uploadedAt: string;
  readonly mimeType: string;
  readonly metadata: AssetMetadata;
};

export type AssetCollection = {
  readonly categoryId: AssetCategoryId;
  readonly sectionId: AssetSectionId;
  readonly title: string;
  readonly description: string;
  readonly acceptHint: string;
  readonly state: AssetUiState;
  readonly files: readonly AssetFile[];
};

/**
 * Active Project content model (EPIC-BLD-02).
 * Knowledge authoring only — no Runtime data.
 */
export type ActiveProjectModel = {
  readonly projectId: string;
  readonly record: ProjectRecord;
  readonly metadata: ProjectMetadata;
  readonly assets: {
    readonly media: readonly AssetCollection[];
    readonly layout: readonly AssetCollection[];
    readonly knowledge: readonly AssetCollection[];
  };
};

export type ProjectPipelineSnapshot = {
  readonly projectId: string;
  readonly validationStatus: ValidationStatus;
  readonly buildStatus: BuildStatus;
  readonly publishStatus: PublishReadyStatus;
  readonly mediaReadyPercent: number;
  readonly layoutReadyPercent: number;
  readonly knowledgeReadyPercent: number;
  readonly localPreviewUrl: string;
  readonly embedSnippet: string;
};

/**
 * Application-layer Workspace (IMP-01).
 * Structural placeholders remain for Runtime / Publish until later epics.
 */
export type WorkspaceStructure = {
  readonly workspaceId: string;
  readonly partner: PartnerCard;
  readonly projects: readonly ProjectRecord[];
  readonly activeProjectId: string | null;
  readonly assets: { readonly placeholder: true };
  readonly runtime: { readonly placeholder: true };
  readonly publish: { readonly placeholder: true };
};

export type CreateProjectInput = {
  readonly name: string;
  readonly customer?: string;
};

export type AddAssetInput = {
  readonly name: string;
  readonly sizeBytes?: number;
  readonly mimeType?: string;
  readonly metadata?: Partial<AssetMetadata>;
};

export type UpdateAssetMetadataInput = {
  readonly label?: string;
  readonly description?: string;
  readonly altText?: string;
};
