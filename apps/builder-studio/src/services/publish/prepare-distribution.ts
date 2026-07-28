import type {
  DistributionModel,
  ProjectPackage,
  PublishManifest,
} from '../../model';

/**
 * In-memory distribution structure only — nothing written to disk.
 */
export function prepareDistribution(
  projectPackage: ProjectPackage,
  publishManifest: PublishManifest,
): DistributionModel {
  return {
    root: 'distribution/',
    manifestPath: 'distribution/manifest.json',
    publishPath: 'distribution/publish.json',
    assetsPath: 'distribution/assets/',
    layoutsPath: 'distribution/layouts/',
    knowledgePath: 'distribution/knowledge/',
    manifest: projectPackage.manifest,
    publish: publishManifest,
    assets: {
      hero: projectPackage.assets.hero,
      photographs: projectPackage.assets.photographs,
      video: projectPackage.assets.video,
    },
    layouts: {
      svg: projectPackage.layouts.svg,
      floorplan: projectPackage.layouts.floorplan,
      csvRooms: projectPackage.layouts.csvRooms,
      csvImages: projectPackage.layouts.csvImages,
    },
    knowledge: projectPackage.knowledge,
  };
}
