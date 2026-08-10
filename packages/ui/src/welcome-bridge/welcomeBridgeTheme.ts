import { colors, palette } from "@embed-engine/design-tokens";

import type { WelcomeBridgeTheme } from "./types";

/** Default CONIS guide panel — navy field, cream type, gold CTA. */
export const DEFAULT_WELCOME_BRIDGE_THEME: WelcomeBridgeTheme = Object.freeze({
  backgroundColor: colors.brand.navy,
  titleColor: palette.pureWhite,
  headlineColor: palette.warmWhite,
  descriptionColor: "rgba(247, 246, 244, 0.78)",
  ctaBackgroundColor: colors.brand.gold,
  ctaTextColor: colors.brand.navy,
  closeColor: "rgba(247, 246, 244, 0.72)",
  /** ~30% wider than the prior 546px CTA panel. */
  widthPx: 710,
  minHeightPx: 148,
  borderRadiusPx: 14,
  shadow: "0 18px 48px rgba(0, 25, 48, 0.35)",
});

export function resolveWelcomeBridgeTheme(
  override?: Partial<WelcomeBridgeTheme>,
): WelcomeBridgeTheme {
  if (override === undefined) {
    return DEFAULT_WELCOME_BRIDGE_THEME;
  }
  return {
    ...DEFAULT_WELCOME_BRIDGE_THEME,
    ...override,
  };
}
