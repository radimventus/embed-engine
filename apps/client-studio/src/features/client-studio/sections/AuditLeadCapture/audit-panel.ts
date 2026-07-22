import { colors } from '@embed-engine/design-tokens';

/** Primary content band. */
export const AUDIT_PANEL_MAX_WIDTH_CLASS = 'mx-auto w-full max-w-5xl';

/** Form band — optically narrower. */
export const AUDIT_FORM_MAX_WIDTH_CLASS = 'mx-auto w-full max-w-2xl';

export const AUDIT_SECTION_STYLE = {
  backgroundColor: colors.brand.navy,
} as const;

/** Single gold — muted bronze. */
export const AUDIT_ACCENT = colors.action.accent;
export const AUDIT_ON_ACCENT = colors.action.onAccent;
export const AUDIT_WHITE = colors.action.onPrimary;
export const AUDIT_MUTED = colors.border.default;

export const AUDIT_INPUT_HEIGHT_PX = 54;

export const AUDIT_INPUT_CLASS = 'h-[54px] border';

export const AUDIT_INPUT_STYLE = {
  backgroundColor: colors.surface.interactive,
  borderColor: colors.action.accent,
  color: colors.action.onSecondary,
} as const;
