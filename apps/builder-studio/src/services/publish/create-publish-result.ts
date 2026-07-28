import type {
  DistributionModel,
  ProjectPackage,
  PublishedPackage,
  PublishManifest,
  PublishResult,
} from '../../model';
import type { BuildIssue } from '../../model';

export type CreatePublishResultInput = {
  readonly publishId: string;
  readonly packageId: string;
  readonly success: boolean;
  readonly errors: readonly BuildIssue[];
  readonly warnings: readonly BuildIssue[];
  readonly publishedPackage: PublishedPackage | null;
  readonly publishManifest: PublishManifest | null;
  readonly distribution: DistributionModel | null;
  readonly buildVersion: string | null;
  readonly publishedAt: string;
};

export function createPublishResult(
  input: CreatePublishResultInput,
): PublishResult {
  return {
    publishId: input.publishId,
    packageId: input.packageId,
    success: input.success,
    errors: input.errors,
    warnings: input.warnings,
    publishedPackage: input.publishedPackage,
    publishManifest: input.publishManifest,
    distribution: input.distribution,
    buildVersion: input.buildVersion,
    publishedAt: input.publishedAt,
  };
}

export function createPublishedPackage(input: {
  readonly projectPackage: ProjectPackage;
  readonly publishManifest: PublishManifest;
  readonly distribution: DistributionModel;
  readonly runtimeEntry: string;
}): PublishedPackage {
  const { projectPackage, publishManifest, distribution, runtimeEntry } =
    input;

  return {
    packageId: projectPackage.packageId,
    version: publishManifest.version,
    manifest: projectPackage.manifest,
    publishManifest,
    runtimeEntry,
    assets: {
      hero: projectPackage.assets.hero,
      photographs: projectPackage.assets.photographs,
      video: projectPackage.assets.video,
    },
    metadata: projectPackage.manifest.metadata,
    publishedAt: publishManifest.publishTime,
    distribution,
  };
}
