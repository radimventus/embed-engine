import type {
  Asset,
  AssetManagerEvent,
  AssetManagerEventType,
  AssetIndexEntry,
  AssetPackage,
  AssetType,
  AssetValidation,
  CreateManagedAssetInput,
  InitializeAssetManagerInput,
  ListManagedAssetsInput,
  UpdateManagedAssetInput,
} from '../../model';
import {
  createBasicAssetStrategy,
  toAssetLocation,
  type AssetStrategy,
} from './basic-asset-strategy';
import {
  createBasicAssetValidator,
  type AssetValidator,
} from './basic-asset-validator';
import { createAssetIndex, type AssetIndex } from './asset-index';

export type AssetManagerServiceOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: AssetStrategy;
  readonly validator?: AssetValidator;
  readonly index?: AssetIndex;
};

/**
 * Asset Manager service (EPIC-BX-03).
 * Registry-only — no upload, transform, thumbnail, publish, or AI.
 * Deliverable name: AssetService.
 */
export type AssetManagerService = {
  initialize(input: InitializeAssetManagerInput): AssetPackage;
  createAsset(packageId: string, input: CreateManagedAssetInput): Asset;
  updateAsset(
    packageId: string,
    assetId: string,
    patch: UpdateManagedAssetInput,
  ): Asset;
  archiveAsset(packageId: string, assetId: string): Asset;
  restoreAsset(packageId: string, assetId: string): Asset;
  findAsset(assetId: string): Asset | null;
  listAssets(input?: ListManagedAssetsInput): readonly Asset[];
  listProjectAssets(projectId: string): readonly Asset[];
  listAssetsByType(type: AssetType): readonly Asset[];
  validate(packageId: string): AssetValidation;
  dispose(packageId: string): AssetPackage;
  getPackage(packageId: string): AssetPackage | null;
  listPackages(): readonly AssetPackage[];
  getEvents(): readonly AssetManagerEvent[];
  getIndex(): readonly AssetIndexEntry[];
};

function sortAssets(
  assets: readonly Asset[],
  sortBy: ListManagedAssetsInput['sortBy'] = 'updatedAt',
): Asset[] {
  const next = [...assets];
  next.sort((left, right) => {
    if (sortBy === 'name') return left.name.localeCompare(right.name);
    if (sortBy === 'type') return left.type.localeCompare(right.type);
    if (sortBy === 'provider') {
      return left.location.provider.localeCompare(right.location.provider);
    }
    return right.updatedAt.localeCompare(left.updatedAt);
  });
  return next;
}

