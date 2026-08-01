/**
 * EPIC-BX-05 — Media view-model from HP-002 + Runtime document defaults.
 */

import { parseCsv } from '@embed-engine/object-house/builder-package';
import { BUILDER_RUNTIME_HOUSE_DEFAULTS } from '../../../../client-studio/src/features/client-studio/runtime/builderRuntimeHouseDefaults';

import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import { serializeCsv } from '../house-package/housePackageCsv';
import { HOUSE_PACKAGE_URL_ROOT } from '../house-package/housePackagePaths';
import {
  getMediaArea,
  MEDIA_AREA_CATALOG,
  type MediaAreaId,
  type MediaRuntimeUsage,
} from './mediaCatalog';
import {
  getMediaPresentationMeta,
  type MediaPresentationMeta,
} from './mediaPresentationStorage';

export type MediaAreaCard = {
  readonly id: MediaAreaId;
  readonly label: string;
  readonly description: string;
  readonly count: number;
  readonly summary: string;
  readonly usages: readonly MediaRuntimeUsage[];
};

export type GalleryMediaItem = {
  readonly key: string;
  readonly order: string;
  readonly room: string;
  readonly file: string;
  readonly path: string;
  readonly url: string;
  readonly meta: MediaPresentationMeta;
};

export type VideoMediaItem = {
  readonly key: string;
  readonly order: string;
  readonly room: string;
  readonly provider: string;
  readonly mediaId: string;
  readonly meta: MediaPresentationMeta;
};

export type FloorPlanMediaItem = {
  readonly floorId: string;
  readonly svgPath: string;
  readonly rasterPath: string;
  readonly svgUrl: string;
  readonly roomCount: number;
  readonly geometryLabel: string;
};

export type DocumentMediaItem = {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly kind: string;
};

export type MediaStudioModel = {
  readonly areas: readonly MediaAreaCard[];
  readonly heroPath: string;
  readonly heroUrl: string | null;
  readonly heroMeta: MediaPresentationMeta;
  readonly gallery: readonly GalleryMediaItem[];
  readonly videos: readonly VideoMediaItem[];
  readonly floors: readonly FloorPlanMediaItem[];
  readonly documents: readonly DocumentMediaItem[];
  readonly remountKey: string;
};

export function buildMediaStudioModel(input: {
  readonly projectId: string;
  readonly snapshot: HousePackageEditSnapshot | null;
}): MediaStudioModel {
  const { projectId, snapshot } = input;
  const pkg = snapshot?.validation.builderImport ?? null;
  const heroPath = snapshot?.working.heroRelativePath ?? '';
  const galleryRows = snapshot
    ? parseCsv(snapshot.working.galleryCsv).rows
    : [];
  const videoRows = snapshot
    ? parseCsv(snapshot.working.videosCsv).rows
    : [];

  const gallery: GalleryMediaItem[] = galleryRows.map((row, index) => {
    const file = row.file ?? '';
    const path = file.includes('/')
      ? file
      : `media/gallery/${file}`;
    const key = `gallery:${row.order ?? index}:${file}`;
    return {
      key,
      order: row.order ?? String(index + 1),
      room: row.room ?? '',
      file,
      path,
      url: `${HOUSE_PACKAGE_URL_ROOT}/${path}`,
      meta: getMediaPresentationMeta(projectId, key, file),
    };
  });

  const videos: VideoMediaItem[] = videoRows.map((row, index) => {
    const key = `video:${row.order ?? index}:${row.mediaId ?? ''}`;
    return {
      key,
      order: row.order ?? String(index + 1),
      room: row.room ?? '',
      provider: row.provider ?? '',
      mediaId: row.mediaId ?? '',
      meta: getMediaPresentationMeta(
        projectId,
        key,
        row.mediaId ?? `Video ${index + 1}`,
      ),
    };
  });

  const floors: FloorPlanMediaItem[] =
    pkg?.floors.floors.map((floor) => {
      const svgPath =
        pkg.svg.entries.find((item) => item.floorId === floor.floorId)?.path ??
        floor.planSvg;
      const geometry = snapshot?.geometryByFloor[floor.floorId];
      const geometryLabel =
        geometry === undefined || geometry === 'missing'
          ? 'Geometrie chybí'
          : geometry === 'invalid'
            ? 'Geometrie neplatná'
            : `Geometrie OK · ${geometry.rooms.length} místností`;
      const roomCount =
        pkg.rooms.rooms.filter((room) => room.floorId === floor.floorId)
          .length;
      return {
        floorId: floor.floorId,
        svgPath,
        rasterPath: floor.planPng,
        svgUrl: `${HOUSE_PACKAGE_URL_ROOT}/${svgPath}`,
        roomCount,
        geometryLabel,
      };
    }) ?? [];

  const documents: DocumentMediaItem[] = (
    BUILDER_RUNTIME_HOUSE_DEFAULTS.documents ?? []
  ).map((doc) => ({
    id: doc.id,
    title: doc.title,
    url: doc.url,
    kind: doc.url.toLowerCase().endsWith('.pdf')
      ? 'PDF'
      : doc.url.toLowerCase().endsWith('.docx')
        ? 'DOCX'
        : doc.url.toLowerCase().endsWith('.xlsx')
          ? 'XLSX'
          : 'Dokument',
  }));

  const areas: MediaAreaCard[] = MEDIA_AREA_CATALOG.map((area) => {
    const count =
      area.id === 'hero'
        ? heroPath.length > 0
          ? 1
          : 0
        : area.id === 'gallery'
          ? gallery.length
          : area.id === 'videos'
            ? videos.length
            : area.id === 'svg' || area.id === 'floor-plans'
              ? floors.length
              : documents.length;
    const summary =
      area.id === 'hero'
        ? heroPath.length > 0
          ? 'Aktivní Hero'
          : 'Hero chybí'
        : `${count} položek`;
    return {
      id: area.id,
      label: area.label,
      description: area.description,
      count,
      summary,
      usages: area.usages,
    };
  });

  return {
    areas,
    heroPath,
    heroUrl:
      heroPath.length > 0
        ? `${HOUSE_PACKAGE_URL_ROOT}/${heroPath}`
        : null,
    heroMeta: getMediaPresentationMeta(projectId, 'hero', 'Hero'),
    gallery,
    videos,
    floors,
    documents,
    remountKey: [
      projectId,
      snapshot?.mountedAt ?? 'none',
      heroPath,
      gallery.map((item) => `${item.order}:${item.file}`).join('|'),
      videos.map((item) => `${item.order}:${item.mediaId}`).join('|'),
      snapshot?.dirtyState ?? 'clean',
    ].join(':'),
  };
}

export function reorderGalleryCsv(
  galleryCsv: string,
  fromIndex: number,
  toIndex: number,
): string {
  const table = parseCsv(galleryCsv);
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= table.rows.length ||
    toIndex >= table.rows.length
  ) {
    return galleryCsv;
  }
  const rows: Array<Record<string, string>> = table.rows.map((row) => ({
    ...row,
  }));
  const [moved] = rows.splice(fromIndex, 1);
  if (moved === undefined) {
    return galleryCsv;
  }
  rows.splice(toIndex, 0, moved);
  const renumbered: Array<Record<string, string>> = rows.map((row, index) => {
    const next: Record<string, string> = { ...row };
    next.order = String(index + 1);
    return next;
  });
  const headers =
    table.headers.length > 0 ? table.headers : ['order', 'room', 'file'];
  return serializeCsv(headers, renumbered);
}

export { getMediaArea };
