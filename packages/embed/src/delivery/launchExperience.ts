/**
 * Launcher Mode bootstrap — Delivery Pipeline (LRI-01).
 *
 * Launcher → Delivery → Client Studio Mount → (Provider) Runtime Bootstrap → Reveal → Active
 *
 * PT-EMBED-RUNTIME-INTEGRATION-01: Embed does not create HousePackage / Runtime.
 * Client Studio Provider is the sole Runtime initializer (same as standalone CS).
 */

import { mountClientStudio } from "@client-studio/embed-mount";

import type { EmbedSession } from "../bootstrap";
import { ensureClientStudioStyles } from "./ensureStyles";
import {
  LAUNCHER_DEFAULT_LANDING_ANCHOR,
} from "./landingAnchorResolver";
import type { LaunchRequest } from "./launchRequest";
import { createOverlaySurface, type OverlaySurface } from "./overlaySurface";
import { runRevealEngine } from "./revealEngine";
import { DEFAULT_OBJECT_ID } from "./resolveObjectPackage";

export type LauncherDeliverySession = EmbedSession & {
  readonly kind: "client-studio-launcher";
  readonly objectId: string;
  readonly overlay: OverlaySurface;
};

export type LauncherArmedSession = EmbedSession & {
  readonly kind: "launcher-armed";
  readonly unbind: () => void;
};

function failSafeDispose(
  overlay: OverlaySurface | null,
  studioDispose?: () => void,
  abortReveal?: AbortController,
): void {
  try {
    abortReveal?.abort();
  } catch {
    // best-effort
  }
  try {
    studioDispose?.();
  } catch {
    // best-effort
  }
  try {
    overlay?.dispose();
  } catch {
    // best-effort
  }
}

function resolvePilotObjectId(objectId: string | undefined): string {
  const resolved =
    objectId === undefined || objectId.trim().length === 0
      ? DEFAULT_OBJECT_ID
      : objectId.trim();
  if (resolved !== DEFAULT_OBJECT_ID) {
    throw new Error(
      `Embed.mount: unknown objectId "${resolved}". Known: ${DEFAULT_OBJECT_ID}`,
    );
  }
  return resolved;
}

/**
 * Execute Launch Request: overlay → Studio mount → Reveal → Active.
 * Runtime is created inside Client Studio Provider from Builder Package.
 * On bootstrap/runtime/mount failure: dispose partial surface and restore Host.
 * Reveal runs asynchronously after mount; Close aborts in-flight Reveal.
 */
export async function launchExperience(
  request: LaunchRequest,
  options: { readonly onClose: () => void },
): Promise<LauncherDeliverySession> {
  let overlay: OverlaySurface | null = null;
  let studioDispose: (() => void) | undefined;
  const revealAbort = new AbortController();

  try {
    ensureClientStudioStyles();

    const objectId = resolvePilotObjectId(request.objectId);

    overlay = createOverlaySurface({ onClose: options.onClose });

    const mountTarget = overlay.mountTarget;
    if (mountTarget == null || typeof mountTarget.setAttribute !== "function") {
      throw new Error(
        "Embed: launcher mount container is unavailable after overlay initialization",
      );
    }

    const handle = mountClientStudio({
      target: mountTarget,
      objectId,
      assetBase: request.assetBase,
    });
    studioDispose = handle.dispose;

    mountTarget.dataset.experienceMode = request.presentation.mode;
    mountTarget.dataset.landingAnchorId =
      request.presentation.landingAnchorId;
    overlay.root.setAttribute("data-embed-reveal-pending", "");

    const restoreFocusTo = request.restoreFocusTo ?? null;
    const overlayRef = overlay;

    // Runtime Ready: Provider bootstraps async; Reveal waits for Studio DOM (landing anchor).
    void runRevealEngine({
      studioRoot: mountTarget,
      scrollContainer: mountTarget,
      runtimeReady: true,
      configuredLandingAnchorId: request.presentation.landingAnchorId,
      modeDefaultLandingAnchorId: LAUNCHER_DEFAULT_LANDING_ANCHOR,
      signal: revealAbort.signal,
      onStateChange: (state) => {
        overlayRef.root.dataset.embedRevealState = state;
      },
    })
      .then((result) => {
        if (revealAbort.signal.aborted) {
          return;
        }
        overlayRef.root.removeAttribute("data-embed-reveal-pending");
        overlayRef.root.setAttribute("data-embed-experience-active", "");
        if (result.degraded) {
          overlayRef.root.setAttribute("data-embed-reveal-degraded", "");
        }
        overlayRef.root.dataset.landingAnchorId = result.anchorId;
      })
      .catch(() => {
        // Aborted or unexpected — Close path owns cleanup.
      });

    return {
      kind: "client-studio-launcher",
      host: restoreFocusTo ?? overlay.root,
      root: handle.rootElement,
      styleElement: document.createElement("style"),
      objectId,
      overlay,
      dispose: () => {
        failSafeDispose(overlay, studioDispose, revealAbort);
        if (restoreFocusTo && typeof restoreFocusTo.focus === "function") {
          try {
            restoreFocusTo.focus();
          } catch {
            // best-effort
          }
        }
      },
    };
  } catch (error) {
    failSafeDispose(overlay, studioDispose, revealAbort);
    throw error;
  }
}
