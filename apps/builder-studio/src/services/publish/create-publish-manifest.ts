import type { ProjectPackage, PublishManifest } from '../../model';

export type CreatePublishManifestInput = {
  readonly projectPackage: ProjectPackage;
  readonly version: string;
  readonly publishTime: string;
  readonly checksum: string;
  readonly runtimeVersion: string;
};

/**
 * Creates publish.json model — deterministic distribution metadata.
 * Does not mutate ProjectPackage content.
 */
export function createPublishManifest(
  input: CreatePublishManifestInput,
): PublishManifest {
  const { projectPackage, version, publishTime, checksum, runtimeVersion } =
    input;

  return {
    packageId: projectPackage.packageId,
    version,
    buildVersion: projectPackage.manifest.version,
    manifestVersion: projectPackage.manifest.version,
    publishTime,
    checksum,
    runtimeVersion,
  };
}
