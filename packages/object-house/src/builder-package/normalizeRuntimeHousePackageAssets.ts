import type { HousePackage } from '../HousePackage';
import {
  BUILDER_MEDIA_HERO_ID,
  floorplanMediaId,
  parseGalleryMediaId,
  parseVideoMediaId,
} from './projectToHousePackage';
import type { FloorPlanGeometry } from './floorPlanGeometry';

export type NormalizedHousePackageAssets = {
  readonly houseId: string;
  readonly hero: { readonly src: string; readonly title: string } | null;
  readonly gallery: readonly {
    readonly order: number;
    readonly roomId: string;
    readonly src: string;
  }[];
  readonly videos: readonly {
    readonly order: number;
    readonly roomId: string;
    readonly src: string;
  }[];
  readonly floors: readonly {
    readonly floorId: string;
    readonly rasterSrc: string;
    readonly geometry: FloorPlanGeometry | null;
  }[];
};

/**
 * Pure presentation projection for every House Package source. URLs have
 * already been normalized by the loader; this function never infers whether
 * an asset originated from static or durable storage.
 */
export function normalizeRuntimeHousePackageAssets(
  housePackage: HousePackage,
  geometryByFloorId: Readonly<Record<string, FloorPlanGeometry>> = {},
): NormalizedHousePackageAssets {
  const heroAsset = housePackage.media.find(
    (asset) => asset.id === BUILDER_MEDIA_HERO_ID,
  );
  const gallery = housePackage.media.flatMap((asset) => {
    const entry = parseGalleryMediaId(asset.id);
    return entry === null
      ? []
      : [{ order: entry.order, roomId: entry.roomId, src: asset.url }];
  });
  const videos = housePackage.media.flatMap((asset) => {
    const entry = parseVideoMediaId(asset.id);
    return entry === null
      ? []
      : [{ order: entry.order, roomId: entry.roomId, src: asset.url }];
  });
  const floors = Object.entries(geometryByFloorId)
    .map(([floorId, geometry]) => {
      const raster = housePackage.media.find(
        (asset) => asset.id === floorplanMediaId(floorId),
      );
      return raster === undefined
        ? null
        : { floorId, rasterSrc: raster.url, geometry };
    })
    .filter(
      (floor): floor is {
        readonly floorId: string;
        readonly rasterSrc: string;
        readonly geometry: FloorPlanGeometry;
      } => floor !== null,
    )
    .sort((a, b) => a.floorId.localeCompare(b.floorId));

  return Object.freeze({
    houseId: housePackage.identity.id,
    hero:
      heroAsset === undefined
        ? null
        : Object.freeze({ src: heroAsset.url, title: heroAsset.title }),
    gallery: Object.freeze(
      gallery
        .sort((a, b) => a.order - b.order)
        .map((item) => Object.freeze(item)),
    ),
    videos: Object.freeze(
      videos
        .sort((a, b) => a.order - b.order)
        .map((item) => Object.freeze(item)),
    ),
    floors: Object.freeze(floors.map((item) => Object.freeze(item))),
  });
}
