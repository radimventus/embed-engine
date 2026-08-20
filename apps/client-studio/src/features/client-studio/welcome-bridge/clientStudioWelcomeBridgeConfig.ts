import type { WelcomeBridgeConfig } from "@embed-engine/ui";

export const PRIORITY_MOTIVATION_BANNER_COPY =
  "Nastavte si priority, které zohledníme v dalším obsahu a přípravě PDF ke stažení.";

/**
 * Client Studio Experience variant of the Welcome Bridge
 * (Tour → Priority Decision Transition).
 *
 * Copy lives here — not inside the platform component.
 * Empty title/headline are not rendered, so the banner is one sentence.
 */
export const CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG: WelcomeBridgeConfig =
  Object.freeze({
    variant: "client-studio-tour-to-priority",
    content: Object.freeze({
      title: "",
      headline: "",
      description: PRIORITY_MOTIVATION_BANNER_COPY,
      ctaLabel: "→ Pokračovat k nastavení priorit",
      closeLabel: "Zavřít",
    }),
    triggers: Object.freeze([
      Object.freeze({ kind: "delay-after-mount" as const, delayMs: 20_000 }),
    ]),
  });
