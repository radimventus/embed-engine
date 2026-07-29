import type {
  Asset,
  AssetLocation,
  CreateManagedAssetInput,
} from '../../model';

export type AssetStrategy = {
  readonly id: string;
  supports(input: CreateManagedAssetInput): boolean;
  create(
    input: CreateManagedAssetInput,
    createId: () => string,
    now: () => string,
  ): Asset;
  validate(asset: Asset): boolean;
};

const DEFAULT_MIME: Record<Asset['type'], string> = {
  IMAGE: 'image/jpeg',
  VIDEO: 'video/mp4',
  DOCUMENT: 'application/pdf',
  FLOORPLAN: 'image/svg+xml',
  MODEL_3D: 'model/gltf-binary',
  URL: 'text/uri-list',
  OTHER: 'application/octet-stream',
};

export function toAssetLocation(
  input: CreateManagedAssetInput['location'],
): AssetLocation {
  return {
    provider: input.provider,
    uri: input.uri.trim(),
    bucket: input.bucket?.trim() || null,
    key: input.key?.trim() || null,
    metadata: {
      region: input.region?.trim() || null,
      publicId: input.publicId?.trim() || null,
      notes: input.notes?.trim() || 'Asset location reference.',
    },
  };
}

export function createBasicAssetStrategy(): AssetStrategy {
  return {
    id: 'basic-asset-strategy',

    supports(input) {
      return (
        input.projectId.trim().length > 0 &&
        input.name.trim().length > 0 &&
        input.location.uri.trim().length > 0
      );
    },

    create(input, createId, now) {
      const stamp = now();
      const name = input.name.trim();
      return {
        id: createId(),
        projectId: input.projectId.trim(),
        name,
        type: input.type,
        location: toAssetLocation(input.location),
        mimeType: input.mimeType?.trim() || DEFAULT_MIME[input.type],
        size: Math.max(0, input.size ?? 0),
        status: 'ACTIVE',
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          label: input.label?.trim() || name,
          notes: input.notes?.trim() || 'Registered asset.',
          previewHint: input.previewHint ?? null,
        },
      };
    },

    validate(asset) {
      return (
        asset.projectId.trim().length > 0 &&
        asset.name.trim().length > 0 &&
        asset.location.uri.trim().length > 0 &&
        asset.size >= 0
      );
    },
  };
}
