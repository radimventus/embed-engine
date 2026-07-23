/**
 * Fullscreen Experience overlay surface (Delivery infrastructure only).
 * No Reveal animation — mount target for Client Studio.
 */

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

function createCloseControl(onClose: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute(OVERLAY_CLOSE_ATTR, "");
  button.setAttribute("aria-label", "Zavřít Client Studio");
  button.textContent = "Zavřít Client Studio";
  button.addEventListener("click", (event) => {
    event.preventDefault();
    onClose();
  });
  return button;
}

/**
 * Append a viewport-sized overlay above the host page and lock host scroll.
 */
export function createOverlaySurface(options: {
  readonly onClose: () => void;
}): OverlaySurface {
  const scrollSnapshot = captureHostScroll();
  lockHostScroll(scrollSnapshot);

  const root = document.createElement("div");
  root.setAttribute(OVERLAY_ROOT_ATTR, "");
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-label", "Client Studio");

  const chrome = document.createElement("div");
  chrome.setAttribute("data-embed-overlay-chrome", "");
  chrome.appendChild(createCloseControl(options.onClose));

  const mountTarget = document.createElement("div");
  mountTarget.setAttribute(OVERLAY_MOUNT_ATTR, "");

  root.append(chrome, mountTarget);
  document.body.appendChild(root);

  return {
    root,
    mountTarget,
    scrollSnapshot,
    dispose: () => {
      root.remove();
      unlockHostScroll(scrollSnapshot);
    },
  };
}
