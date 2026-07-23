/**
 * Launcher Mode bootstrap — Delivery Pipeline (LRI-01).
 *
 * Launcher → Delivery → Runtime Bootstrap → Client Studio Mount → Active
 * Reveal is a no-op settle (no animation) for this foundation PT.
 */

import { mountClientStudio } from "@client-studio/embed-mount";

import type { EmbedSession } from "../bootstrap";
import { createDeliveryRuntime } from "./createDeliveryRuntime";
import { ensureClientStudioStyles } from "./ensureStyles";
import type { LaunchRequest } from "./launchRequest";
import { createOverlaySurface, type OverlaySurface } from "./overlaySurface";
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

function failSafeDispose(overlay: OverlaySurface | null, studioDispose?: () => void): void {
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
 * Execute Launch Request: overlay → Runtime → Studio mount → Active.
 * On bootstrap/runtime/mount failure: dispose partial surface and restore Host.
 */
export function launchExperience(
  request: LaunchRequest,
  options: { readonly onClose: () => void },
): LauncherDeliverySession {
  let overlay: OverlaySurface | null = null;
  let studioDispose: (() => void) | undefined;

  try {
    ensureClientStudioStyles();

    overlay = createOverlaySurface({ onClose: options.onClose });

    const housePackage = resolveObjectPackage(request.objectId);
    const runtime = createDeliveryRuntime(housePackage);

    const handle = mountClientStudio({
      target: overlay.mountTarget,
      runtime,
      assetBase: request.assetBase,
    });
    studioDispose = handle.dispose;

    // Reveal deferred — mark Active without Landing Anchor scroll.
    overlay.root.setAttribute("data-embed-experience-active", "");
    overlay.mountTarget.dataset.landingAnchorId =
      request.presentation.landingAnchorId;
    overlay.mountTarget.dataset.experienceMode = request.presentation.mode;

    const restoreFocusTo = request.restoreFocusTo ?? null;

    return {
      kind: "client-studio-launcher",
      host: restoreFocusTo ?? overlay.root,
      root: handle.rootElement,
      styleElement: document.createElement("style"),
      objectId: housePackage.identity.id,
      overlay,
      dispose: () => {
        failSafeDispose(overlay, studioDispose);
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
    failSafeDispose(overlay, studioDispose);
    throw error;
  }
}
