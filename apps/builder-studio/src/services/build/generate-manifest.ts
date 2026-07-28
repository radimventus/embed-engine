import type { ActiveProjectModel } from '../../model';
import type { CollectedAssets, ProjectManifest } from '../../model';

export type GenerateManifestInput = {
  readonly project: ActiveProjectModel;
  readonly collected: CollectedAssets;
  readonly manifestId: string;
  readonly version: string;
  readonly buildTime: string;
};

/**
 * Generates Project Manifest — the sole structured input for future Publish.
 * No Runtime fields.
 */
export function generateManifest(
  input: GenerateManifestInput,
): ProjectManifest {
  const { project, collected, manifestId, version, buildTime } = input;

  return {
    projectId: project.projectId,
    manifestId,
    version,
    buildTime,
    assets: {
      hero: collected.hero,
      photographs: collected.photographs,
      video: collected.video,
    },
    layouts: {
      svg: collected.svg,
      floorplan: collected.floorplan,
      csvRooms: collected.csvRooms,
      csvImages: collected.csvImages,
    },
    knowledge: collected.knowledge,
    metadata: { ...project.metadata },
  };
}
