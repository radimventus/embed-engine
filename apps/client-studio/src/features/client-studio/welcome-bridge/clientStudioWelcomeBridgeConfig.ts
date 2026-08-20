import type { WelcomeBridgeConfig } from "@embed-engine/ui";

export const PRIORITY_MOTIVATION_BANNER_HEADLINE =
  "Pojďme spolu objevit, co je pro Vás skutečně podstatné.";

export const PRIORITY_MOTIVATION_BANNER_COPY =
  "Nastavte si priority, které pak zohledním v dalším obsahu a v PDF ke stažení.";

/**
 * Client Studio Experience variant of the Welcome Bridge
 * (Tour → Priority Decision Transition).
 *
 * Copy lives here — not inside the platform component.
 * Title stays empty so the removed CONIS kicker is not rendered.
 */
export const CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG: WelcomeBridgeConfig =
  Object.freeze({
    variant: "client-studio-tour-to-priority",
    content: Object.freeze({
      title: "",
      headline: PRIORITY_MOTIVATION_BANNER_HEADLINE,
      description: PRIORITY_MOTIVATION_BANNER_COPY,
      ctaLabel: "→ Pokračovat k nastavení priorit",
      closeLabel: "Zavřít",
    }),
    triggers: Object.freeze([
      Object.freeze({ kind: "delay-after-mount" as const, delayMs: 20_000 }),
    ]),
  });
