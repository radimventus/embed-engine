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
      headline: "Pojďme společně objevit, co je pro vás skutečně podstatné.",
      description:
        "Vaše odpovědi ovlivní další témata i závěrečný PDF souhrn, který pro vás připravím. Ptejte se, na co uznáte za vhodné, rád vám poradím.",
      ctaLabel: "→ Pokračovat k nastavení priorit",
      closeLabel: "Zavřít",
    }),
    triggers: Object.freeze([
      Object.freeze({ kind: "on-continue-to-priority" as const }),
      Object.freeze({ kind: "delay-after-mount" as const, delayMs: 20_000 }),
    ]),
  });
