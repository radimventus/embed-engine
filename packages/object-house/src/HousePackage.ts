import type { MediaAsset } from "./MediaAsset";
import type { Room } from "./Room";

export interface HouseIdentity {
  readonly id: string;
  readonly title: string;
  readonly reference: string;
}

export interface HouseOverview {
  readonly price: number;
  readonly usableArea: number;
  readonly landArea: number;
  /** Room count summary for overview. */
  readonly rooms: number;
  /** Whether the property includes a garden / outdoor plot use. */
  readonly hasGarden: boolean;
}

export interface HouseLocation {
  readonly city: string;
  readonly district: string;
}

export interface HouseMetadata {
  readonly energyClass: string;
  readonly construction: string;
}

/**
 * Object Package — source of truth about a house.
 * Experience interprets this package; renderers never read it directly.
 */
export interface HousePackage {
  readonly identity: HouseIdentity;
  readonly overview: HouseOverview;
  readonly media: readonly MediaAsset[];
  readonly rooms: readonly Room[];
  readonly location: HouseLocation;
  readonly metadata: HouseMetadata;
}
