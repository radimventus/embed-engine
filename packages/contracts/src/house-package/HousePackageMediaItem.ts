export type HousePackageMediaKind = 'video' | 'photo';

export type HousePackageMediaItem = {
  kind: HousePackageMediaKind;
  src: string;
  thumbnailSrc: string;
};
