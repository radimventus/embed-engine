import type { ValidationRule } from '../../model';

/**
 * Extensible default rule set (EPIC-BLD-07).
 * Rules return true when the check PASSES.
 */
export const DEFAULT_VALIDATION_RULES: readonly ValidationRule[] = [
  {
    id: 'assets.hero.required',
    category: 'Assets',
    severity: 'error',
    message: 'Chybí Hero asset.',
    recommendation: 'Nahrajte Hero v sekci Média.',
    validator: (ctx) => ctx.hasHero,
  },
  {
    id: 'assets.photographs.recommended',
    category: 'Assets',
    severity: 'warning',
    message: 'Projekt má málo fotografií.',
    recommendation: 'Přidejte alespoň 3 fotografie.',
    validator: (ctx) => ctx.photographCount >= 3,
  },
  {
    id: 'assets.video.optional',
    category: 'Assets',
    severity: 'info',
    message: 'Video není nastaveno.',
    recommendation: 'Volitelně doplňte video odkaz.',
    validator: (ctx) => ctx.videoCount > 0,
  },
  {
    id: 'assets.category.error-state',
    category: 'Assets',
    severity: 'warning',
    message: 'Některé asset kategorie jsou ve stavu Error.',
    recommendation: 'Opravte nebo odstraňte problematické soubory.',
    validator: (ctx) => ctx.assetErrorCategories.length === 0,
  },
  {
    id: 'layout.at-least-one',
    category: 'Layout',
    severity: 'error',
    message: 'Chybí layout resources.',
    recommendation: 'Přidejte SVG, CSV nebo Floorplan.',
    validator: (ctx) => ctx.layoutCount > 0,
  },
  {
    id: 'layout.svg.recommended',
    category: 'Layout',
    severity: 'warning',
    message: 'Chybí SVG pro House Navigator.',
    recommendation: 'Nahrajte SVG v sekci Dispozice.',
    validator: (ctx) => ctx.hasSvg,
  },
  {
    id: 'knowledge.at-least-one',
    category: 'Knowledge',
    severity: 'warning',
    message: 'Chybí knowledge dokumenty.',
    recommendation: 'Přidejte PDF, DOCX nebo XLSX.',
    validator: (ctx) => ctx.knowledgeCount > 0,
  },
  {
    id: 'build.completed',
    category: 'Build',
    severity: 'error',
    message: 'Build ještě neproběhl nebo selhal.',
    recommendation: 'Spusťte úspěšný Build před Publish.',
    validator: (ctx) => ctx.latestBuildSuccess === true,
  },
  {
    id: 'build.publishable',
    category: 'Build',
    severity: 'error',
    message: 'ProjectPackage není publishable.',
    recommendation: 'Opravte chyby Buildu a sestavte znovu.',
    validator: (ctx) => ctx.latestBuildPublishable === true,
  },
  {
    id: 'publish.completed',
    category: 'Publish',
    severity: 'warning',
    message: 'Publish ještě neproběhl.',
    recommendation: 'Po úspěšném Quality Gate spusťte Publish.',
    validator: (ctx) => ctx.latestPublishSuccess === true,
  },
  {
    id: 'preview.ready',
    category: 'Runtime Preview',
    severity: 'info',
    message: 'Runtime Preview není otevřené.',
    recommendation: 'Ověřte Experience přes Open Preview.',
    validator: (ctx) => ctx.previewReady === true,
  },
  {
    id: 'preview.error-free',
    category: 'Runtime Preview',
    severity: 'warning',
    message: 'Runtime Preview je ve stavu Error.',
    recommendation: 'Zavřete Preview a spusťte znovu po opravě Publish.',
    validator: (ctx) => ctx.previewError === false,
  },
];
