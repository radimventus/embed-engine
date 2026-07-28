import type { ProjectManifest, ProjectPackage } from '../../model';

export type PackageProjectInput = {
  readonly packageId: string;
  readonly manifest: ProjectManifest;
  readonly publishable: boolean;
  readonly createdAt: string;
};

/**
 * Package Model factory (EPIC-BLD-03).
 * In-memory data structure only — no ZIP, no disk export.
 */
export function packageProject(input: PackageProjectInput): ProjectPackage {
  const { packageId, manifest, publishable, createdAt } = input;

  return {
    packageId,
    projectId: manifest.projectId,
    createdAt,
    publishable,
    manifest,
    assets: {
      hero: manifest.assets.hero,
      photographs: manifest.assets.photographs,
      video: manifest.assets.video,
    },
    layouts: {
      svg: manifest.layouts.svg,
      floorplan: manifest.layouts.floorplan,
      csvRooms: manifest.layouts.csvRooms,
      csvImages: manifest.layouts.csvImages,
    },
    knowledge: manifest.knowledge,
  };
}
