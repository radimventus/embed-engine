import { colors } from '@embed-engine/design-tokens';

/** Primary content band — situation cards + metro. */
export const AUDIT_PANEL_MAX_WIDTH_CLASS = 'mx-auto w-full max-w-5xl';

/** Form band — optically narrower than metro/cards. */
export const AUDIT_FORM_MAX_WIDTH_CLASS = 'mx-auto w-full max-w-2xl';

export const AUDIT_SECTION_STYLE = {
  backgroundColor: colors.brand.navy,
} as const;

/** Single gold — muted bronze. */
export const AUDIT_ACCENT = colors.action.accent;
export const AUDIT_ON_ACCENT = colors.action.onAccent;
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

export const AUDIT_INPUT_CLASS = 'h-[54px] border';

export const AUDIT_INPUT_STYLE = {
  backgroundColor: colors.surface.interactive,
  borderColor: colors.action.accent,
  color: colors.action.onSecondary,
} as const;
