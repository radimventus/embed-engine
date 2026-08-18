export type HousePackageMediaKind = 'video' | 'photo';

export type HousePackageMediaItem = {
  kind: HousePackageMediaKind;
  src: string;
  thumbnailSrc: string;
  /** Canonical room mapping for a photo; Tour videos have no active room. */
  roomId: string | null;
};
