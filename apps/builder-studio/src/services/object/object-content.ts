import type {
  ActiveProjectModel,
  ObjectContentSnapshot,
  ObjectPackage,
} from '../../model';
import { findAssetCollection } from '../../model';

function refsFrom(
  project: ActiveProjectModel,
  categoryId:
    | 'photographs'
    | 'video'
    | 'hero'
    | 'svg'
    | 'csv-rooms'
    | 'csv-images'
    | 'floorplan'
    | 'pdf'
    | 'docx'
    | 'xlsx',
) {
  const collection =
    findAssetCollection(project.assets, categoryId) ??
    ({ files: [] } as const);
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
 * Syncs Object Package content views from Active Project assets.
 * Does not interpret Runtime meaning.
 */
export function snapshotObjectContent(
  project: ActiveProjectModel,
): ObjectContentSnapshot {
  return {
    media: {
      hero: refsFrom(project, 'hero'),
      photographs: refsFrom(project, 'photographs'),
      video: refsFrom(project, 'video'),
    },
    layouts: {
      svg: refsFrom(project, 'svg'),
      floorplan: refsFrom(project, 'floorplan'),
      csvRooms: refsFrom(project, 'csv-rooms'),
      csvImages: refsFrom(project, 'csv-images'),
    },
    knowledge: [
      ...refsFrom(project, 'pdf'),
      ...refsFrom(project, 'docx'),
      ...refsFrom(project, 'xlsx'),
    ],
  };
}

export function withContentSnapshot(
  objectPackage: ObjectPackage,
  snapshot: ObjectContentSnapshot,
): ObjectPackage {
  return {
    ...objectPackage,
    media: snapshot.media,
    layouts: snapshot.layouts,
    knowledge: snapshot.knowledge,
  };
}
