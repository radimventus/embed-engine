import type { WelcomeBridgeConfig } from "@embed-engine/ui";

/**
 * Client Studio Experience variant of the Welcome Bridge
 * (Tour → Priority Decision Transition).
 *
 * Copy lives here — not inside the platform component.
 */
export const CLIENT_STUDIO_WELCOME_BRIDGE_CONFIG: WelcomeBridgeConfig =
  Object.freeze({
    variant: "client-studio-tour-to-priority",
    content: Object.freeze({
      title: "Jmenuji se CONIS.",
      headline:
        "Teď, když jsme prošli váš možný nový domov, pojďme společně objevit, co je pro vás skutečně podstatné.",
      description:
        "Vaše odpovědi ovlivní celý další průběh Experience i závěrečný PDF přehled, který pro vás připravím.",
      ctaLabel: "→ Pokračovat k prioritám",
      closeLabel: "Zavřít",
    }),
    triggers: Object.freeze([
      Object.freeze({ kind: "on-continue-to-priority" as const }),
      Object.freeze({ kind: "delay-after-mount" as const, delayMs: 20_000 }),
    ]),
  });
