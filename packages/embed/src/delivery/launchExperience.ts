/**
 * Launcher Mode bootstrap — Delivery Pipeline (LRI-01).
 *
 * Launcher → Delivery → Runtime Bootstrap → Client Studio Mount → Reveal → Active
 */

import { mountClientStudio } from "@client-studio/embed-mount";

import type { EmbedSession } from "../bootstrap";
import { createDeliveryRuntime } from "./createDeliveryRuntime";
import { ensureClientStudioStyles } from "./ensureStyles";
import {
  LAUNCHER_DEFAULT_LANDING_ANCHOR,
} from "./landingAnchorResolver";
import type { LaunchRequest } from "./launchRequest";
import { createOverlaySurface, type OverlaySurface } from "./overlaySurface";
import { runRevealEngine } from "./revealEngine";
import { resolveObjectPackage } from "./resolveObjectPackage";

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

/**
 * Execute Launch Request: overlay → Runtime → Studio mount → Reveal → Active.
 * On bootstrap/runtime/mount failure: dispose partial surface and restore Host.
 * Reveal runs asynchronously after mount; Close aborts in-flight Reveal.
 */
export function launchExperience(
  request: LaunchRequest,
  options: { readonly onClose: () => void },
): LauncherDeliverySession {
  let overlay: OverlaySurface | null = null;
  let studioDispose: (() => void) | undefined;
  const revealAbort = new AbortController();

  try {
    ensureClientStudioStyles();

    overlay = createOverlaySurface({ onClose: options.onClose });

    const mountTarget = overlay.mountTarget;
    if (mountTarget == null || typeof mountTarget.setAttribute !== "function") {
      throw new Error(
        "Embed: launcher mount container is unavailable after overlay initialization",
      );
    }

    const housePackage = resolveObjectPackage(request.objectId);
    const runtime = createDeliveryRuntime(housePackage);
    const runtimeReady = runtime.getExperience() !== null;

    const handle = mountClientStudio({
      target: mountTarget,
      runtime,
      assetBase: request.assetBase,
    });
    studioDispose = handle.dispose;

    mountTarget.dataset.experienceMode = request.presentation.mode;
    mountTarget.dataset.landingAnchorId =
      request.presentation.landingAnchorId;
    overlay.root.setAttribute("data-embed-reveal-pending", "");

    const restoreFocusTo = request.restoreFocusTo ?? null;
    const overlayRef = overlay;

    void runRevealEngine({
      studioRoot: mountTarget,
      scrollContainer: mountTarget,
      runtimeReady,
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
      objectId: housePackage.identity.id,
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
