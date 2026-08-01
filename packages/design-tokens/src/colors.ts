/**
 * Platform + Embed color system.
 * Click-model SSOT (`docs/platform/click model.html`) for platform chrome.
 */
export const palette = {
  navy: '#001930',
  warmWhite: '#F7F6F4',
  /** Interactive secondary surfaces (FAQ rows, segment track, idle segments). */
  warmGray: '#E8E5E0',
  lightGray: '#E3E3E3',
  gold: '#C8A165',
  /** Muted bronze accent — Audit / action gold (CTA, workflow, panels). */
  goldIntense: '#B8922D',
  /** Click-model gold-light surface. */
  goldLight: '#FBF7EE',
  /** Click-model canvas. */
  platformBg: '#F5F7FB',
  /** Click-model muted text. */
  platformMuted: '#64748B',
  /** Click-model hairline. */
  platformLine: '#E2E8F0',
  /** Builder active / blue accent from click model. */
  platformBlue: '#18428F',
  platformBlueBg: '#EEF4FF',
  pureWhite: '#FFFFFF',
} as const;

export const colors = {
  white: palette.warmWhite,
  black: palette.navy,
  /** Collapsed scale — every step resolves to a palette color */
  neutral: {
    50: palette.warmWhite,
    100: palette.warmWhite,
    200: palette.lightGray,
    300: palette.lightGray,
    400: palette.lightGray,
    500: palette.navy,
    600: palette.navy,
    700: palette.navy,
    800: palette.navy,
    900: palette.navy,
    950: palette.navy,
  },
  status: {
    ready: palette.gold,
    warning: palette.gold,
    error: palette.navy,
    info: palette.navy,
  },
  background: {
    primary: palette.platformBg,
    secondary: palette.platformBg,
    tertiary: palette.lightGray,
  },
  foreground: {
    primary: palette.navy,
    secondary: palette.navy,
    tertiary: palette.platformMuted,
    muted: palette.platformMuted,
  },
  border: {
    default: palette.platformLine,
    strong: palette.platformLine,
    /** Input / accent outlines — saturated gold */
    gold: palette.goldIntense,
  },
  brand: {
    navy: palette.navy,
    gold: palette.gold,
    goldIntense: palette.goldIntense,
    goldLight: palette.goldLight,
  },
  /** Interactive action surfaces — consumed by @embed-engine/ui */
  action: {
    primary: palette.navy,
    onPrimary: palette.pureWhite,
    secondary: palette.pureWhite,
    onSecondary: palette.navy,
    secondaryAccent: palette.gold,
    accent: palette.goldIntense,
    onAccent: palette.navy,
    muted: palette.lightGray,
    onMuted: palette.navy,
  },
  surface: {
    chatUser: palette.warmGray,
    chatAssistant: palette.warmWhite,
    chatIncoming: palette.warmGray,
    chatOutgoing: palette.warmWhite,
    placeholder: palette.lightGray,
    card: palette.pureWhite,
    elevated: palette.pureWhite,
    inset: palette.lightGray,
    /** Shared interactive fill — FAQ items, SegmentedControl track/idle */
    interactive: palette.warmGray,
  },
  platform: {
    navy: palette.navy,
    gold: palette.goldIntense,
    goldLight: palette.goldLight,
    bg: palette.platformBg,
    muted: palette.platformMuted,
    line: palette.platformLine,
    blue: palette.platformBlue,
    blueBg: palette.platformBlueBg,
    card: palette.pureWhite,
  },
} as const;
