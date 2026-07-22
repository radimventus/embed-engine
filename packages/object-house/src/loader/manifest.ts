import type { MediaAssetType } from "../MediaAsset";

/** Wire shape of house.json (HP-001 §8) plus additive document extension. */
export type HousePackageManifestJson = {
  packageFormat: string;
  schemaVersion: string;
  contentVersion: string;
  identity: {
    id: string;
    title: string;
    reference: string;
  };
  overview: {
    price: number;
    usableArea: number;
    landArea: number;
    rooms: number;
    hasGarden: boolean;
  };
  location: {
    city: string;
    district: string;
  };
  metadata: {
    energyClass: string;
    construction: string;
  };
  rooms: readonly {
    id: string;
    name: string;
    area: number;
    floor: number;
  }[];
  media: readonly {
    id: string;
    type: MediaAssetType;
    title: string;
    url: string;
  }[];
  /** Additive extension (HP-001 §11) — optional documents. */
  documents?: readonly {
    id: string;
    title: string;
    url: string;
  }[];
};

export const SUPPORTED_SCHEMA_VERSION = "0.1";
export const PACKAGE_FORMAT = "house-package";
export const MEDIA_TYPES: readonly MediaAssetType[] = [
  "image",
  "floorplan",
  "video",
];
