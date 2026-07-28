import type {
  ActiveProjectModel,
  AssetCategoryId,
  AssetCollection,
  CollectedAssetRef,
  CollectedAssets,
} from '../../model';

function filesFromCategory(
  collections: readonly AssetCollection[],
  categoryId: AssetCategoryId,
): readonly CollectedAssetRef[] {
  const collection = collections.find((item) => item.categoryId === categoryId);
  if (collection === undefined) {
    return [];
  }

  return collection.files.map((file) => ({
    assetId: file.assetId,
    categoryId,
    name: file.name,
    sizeBytes: file.sizeBytes,
    mimeType: file.mimeType,
    uploadedAt: file.uploadedAt,
    metadata: { ...file.metadata },
  }));
}

/**
 * Asset Collector (EPIC-BLD-03).
 * Collects asset metadata only — no file copying, no interpretation.
 */
export function collectAssets(project: ActiveProjectModel): CollectedAssets {
  const { media, layout, knowledge } = project.assets;

  return {
    hero: filesFromCategory(media, 'hero'),
    photographs: filesFromCategory(media, 'photographs'),
    video: filesFromCategory(media, 'video'),
    svg: filesFromCategory(layout, 'svg'),
    floorplan: filesFromCategory(layout, 'floorplan'),
    csvRooms: filesFromCategory(layout, 'csv-rooms'),
    csvImages: filesFromCategory(layout, 'csv-images'),
    knowledge: [
      ...filesFromCategory(knowledge, 'pdf'),
      ...filesFromCategory(knowledge, 'docx'),
      ...filesFromCategory(knowledge, 'xlsx'),
    ],
  };
}
