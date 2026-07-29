/**
 * Asset Manager (EPIC-BX-03)
 * Single Source of Truth for project asset registry metadata.
 * No upload, transform, thumbnail, optimization, publish, or AI.
 */

export type AssetType =
  | 'IMAGE'
  | 'VIDEO'
  | 'DOCUMENT'
  | 'FLOORPLAN'
  | 'MODEL_3D'
  | 'URL'
  | 'OTHER';

export type AssetStatus = 'ACTIVE' | 'ARCHIVED';

export type AssetLocationProvider =
  | 'LOCAL'
  | 'CLOUDINARY'
  | 'S3'
  | 'URL'
  | 'OTHER';

export type AssetLocation = {
  readonly provider: AssetLocationProvider;
  readonly uri: string;
  readonly bucket: string | null;
  readonly key: string | null;
  readonly metadata: {
    readonly region: string | null;
    readonly publicId: string | null;
    readonly notes: string;
  };
};

export type Asset = {
  readonly id: string;
  readonly projectId: string;
  readonly name: string;
  readonly type: AssetType;
  readonly location: AssetLocation;
  readonly mimeType: string;
  readonly size: number;
  readonly status: AssetStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly label: string;
    readonly notes: string;
    readonly previewHint: string | null;
  };
};

export type AssetValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type AssetValidation = {
  readonly valid: boolean;
  readonly issues: readonly AssetValidationIssue[];
  readonly validatedAt: string;
};

export type AssetPackage = {
  readonly id: string;
  readonly version: string;
  readonly assets: readonly Asset[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly projectId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Ready' | 'Disposed';
  };
  readonly validation: AssetValidation | null;
};

export type CreateManagedAssetInput = {
  readonly projectId: string;
  readonly name: string;
  readonly type: AssetType;
  readonly location: {
    readonly provider: AssetLocationProvider;
    readonly uri: string;
    readonly bucket?: string | null;
    readonly key?: string | null;
    readonly region?: string | null;
    readonly publicId?: string | null;
    readonly notes?: string;
  };
  readonly mimeType?: string;
  readonly size?: number;
  readonly label?: string;
  readonly notes?: string;
  readonly previewHint?: string | null;
};

export type UpdateManagedAssetInput = {
  readonly name?: string;
  readonly location?: CreateManagedAssetInput['location'];
  readonly mimeType?: string;
  readonly size?: number;
  readonly label?: string;
  readonly notes?: string;
  readonly previewHint?: string | null;
};

export type InitializeAssetManagerInput = {
  readonly projectId: string;
  readonly title?: string;
};

export type ListManagedAssetsInput = {
  readonly projectId?: string;
  readonly type?: AssetType;
  readonly status?: AssetStatus;
  readonly sortBy?: 'name' | 'updatedAt' | 'type' | 'provider';
};

export type AssetIndexEntry = {
  readonly packageId: string;
  readonly assetId: string;
  readonly projectId: string;
  readonly name: string;
  readonly type: AssetType;
  readonly provider: AssetLocationProvider;
  readonly status: AssetStatus;
  readonly updatedAt: string;
};

export type AssetManagerEventType =
  | 'AssetCreated'
  | 'AssetUpdated'
  | 'AssetArchived'
  | 'AssetRestored'
  | 'AssetMetadataChanged';

export type AssetManagerEvent = {
  readonly eventId: string;
  readonly type: AssetManagerEventType;
  readonly packageId: string;
  readonly assetId: string | null;
  readonly at: string;
  readonly message: string;
};
