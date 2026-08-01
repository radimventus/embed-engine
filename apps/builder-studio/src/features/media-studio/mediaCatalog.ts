/**
 * EPIC-BX-05 — Media Studio catalog (presentation over HP-002 media).
 * No parallel media model — areas map to gallery/videos/hero/plans + Runtime documents.
 */

export type MediaAreaId =
  | 'hero'
  | 'gallery'
  | 'videos'
  | 'svg'
  | 'floor-plans'
  | 'documents';

export type MediaRuntimeUsage =
  | 'Hero'
  | 'Gallery'
  | 'House Navigator'
  | 'FAQ'
  | 'AI'
  | 'Lead'
  | 'Experience'
  | 'Runtime';

export type MediaAreaDefinition = {
  readonly id: MediaAreaId;
  readonly label: string;
  readonly description: string;
  readonly usages: readonly MediaRuntimeUsage[];
};

export const MEDIA_AREA_CATALOG: readonly MediaAreaDefinition[] = [
  {
    id: 'hero',
    label: 'Hero',
    description: 'Hlavní vizuál Experience.',
    usages: ['Hero', 'Experience', 'Runtime'],
  },
  {
    id: 'gallery',
    label: 'Galerie',
    description: 'Fotografie objektu a místností.',
    usages: ['Gallery', 'House Navigator', 'Experience', 'Runtime'],
  },
  {
    id: 'videos',
    label: 'Videa',
    description: 'Video vrstva prohlídky.',
    usages: ['House Navigator', 'Experience', 'Runtime'],
  },
  {
    id: 'svg',
    label: 'SVG',
    description: 'SVG půdorysy a decision canvas.',
    usages: ['House Navigator', 'Runtime', 'AI'],
  },
  {
    id: 'floor-plans',
    label: 'Půdorys',
    description: 'Podlaží a vazby na místnosti.',
    usages: ['House Navigator', 'Runtime', 'Experience'],
  },
  {
    id: 'documents',
    label: 'Dokumenty',
    description: 'PDF a technické dokumenty Runtime.',
    usages: ['Lead', 'Runtime', 'FAQ'],
  },
] as const;

export function getMediaArea(id: MediaAreaId): MediaAreaDefinition {
  return MEDIA_AREA_CATALOG.find((item) => item.id === id) ?? MEDIA_AREA_CATALOG[0];
}
