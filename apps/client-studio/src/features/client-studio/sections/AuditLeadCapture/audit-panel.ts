import { colors } from '@embed-engine/design-tokens';

/** Primary content band — situation cards + metro. */
export const AUDIT_PANEL_MAX_WIDTH_CLASS = 'mx-auto w-full max-w-5xl';

/** Form band — optically narrower than metro/cards. */
export const AUDIT_FORM_MAX_WIDTH_CLASS = 'mx-auto w-full max-w-2xl';

export const AUDIT_SECTION_STYLE = {
  backgroundColor: colors.brand.navy,
} as const;

/** Audit actions sit on navy, so they use the CONIS gold brand accent. */
export const AUDIT_ACCENT = colors.brand.gold;
export const AUDIT_ON_ACCENT = colors.brand.navy;
export const AUDIT_WHITE = colors.action.onPrimary;
export const AUDIT_MUTED = colors.border.default;

export const LAND_OPTIONS = [
  { value: 'owned', label: 'MÁM POZEMEK', description: 'Chci ověřit konkrétní pozemek.' },
  { value: 'seeking', label: 'HLEDÁM POZEMEK', description: 'Ještě hledám vhodnou lokalitu.' },
] as const;

export type LandOption = (typeof LAND_OPTIONS)[number]['value'];

/** Shared metro stations — icon motif is fixed; copy follows land mode. */
export type StationMotif = 'house' | 'pin' | 'document' | 'check';

export type WorkflowStation = {
  motif: StationMotif;
  title: string;
  lines: readonly string[];
};

export const WORKFLOW_BY_LAND: Record<LandOption, readonly WorkflowStation[]> = {
  owned: [
    {
      motif: 'house',
      title: 'Mám pozemek',
      lines: ['Získáme informace', 'o vašem pozemku.'],
    },
    {
      motif: 'pin',
      title: 'Osazení domu',
      lines: ['Navrhneme optimální', 'umístění domu', 'na pozemku.'],
    },
    {
      motif: 'document',
      title: 'Stanoviska',
      lines: ['Prověříme podmínky', 'a regulace.'],
    },
    {
      motif: 'check',
      title: 'Doporučení',
      lines: ['Navrhneme dům,', 'který sedí', 'na váš pozemek.'],
    },
  ],
  seeking: [
    {
      motif: 'house',
      title: 'Hledám pozemek',
      lines: ['Najdeme vhodnou', 'parcelu', 'pro váš záměr.'],
    },
    {
      motif: 'pin',
      title: 'Lokalita',
      lines: ['Prověříme lokalitu', 'a její možnosti.'],
    },
    {
      motif: 'document',
      title: 'Stanoviska',
      lines: ['Ověříme podmínky', 'a omezení.'],
    },
    {
      motif: 'check',
      title: 'Doporučení',
      lines: ['Navrhneme vhodnější dům', 'nebo doporučíme', 'další postup.'],
    },
  ],
};

export const AUDIT_INPUT_HEIGHT_PX = 54;

/** CAP UX 45/53 — rounded corners; inline radius required against CSS isolation. */
export const AUDIT_CONTROL_RADIUS_PX = 10;

/** CAP UX 52/53 — gold glow around navy panels with gold border (20px blur). */
export const AUDIT_GOLD_GLOW = `0 0 20px ${colors.action.accent}99`;

/**
 * Selected land-panel fill / submit CTA — same gold as Mám/Hledám (CAP UX 53/55).
 * Alias kept for call sites that name the selected surface.
 */
export const AUDIT_LIGHT_GOLD = AUDIT_ACCENT;

export const AUDIT_INPUT_CLASS = 'h-[54px] border';

export const AUDIT_INPUT_STYLE = {
  backgroundColor: colors.surface.interactive,
  borderColor: colors.action.accent,
  color: colors.action.onSecondary,
  borderRadius: AUDIT_CONTROL_RADIUS_PX,
} as const;

/** Public legal-information page shipped with the Embed release snapshot. */
export const AUDIT_PRIVACY_HREF =
  'https://conis.cz/embed/zpracovani-osobnich-udaju.html';
