/**
 * EPIC-BX-09 — Quality Coach: deterministic media/content checks.
 */

import { parseCsv } from '@embed-engine/object-house/builder-package';

import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import { getMediaPresentationMeta } from '../media-studio/mediaPresentationStorage';
import { BUILDER_RUNTIME_HOUSE_DEFAULTS } from '../../../../client-studio/src/features/client-studio/runtime/builderRuntimeHouseDefaults';
import type { CoachFinding, CoachReport } from './intelligenceTypes';

export function buildQualityCoach(input: {
  readonly projectId: string;
  readonly snapshot: HousePackageEditSnapshot | null;
}): CoachReport {
  const findings: CoachFinding[] = [];
  const { projectId, snapshot } = input;
  const pkg = snapshot?.validation.builderImport ?? null;
  const heroPath = snapshot?.working.heroRelativePath.trim() ?? '';
  const galleryRows = snapshot
    ? parseCsv(snapshot.working.galleryCsv).rows
    : [];
  const videoRows = snapshot
    ? parseCsv(snapshot.working.videosCsv).rows
    : [];
  const rooms = pkg?.rooms.rooms ?? [];
  const floors = pkg?.floors.floors ?? [];
  const svgCount = pkg?.svg.entries.length ?? floors.length;
  const documents = BUILDER_RUNTIME_HOUSE_DEFAULTS.documents ?? [];

  if (heroPath.length === 0) {
    findings.push({
      id: 'quality-hero-missing',
      title: 'Chybí Hero',
      detail: 'Experience potřebuje hlavní vizuál.',
      severity: 'high',
      nav: 'media-studio',
    });
  } else {
    const heroMeta = getMediaPresentationMeta(projectId, 'hero', 'Hero');
    if (heroMeta.alt.trim().length === 0) {
      findings.push({
        id: 'quality-hero-alt',
        title: 'Hero nemá ALT',
        detail: 'Doplňte ALT text pro přístupnost a SEO.',
        severity: 'medium',
        nav: 'media-studio',
      });
    }
  }

  if (galleryRows.length === 0) {
    findings.push({
      id: 'quality-gallery-empty',
      title: 'Galerie je prázdná',
      detail: 'Bez fotografií je House Navigator slabý.',
      severity: 'high',
      nav: 'media-studio',
    });
  } else if (galleryRows.length < 4) {
    findings.push({
      id: 'quality-gallery-few',
      title: `Galerie obsahuje jen ${galleryRows.length} fotografie`,
      detail: 'Doporučeno alespoň 4 snímky pro prohlídku.',
      severity: 'medium',
      nav: 'media-studio',
    });
  }

  const hasExterior = galleryRows.some((row) =>
    (row.room ?? '').toLowerCase().includes('exterior'),
  );
  if (galleryRows.length > 0 && !hasExterior) {
    findings.push({
      id: 'quality-gallery-exterior',
      title: 'Chybí exteriér',
      detail: 'Přidejte alespoň jednu fotografii exteriéru.',
      severity: 'medium',
      nav: 'media-studio',
    });
  }

  if (videoRows.length === 0) {
    findings.push({
      id: 'quality-videos-missing',
      title: 'Chybí videa',
      detail: 'Video vrstva prohlídky není naplněna.',
      severity: 'low',
      nav: 'media-studio',
    });
  } else {
    const unassigned = videoRows.filter(
      (row) => (row.room ?? '').trim().length === 0 || (row.mediaId ?? '').trim().length === 0,
    );
    if (unassigned.length > 0) {
      findings.push({
        id: 'quality-video-unassigned',
        title: 'Video není přiřazeno',
        detail: `${unassigned.length} video položek bez room nebo mediaId.`,
        severity: 'medium',
        nav: 'media-studio',
      });
    }
  }

  if (rooms.length === 0) {
    findings.push({
      id: 'quality-rooms-missing',
      title: 'Chybí místnosti',
      detail: 'Dispozice (rooms) je prázdná.',
      severity: 'high',
      nav: 'rooms',
    });
  }

  if (svgCount === 0) {
    findings.push({
      id: 'quality-svg-missing',
      title: 'Chybí SVG / půdorysy',
      detail: 'Floor plans nejsou připravené pro House Navigator.',
      severity: 'high',
      nav: 'plans',
    });
  }

  if (documents.length === 0) {
    findings.push({
      id: 'quality-docs-missing',
      title: 'Chybí dokumenty',
      detail: 'Runtime documents projection je prázdná.',
      severity: 'low',
      nav: 'media-studio',
    });
  }

  const penalty = findings.reduce(
    (sum, item) =>
      sum + (item.severity === 'high' ? 18 : item.severity === 'medium' ? 10 : 5),
    0,
  );

  return {
    id: 'quality',
    label: 'Quality Coach',
    description: 'Kontrola médií a obsahu objektu.',
    findings,
    score: clampScore(100 - penalty),
  };
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}
