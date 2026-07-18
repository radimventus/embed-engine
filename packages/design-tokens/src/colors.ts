/**
 * Client Studio / EMBED color system.
 * Single source of truth — only these palette values exist.
 */
export const palette = {
  navy: '#001E3A',
  warmWhite: '#F7F6F4',
  /** Interactive secondary surfaces (FAQ rows, segment track, idle segments). */
  warmGray: '#E8E5E0',
  lightGray: '#E3E3E3',
  gold: '#C8A165',
  /** Strong accent fill (Audit segmented control). */
  goldIntense: '#D4AF37',
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
    primary: palette.warmWhite,
    secondary: palette.warmWhite,
    tertiary: palette.lightGray,
  },
  foreground: {
    primary: palette.navy,
    secondary: palette.navy,
    tertiary: palette.navy,
    muted: palette.navy,
  },
  border: {
    default: palette.lightGray,
    strong: palette.lightGray,
    /** Input / accent outlines — saturated gold */
    gold: palette.goldIntense,
  },
  brand: {
    navy: palette.navy,
    gold: palette.gold,
    goldIntense: palette.goldIntense,
    goldLight: palette.lightGray,
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
    card: palette.warmWhite,
    elevated: palette.pureWhite,
    inset: palette.lightGray,
    /** Shared interactive fill — FAQ items, SegmentedControl track/idle */
    interactive: palette.warmGray,
  },
} as const;
