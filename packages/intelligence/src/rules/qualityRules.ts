import type { Insight, IntelligenceProjectContext, Rule } from '../domain/types';
import { insight, rule } from './ruleHelpers';

export const QUALITY_RULES: readonly Rule[] = [
  rule('quality-hero-missing', 'quality', 'Chybí Hero', (ctx) =>
    ctx.housePackage.heroPath.length === 0
      ? insight(
          { id: 'quality-hero-missing', category: 'quality', title: 'Chybí Hero' },
          'Experience potřebuje hlavní vizuál.',
          'high',
          'media-studio',
        )
      : null,
  ),
  rule('quality-hero-alt', 'quality', 'Hero nemá ALT', (ctx) => {
    if (ctx.housePackage.heroPath.length === 0) return null;
    return ctx.media.heroAlt.trim().length === 0
      ? insight(
          { id: 'quality-hero-alt', category: 'quality', title: 'Hero nemá ALT' },
          'Doplňte ALT text pro přístupnost a SEO.',
          'medium',
          'media-studio',
        )
      : null;
  }),
  rule('quality-gallery-empty', 'quality', 'Galerie je prázdná', (ctx) =>
    ctx.housePackage.galleryRows.length === 0
      ? insight(
          {
            id: 'quality-gallery-empty',
            category: 'quality',
            title: 'Galerie je prázdná',
          },
          'Bez fotografií je House Navigator slabý.',
          'high',
          'media-studio',
        )
      : null,
  ),
  rule('quality-gallery-few', 'quality', 'Galerie má málo fotografií', (ctx) => {
    const count = ctx.housePackage.galleryRows.length;
    if (count === 0 || count >= 4) return null;
    return insight(
      {
        id: 'quality-gallery-few',
        category: 'quality',
        title: `Galerie obsahuje jen ${count} fotografie`,
      },
      'Doporučeno alespoň 4 snímky pro prohlídku.',
      'medium',
      'media-studio',
    );
  }),
  rule('quality-gallery-exterior', 'quality', 'Chybí exteriér', (ctx) => {
    const rows = ctx.housePackage.galleryRows;
    if (rows.length === 0) return null;
    const hasExterior = rows.some((row) =>
      row.room.toLowerCase().includes('exterior'),
    );
    return !hasExterior
      ? insight(
          {
            id: 'quality-gallery-exterior',
            category: 'quality',
            title: 'Chybí exteriér',
          },
          'Přidejte alespoň jednu fotografii exteriéru.',
          'medium',
          'media-studio',
        )
      : null;
  }),
  rule('quality-videos-missing', 'quality', 'Chybí videa', (ctx) =>
    ctx.housePackage.videoRows.length === 0
      ? insight(
          {
            id: 'quality-videos-missing',
            category: 'quality',
            title: 'Chybí videa',
          },
          'Video vrstva prohlídky není naplněna.',
          'low',
          'media-studio',
        )
      : null,
  ),
  rule('quality-video-unassigned', 'quality', 'Video není přiřazeno', (ctx) => {
    if (ctx.housePackage.videoRows.length === 0) return null;
    const unassigned = ctx.housePackage.videoRows.filter(
      (row) => row.room.trim().length === 0 || row.mediaId.trim().length === 0,
    );
    return unassigned.length > 0
      ? insight(
          {
            id: 'quality-video-unassigned',
            category: 'quality',
            title: 'Video není přiřazeno',
          },
          `${unassigned.length} video položek bez room nebo mediaId.`,
          'medium',
          'media-studio',
        )
      : null;
  }),
  rule('quality-rooms-missing', 'quality', 'Chybí místnosti', (ctx) =>
    ctx.housePackage.roomCount === 0
      ? insight(
          {
            id: 'quality-rooms-missing',
            category: 'quality',
            title: 'Chybí místnosti',
          },
          'Dispozice (rooms) je prázdná.',
          'high',
          'rooms',
        )
      : null,
  ),
  rule('quality-svg-missing', 'quality', 'Chybí SVG / půdorysy', (ctx) =>
    ctx.housePackage.floorPlanCount === 0
      ? insight(
          {
            id: 'quality-svg-missing',
            category: 'quality',
            title: 'Chybí SVG / půdorysy',
          },
          'Floor plans nejsou připravené pro House Navigator.',
          'high',
          'plans',
        )
      : null,
  ),
  rule('quality-docs-missing', 'quality', 'Chybí dokumenty', (ctx) =>
    ctx.media.documentTitles.length === 0
      ? insight(
          {
            id: 'quality-docs-missing',
            category: 'quality',
            title: 'Chybí dokumenty',
          },
          'Runtime documents projection je prázdná.',
          'low',
          'media-studio',
        )
      : null,
  ),
];

export function evaluateQualityRules(
  context: IntelligenceProjectContext,
): Insight[] {
  return QUALITY_RULES.map((item) => item.evaluate(context)).filter(
    (item): item is Insight => item !== null,
  );
}