export function createAssetManagerService(
  options: AssetManagerServiceOptions = {},
): AssetManagerService {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicAssetStrategy();
  const validator = options.validator ?? createBasicAssetValidator();
  const index = options.index ?? createAssetIndex();

  const packages = new Map<string, AssetPackage>();
  const events: AssetManagerEvent[] = [];

  const emit = (
    type: AssetManagerEventType,
    packageId: string,
    assetId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('asset-event'),
      type,
      packageId,
      assetId,
      at: now().toISOString(),
      message,
    });
  };

  const req = (packageId: string): AssetPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Asset package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: AssetPackage): AssetPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const allAssets = (): Asset[] =>
    [...packages.values()].flatMap((pkg) => [...pkg.assets]);

  const replaceAsset = (
    pkg: AssetPackage,
    assetId: string,
    nextAsset: Asset,
    notes: string,
  ): AssetPackage =>
    store({
      ...pkg,
      updatedAt: nextAsset.updatedAt,
      assets: pkg.assets.map((asset) =>
        asset.id === assetId ? nextAsset : asset,
      ),
      validation: null,
      metadata: {
        ...pkg.metadata,
        notes,
      },
    });

  return {
    initialize(input) {
      if (!input.projectId.trim()) {
        throw new Error('Asset Manager requires projectId.');
      }
      const stamp = now().toISOString();
      const pkg: AssetPackage = {
        id: createId('asset-package'),
        version: '1.0.0',
        assets: [],
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title: input.title?.trim() || `Assets ${input.projectId}`,
          projectId: input.projectId.trim(),
          notes: 'Asset Manager package.',
          status: 'Draft',
        },
        validation: null,
      };
      return store(pkg);
    },

    createAsset(packageId, input) {
      const pkg = req(packageId);
      if (input.projectId.trim() !== pkg.metadata.projectId) {
        throw new Error(
          `Asset projectId must match package project ${pkg.metadata.projectId}.`,
        );
      }
      if (!strategy.supports(input)) {
        throw new Error('Asset strategy does not support this input.');
      }
      const asset = strategy.create(
        input,
        () => createId('asset'),
        () => now().toISOString(),
      );
      const locationIssues = validator.validateLocation(asset.location);
      if (locationIssues.length > 0) {
        throw new Error(locationIssues[0]);
      }
      const next: AssetPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        assets: [...pkg.assets, asset],
        validation: null,
        metadata: {
          ...pkg.metadata,
          status: 'Ready',
          notes: `Asset registered: ${asset.name}.`,
        },
      };
      store(next);
      emit('AssetCreated', next.id, asset.id, `Created asset ${asset.name}.`);
      return asset;
    },

    updateAsset(packageId, assetId, patch) {
      const pkg = req(packageId);
      const current = pkg.assets.find((asset) => asset.id === assetId);
      if (!current) {
        throw new Error(`Asset not found: ${assetId}`);
      }
      const metadataChanged =
        patch.label !== undefined ||
        patch.notes !== undefined ||
        patch.previewHint !== undefined;
      const location = patch.location
        ? toAssetLocation(patch.location)
        : current.location;
      if (patch.location) {
        const locationIssues = validator.validateLocation(location);
        if (locationIssues.length > 0) {
          throw new Error(locationIssues[0]);
        }
      }
      const updated: Asset = {
        ...current,
        name: patch.name?.trim() ?? current.name,
        location,
        mimeType: patch.mimeType?.trim() ?? current.mimeType,
        size: patch.size ?? current.size,
        updatedAt: now().toISOString(),
        metadata: {
          label: patch.label?.trim() ?? current.metadata.label,
          notes: patch.notes?.trim() ?? current.metadata.notes,
          previewHint:
            patch.previewHint !== undefined
              ? patch.previewHint
              : current.metadata.previewHint,
        },
      };
      replaceAsset(pkg, assetId, updated, `Asset updated: ${updated.name}.`);
      emit(
        'AssetUpdated',
        packageId,
        updated.id,
        `Updated asset ${updated.name}.`,
      );
      if (metadataChanged) {
        emit(
          'AssetMetadataChanged',
          packageId,
          updated.id,
          `Metadata changed for ${updated.name}.`,
        );
      }
      return updated;
    },

    archiveAsset(packageId, assetId) {
      const pkg = req(packageId);
      const current = pkg.assets.find((asset) => asset.id === assetId);
      if (!current) {
        throw new Error(`Asset not found: ${assetId}`);
      }
      const archived: Asset = {
        ...current,
        status: 'ARCHIVED',
        updatedAt: now().toISOString(),
      };
      replaceAsset(pkg, assetId, archived, `Asset archived: ${archived.name}.`);
      emit(
        'AssetArchived',
        packageId,
        archived.id,
        `Archived asset ${archived.name}.`,
      );
      return archived;
    },

    restoreAsset(packageId, assetId) {
      const pkg = req(packageId);
      const current = pkg.assets.find((asset) => asset.id === assetId);
      if (!current) {
        throw new Error(`Asset not found: ${assetId}`);
      }
      const restored: Asset = {
        ...current,
        status: 'ACTIVE',
        updatedAt: now().toISOString(),
      };
      replaceAsset(pkg, assetId, restored, `Asset restored: ${restored.name}.`);
      emit(
        'AssetRestored',
        packageId,
        restored.id,
        `Restored asset ${restored.name}.`,
      );
      return restored;
    },

    findAsset(assetId) {
      return allAssets().find((asset) => asset.id === assetId) ?? null;
    },

    listAssets(input = {}) {
      let assets = allAssets();
      if (input.projectId !== undefined) {
        assets = assets.filter((asset) => asset.projectId === input.projectId);
      }
      if (input.type !== undefined) {
        assets = assets.filter((asset) => asset.type === input.type);
      }
      if (input.status !== undefined) {
        assets = assets.filter((asset) => asset.status === input.status);
      }
      return sortAssets(assets, input.sortBy);
    },

    listProjectAssets(projectId) {
      return this.listAssets({ projectId, sortBy: 'updatedAt' });
    },

    listAssetsByType(type) {
      return this.listAssets({ type, sortBy: 'name' });
    },

    validate(packageId) {
      const pkg = req(packageId);
      const validation = validator.validate(pkg);
      const next: AssetPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        validation,
        metadata: {
          ...pkg.metadata,
          notes: validation.valid
            ? 'Asset package validated.'
            : 'Asset package validation failed.',
        },
      };
      store(next);
      return validation;
    },

    dispose(packageId) {
      const pkg = req(packageId);
      const next: AssetPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed asset package.',
        },
      };
      store(next);
      return next;
    },

    getPackage(packageId) {
      return packages.get(packageId) ?? null;
    },

    listPackages() {
      return [...packages.values()];
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
