/**
 * Fullscreen Experience overlay surface (Delivery infrastructure only).
 * Mount target for Client Studio — Close lives in the sticky Experience header.
 */

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
 * Close is not rendered here — Client Studio sticky header owns the × control;
 * clicks on `[data-embed-close]` inside the overlay are delegated to `onClose`.
 */
export function createOverlaySurface(options: {
  readonly onClose: () => void;
}): OverlaySurface {
  const mountParent = resolveHostMountParent();
  const scrollSnapshot = captureHostScroll();
  lockHostScroll(scrollSnapshot);

  const root = document.createElement("div");
  root.setAttribute(OVERLAY_ROOT_ATTR, "");
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-label", "Client Studio");

  const mountTarget = document.createElement("div");
  mountTarget.setAttribute(OVERLAY_MOUNT_ATTR, "");

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

  appendNodes(root, mountTarget);
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
