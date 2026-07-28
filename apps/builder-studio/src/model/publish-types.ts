/**
 * Publish Pipeline model (EPIC-BLD-04).
 * Distribution layer only — consumes ProjectPackage, never Project.
 * No Build logic, no Runtime interpretation, no disk deployment.
 */

import type {
  CollectedAssetRef,
  ProjectManifest,
} from './build-types';
import type { BuildIssue } from './build-types';
import type { ProjectMetadata } from './types';

export type DeploymentTargetKind =
  | 'GitHub Pages'
  | 'S3'
  | 'Local'
  | 'Cloud Storage';

/**
 * Future deployment adapter contract.
 * No implementations in EPIC-BLD-04.
 */
export type DeploymentTarget = {
  readonly kind: DeploymentTargetKind;
  readonly id: string;
  readonly label: string;
};

export type PublishManifest = {
  readonly packageId: string;
  readonly version: string;
  readonly buildVersion: string;
  readonly manifestVersion: string;
  readonly publishTime: string;
  readonly checksum: string;
  readonly runtimeVersion: string;
};

export type DistributionModel = {
  readonly root: 'distribution/';
  readonly manifestPath: 'distribution/manifest.json';
  readonly publishPath: 'distribution/publish.json';
  readonly assetsPath: 'distribution/assets/';
  readonly layoutsPath: 'distribution/layouts/';
  readonly knowledgePath: 'distribution/knowledge/';
  readonly manifest: ProjectManifest;
  readonly publish: PublishManifest;
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

export type PublishedPackage = {
  readonly packageId: string;
  readonly version: string;
  readonly manifest: ProjectManifest;
  readonly publishManifest: PublishManifest;
  readonly runtimeEntry: string;
  readonly assets: {
    readonly hero: readonly CollectedAssetRef[];
    readonly photographs: readonly CollectedAssetRef[];
    readonly video: readonly CollectedAssetRef[];
  };
  readonly metadata: ProjectMetadata;
  readonly publishedAt: string;
  readonly distribution: DistributionModel;
};

export type PublishValidationResult = {
  readonly errors: readonly BuildIssue[];
  readonly warnings: readonly BuildIssue[];
};

export type PublishResult = {
  readonly publishId: string;
  readonly packageId: string;
  readonly success: boolean;
  readonly warnings: readonly BuildIssue[];
  readonly errors: readonly BuildIssue[];
  readonly publishedPackage: PublishedPackage | null;
  readonly publishManifest: PublishManifest | null;
  readonly distribution: DistributionModel | null;
  readonly buildVersion: string | null;
  readonly publishedAt: string;
};
