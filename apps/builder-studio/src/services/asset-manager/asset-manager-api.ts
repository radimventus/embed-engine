import type {
  Asset,
  AssetIndexEntry,
  AssetManagerEvent,
  AssetPackage,
  AssetType,
  AssetValidation,
  CreateManagedAssetInput,
  InitializeAssetManagerInput,
  ListManagedAssetsInput,
  UpdateManagedAssetInput,
} from '../../model';
import {
  createAssetManagerService,
  type AssetManagerService,
} from './asset-manager-service';

export type AssetManagerApi = {
  createAsset(
    packageId: string | null,
    input: CreateManagedAssetInput,
    init?: InitializeAssetManagerInput,
  ): Asset;
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
  validateAssets(packageId: string): AssetValidation;
  disposeAssets(packageId: string): AssetPackage;
  getPackage(packageId: string): AssetPackage | null;
  listPackages(): readonly AssetPackage[];
  listEvents(): readonly AssetManagerEvent[];
  listIndex(): readonly AssetIndexEntry[];
};

export function createAssetManagerApi(
  service?: AssetManagerService,
): AssetManagerApi {
  const manager = service ?? createAssetManagerService();

  return {
    createAsset(packageId, input, init) {
      if (packageId === null) {
        const pkg = manager.initialize({
          projectId: init?.projectId ?? input.projectId,
          title: init?.title ?? 'Project Assets',
        });
        return manager.createAsset(pkg.id, input);
      }
      return manager.createAsset(packageId, input);
    },

    updateAsset(packageId, assetId, patch) {
      return manager.updateAsset(packageId, assetId, patch);
    },

    archiveAsset(packageId, assetId) {
      return manager.archiveAsset(packageId, assetId);
    },

    restoreAsset(packageId, assetId) {
      return manager.restoreAsset(packageId, assetId);
    },

    findAsset(assetId) {
      return manager.findAsset(assetId);
    },

    listAssets(input) {
      return manager.listAssets(input);
    },

    listProjectAssets(projectId) {
      return manager.listProjectAssets(projectId);
    },

    listAssetsByType(type) {
      return manager.listAssetsByType(type);
    },

    validateAssets(packageId) {
      return manager.validate(packageId);
    },

    disposeAssets(packageId) {
      return manager.dispose(packageId);
    },

    getPackage(packageId) {
      return manager.getPackage(packageId);
    },

    listPackages() {
      return manager.listPackages();
    },

    listEvents() {
      return manager.getEvents();
    },

    listIndex() {
      return manager.getIndex();
    },
  };
}
