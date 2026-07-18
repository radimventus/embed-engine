import { colors } from '@embed-engine/design-tokens';

/** Matches VIDEO/FOTKY compact SegmentedControl width. */
export const AUDIT_CONTROL_WIDTH_CLASS = 'w-full max-w-[161px]';

export const AUDIT_PANEL_MAX_WIDTH_CLASS = 'mx-auto w-full max-w-xl';

export const AUDIT_PANEL_SURFACE_CLASS = 'rounded-[8px] p-[10px]';

/** Form panel — spectrum dark gray (interactive / warmGray) */
export const AUDIT_FORM_PANEL_STYLE = {
  backgroundColor: colors.surface.interactive,
} as const;

/** Inputs — white fill + goldIntense border (inline color beats base gray) */
export const AUDIT_INPUT_CLASS = 'border bg-embed-action-secondary';

export const AUDIT_INPUT_STYLE = {
  borderColor: colors.action.accent,
} as const;

export const LAND_OPTIONS = [
  { value: 'owned', label: 'MÁM' },
  { value: 'seeking', label: 'HLEDÁM' },
] as const;

export type LandOption = (typeof LAND_OPTIONS)[number]['value'];

/** Sentence-broken copy for calmer reading beside the plot illustration. */
export const LAND_OPTION_COPY: Record<LandOption, readonly [string, string]> = {
  owned: [
    'Prověříme umístění domu na Váš pozemek.',
    'Vyplňte formulář — ozveme se.',
  ],
  seeking: [
    'Najdeme vhodnou parcelu pro tento dům.',
    'Vyplňte formulář — ozveme se.',
  ],
};

export const AUDIT_LAND_PROMPT = 'MÁTE VLASTNÍ POZEMEK?';
