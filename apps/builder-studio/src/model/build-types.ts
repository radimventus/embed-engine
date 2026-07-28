/**
 * Build Pipeline model (EPIC-BLD-03).
 * Structured package preparation only — no Runtime interpretation, no Publish.
 */

import type {
  AssetCategoryId,
  AssetMetadata,
  ProjectMetadata,
} from './types';

export type BuildIssueSeverity = 'error' | 'warning';

export type BuildIssue = {
  readonly code: string;
  readonly severity: BuildIssueSeverity;
  readonly message: string;
  readonly categoryId?: AssetCategoryId;
};

export type CollectedAssetRef = {
  readonly assetId: string;
  readonly categoryId: AssetCategoryId;
  readonly name: string;
  readonly sizeBytes: number;
  readonly mimeType: string;
  readonly uploadedAt: string;
  readonly metadata: AssetMetadata;
};

export type CollectedAssets = {
  readonly hero: readonly CollectedAssetRef[];
  readonly photographs: readonly CollectedAssetRef[];
  readonly video: readonly CollectedAssetRef[];
  readonly svg: readonly CollectedAssetRef[];
  readonly floorplan: readonly CollectedAssetRef[];
  readonly csvRooms: readonly CollectedAssetRef[];
  readonly csvImages: readonly CollectedAssetRef[];
  readonly knowledge: readonly CollectedAssetRef[];
};

export type ProjectManifest = {
  readonly projectId: string;
  readonly manifestId: string;
  readonly version: string;
  readonly buildTime: string;
  readonly assets: {
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
  readonly metadata: ProjectMetadata;
};

export type ProjectPackage = {
  readonly packageId: string;
  readonly projectId: string;
  readonly createdAt: string;
  readonly publishable: boolean;
  readonly manifest: ProjectManifest;
  readonly assets: {
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
};

export type BuildStatistics = {
  readonly assetCount: number;
  readonly layoutCount: number;
  readonly knowledgeCount: number;
  readonly errorCount: number;
  readonly warningCount: number;
  readonly durationMs: number;
};

export type BuildResult = {
  readonly buildId: string;
  readonly projectId: string;
  readonly success: boolean;
  readonly warnings: readonly BuildIssue[];
  readonly errors: readonly BuildIssue[];
  readonly manifest: ProjectManifest;
  readonly package: ProjectPackage;
  readonly statistics: BuildStatistics;
  readonly builtAt: string;
};

export type BuildValidationResult = {
  readonly errors: readonly BuildIssue[];
  readonly warnings: readonly BuildIssue[];
};
