/**
 * Launch Context — opaque entry metadata (EMB-01 / EDIC-01).
 * Non-Interpretive; Delivery attaches it for boundary use only.
 */

export type LaunchContext = {
  readonly hostId?: string;
  readonly hostKind?: string;
  readonly entryPoint?: string;
  readonly launcherId?: string;
  readonly referrer?: string;
  readonly campaign?: Readonly<Record<string, string>>;
};

/**
 * Experience presentation flags interpreted by Delivery (Builder-declared shape).
 * Foundation: Mode + Landing Anchor id only — Reveal deferred.
 */
export type ExperiencePresentationConfig = {
  readonly mode: "standalone" | "launcher" | "inline";
  readonly landingAnchorId: string;
  readonly showCloseAction: boolean;
};

export const LAUNCHER_DEFAULT_PRESENTATION: ExperiencePresentationConfig =
  Object.freeze({
    mode: "launcher",
    landingAnchorId: "social-proof",
    showCloseAction: true,
  });

export const INLINE_DEFAULT_PRESENTATION: ExperiencePresentationConfig =
  Object.freeze({
    mode: "inline",
    landingAnchorId: "hero",
    showCloseAction: false,
  });
