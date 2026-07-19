export type MediaAssetType = "image" | "floorplan" | "video";

/** Media reference only — no binary payloads. */
export interface MediaAsset {
  readonly id: string;
  readonly type: MediaAssetType;
  readonly title: string;
  readonly url: string;
}
