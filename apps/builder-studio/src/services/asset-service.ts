import type {
  ActiveProjectModel,
  AddAssetInput,
  AssetCategoryId,
  AssetCollection,
  AssetFile,
  AssetMetadata,
  AssetUiState,
  ProjectRecord,
  UpdateAssetMetadataInput,
} from '../model';
import { createEmptyAssetCollections } from '../model';
import { createMockActiveProjects } from './mock-data';

export type AssetService = {
  getActiveProject(projectId: string): ActiveProjectModel | null;
  ensureProject(record: ProjectRecord): ActiveProjectModel;
  addAsset(
    projectId: string,
    categoryId: AssetCategoryId,
    input: AddAssetInput,
  ): AssetFile;
  removeAsset(
    projectId: string,
    categoryId: AssetCategoryId,
    assetId: string,
  ): void;
  updateMetadata(
    projectId: string,
    categoryId: AssetCategoryId,
    assetId: string,
    patch: UpdateAssetMetadataInput,
  ): AssetFile;
};

type MutableAssets = {
  readonly media: AssetCollection[];
  readonly layout: AssetCollection[];
  readonly knowledge: AssetCollection[];
};

function cloneCollections(model: ActiveProjectModel): MutableAssets {
  return {
    media: model.assets.media.map((item) => ({
      ...item,
      files: item.files.map((file) => ({
        ...file,
        metadata: { ...file.metadata },
      })),
    })),
    layout: model.assets.layout.map((item) => ({
      ...item,
      files: item.files.map((file) => ({
        ...file,
        metadata: { ...file.metadata },
      })),
    })),
    knowledge: model.assets.knowledge.map((item) => ({
      ...item,
      files: item.files.map((file) => ({
        ...file,
        metadata: { ...file.metadata },
      })),
    })),
  };
}

function deriveState(fileCount: number, previous: AssetUiState): AssetUiState {
  if (previous === 'Error' && fileCount > 0) {
    return 'Ready';
  }
  if (previous === 'Loading') {
    return fileCount === 0 ? 'Empty' : 'Ready';
  }
  return fileCount === 0 ? 'Empty' : 'Ready';
}

function updateCategory(
  model: ActiveProjectModel,
  categoryId: AssetCategoryId,
  updater: (collection: AssetCollection) => AssetCollection,
): ActiveProjectModel {
  const assets = cloneCollections(model);
  const buckets = [assets.media, assets.layout, assets.knowledge] as const;
  let found = false;

  for (const bucket of buckets) {
    const index = bucket.findIndex((item) => item.categoryId === categoryId);
    if (index >= 0) {
      bucket[index] = updater(bucket[index]!);
      found = true;
      break;
    }
  }

  if (!found) {
    throw new Error(`Unknown asset category: ${categoryId}`);
  }

  return {
    ...model,
    assets,
  };
}

function defaultMetadata(name: string): AssetMetadata {
  return {
    label: name.replace(/\.[^.]+$/, ''),
    description: '',
    altText: '',
  };
}

/**
 * In-memory asset management (EPIC-BLD-02).
 * Mock only — no persistence, no Build Pipeline.
 */
export function createAssetService(
  seed: Map<string, ActiveProjectModel> = createMockActiveProjects(),
): AssetService {
  const projects = new Map<string, ActiveProjectModel>(
    Array.from(seed.entries(), ([projectId, model]) => [
      projectId,
      {
        ...model,
        metadata: { ...model.metadata },
        assets: cloneCollections(model),
      } satisfies ActiveProjectModel,
    ]),
  );

  const requireProject = (projectId: string): ActiveProjectModel => {
    const model = projects.get(projectId);
    if (model === undefined) {
      throw new Error(`Active project content not found: ${projectId}`);
    }
    return model;
  };

  return {
    getActiveProject(projectId: string): ActiveProjectModel | null {
      return projects.get(projectId) ?? null;
    },

    ensureProject(record: ProjectRecord): ActiveProjectModel {
      const existing = projects.get(record.projectId);
      if (existing !== undefined) {
        const next: ActiveProjectModel = {
          ...existing,
          record,
          metadata: {
            ...existing.metadata,
            title: record.name,
            partnerName: record.customer,
          },
        };
        projects.set(record.projectId, next);
        return next;
      }

      const empty = createEmptyAssetCollections();
      const created: ActiveProjectModel = {
        projectId: record.projectId,
        record,
        metadata: {
          title: record.name,
          partnerName: record.customer,
          locationLabel: 'Neuvedeno',
          notes: '',
        },
        assets: empty,
      };
      projects.set(record.projectId, created);
      return created;
    },

    addAsset(
      projectId: string,
      categoryId: AssetCategoryId,
      input: AddAssetInput,
    ): AssetFile {
      const name = input.name.trim();
      if (name.length === 0) {
        throw new Error('Asset name is required');
      }

      const current = requireProject(projectId);
      const created: AssetFile = {
        assetId: `${projectId}-${categoryId}-${Date.now()}`,
        name,
        sizeBytes: input.sizeBytes ?? 128_000,
        uploadedAt: new Date().toISOString(),
        mimeType: input.mimeType ?? 'application/octet-stream',
        metadata: {
          ...defaultMetadata(name),
          ...input.metadata,
        },
      };

      const next = updateCategory(current, categoryId, (collection) => {
        const files = [...collection.files, created];
        return {
          ...collection,
          files,
          state: deriveState(files.length, collection.state),
        };
      });
      projects.set(projectId, next);
      return created;
    },

    removeAsset(
      projectId: string,
      categoryId: AssetCategoryId,
      assetId: string,
    ): void {
      const current = requireProject(projectId);
      const next = updateCategory(current, categoryId, (collection) => {
        const files = collection.files.filter((file) => file.assetId !== assetId);
        if (files.length === collection.files.length) {
          throw new Error(`Asset not found: ${assetId}`);
        }
        return {
          ...collection,
          files,
          state: deriveState(files.length, collection.state),
        };
      });
      projects.set(projectId, next);
    },

    updateMetadata(
      projectId: string,
      categoryId: AssetCategoryId,
      assetId: string,
      patch: UpdateAssetMetadataInput,
    ): AssetFile {
      const current = requireProject(projectId);
      let updated: AssetFile | null = null;

      const next = updateCategory(current, categoryId, (collection) => {
        const files = collection.files.map((file) => {
          if (file.assetId !== assetId) {
            return file;
          }
          updated = {
            ...file,
            metadata: {
              label: patch.label ?? file.metadata.label,
              description: patch.description ?? file.metadata.description,
              altText: patch.altText ?? file.metadata.altText,
            },
          };
          return updated;
        });

        if (updated === null) {
          throw new Error(`Asset not found: ${assetId}`);
        }

        return {
          ...collection,
          files,
          state: deriveState(files.length, collection.state),
        };
      });

      projects.set(projectId, next);
      return updated!;
    },
  };
}
