/**
 * Fullscreen Experience overlay surface (Delivery infrastructure only).
 * Mount target for Client Studio. Close control is Delivery chrome (not CS UI).
 */

import { markEmbedBoundary } from "./ensureStyles";
import {
  appendNodes,
  resolveHostMountParent,
} from "./hostDocument";
import {
  captureHostScroll,
  lockHostScroll,
  unlockHostScroll,
  type HostScrollSnapshot,
} from "./hostScrollLock";

export const OVERLAY_ROOT_ATTR = "data-embed-overlay";
export const OVERLAY_MOUNT_ATTR = "data-embed-overlay-mount";
export const OVERLAY_CLOSE_ATTR = "data-embed-close";

export type OverlaySurface = {
  readonly root: HTMLElement;
  readonly mountTarget: HTMLElement;
  readonly scrollSnapshot: HostScrollSnapshot;
  readonly dispose: () => void;
};

/**
 * Append a viewport-sized overlay above the host page and lock host scroll.
 * Renders Close as Delivery chrome so Client Studio header matches Local.
 */
export function createOverlaySurface(options: {
  readonly onClose: () => void;
}): OverlaySurface {
  const mountParent = resolveHostMountParent();
  const scrollSnapshot = captureHostScroll();
  lockHostScroll(scrollSnapshot);

  const root = document.createElement("div");
  root.setAttribute(OVERLAY_ROOT_ATTR, "");
  markEmbedBoundary(root);
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-label", "Client Studio");
  root.style.position = "fixed";
  root.style.inset = "0";
  root.style.zIndex = "2147483000";

  const mountTarget = document.createElement("div");
  mountTarget.setAttribute(OVERLAY_MOUNT_ATTR, "");
  markEmbedBoundary(mountTarget);
  mountTarget.style.position = "absolute";
  mountTarget.style.inset = "0";

  const close = document.createElement("button");
  close.type = "button";
  close.setAttribute(OVERLAY_CLOSE_ATTR, "");
  close.setAttribute("aria-label", "Zavřít Client Studio");
  close.style.position = "absolute";
  close.style.top = "0.75rem";
  close.style.right = "0.75rem";
  close.style.zIndex = "1";
  close.style.display = "flex";
  close.style.height = "2.75rem";
  close.style.width = "2.75rem";
  close.style.alignItems = "center";
  close.style.justifyContent = "center";
  close.style.border = "0";
  close.style.borderRadius = "9999px";
  close.style.background = "transparent";
  close.style.padding = "0";
  close.style.cursor = "pointer";
  close.innerHTML =
    '<span aria-hidden="true" style="display:grid;height:2rem;width:2rem;place-items:center;overflow:hidden;border-radius:9999px;background:#001930;color:#fff;box-shadow:0 1px 2px rgba(0,0,0,.12)"><span style="display:flex;height:1em;width:1em;align-items:center;justify-content:center;font-size:2rem;font-weight:700;line-height:1;translate:1px -1px">×</span></span>';

  const onCloseClick = (event: Event): void => {
    const target = event.target;
    if (
      target == null ||
      typeof (target as { closest?: unknown }).closest !== "function"
    ) {
      return;
    }
    const el = target as Element;
    if (!el.closest(`[${OVERLAY_CLOSE_ATTR}]`)) {
      return;
    }
    event.preventDefault();
    options.onClose();
  };
  root.addEventListener("click", onCloseClick);

  appendNodes(root, mountTarget, close);
  mountParent.appendChild(root);

  if (typeof mountTarget.setAttribute !== "function") {
    if (root.parentNode) {
      root.parentNode.removeChild(root);
    }
    unlockHostScroll(scrollSnapshot);
    throw new Error("Embed: launcher mount container failed to initialize");
  }

  return {
    root,
    mountTarget,
    scrollSnapshot,
    dispose: () => {
      root.removeEventListener("click", onCloseClick);
      if (root.parentNode) {
        root.parentNode.removeChild(root);
      }
      unlockHostScroll(scrollSnapshot);
    },
  };
}
