/**
 * Host scroll lock / restore for Launcher Mode overlay (EDL-01 / LRI-01).
 */

export type HostScrollSnapshot = {
  readonly scrollX: number;
  readonly scrollY: number;
  readonly bodyOverflow: string;
  readonly htmlOverflow: string;
};

function resolveScrollElements(): {
  readonly body: HTMLElement;
  readonly html: HTMLElement;
} {
  const html = document.documentElement;
  const body = document.body ?? html;
  if (!body || !html) {
    throw new Error("Embed: cannot lock host scroll — document is unavailable");
  }
  return { body, html };
}

export function captureHostScroll(): HostScrollSnapshot {
  const { body, html } = resolveScrollElements();
  return {
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    bodyOverflow: body.style.overflow,
    htmlOverflow: html.style.overflow,
  };
}

export function lockHostScroll(snapshot: HostScrollSnapshot): void {
  const { body, html } = resolveScrollElements();
  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
  // Preserve visual position while locked.
  body.style.position = "fixed";
  body.style.top = `-${snapshot.scrollY}px`;
  body.style.left = `-${snapshot.scrollX}px`;
  body.style.right = "0";
  body.style.width = "100%";
}

export function unlockHostScroll(snapshot: HostScrollSnapshot): void {
  const { body, html } = resolveScrollElements();
  body.style.position = "";
  body.style.top = "";
  body.style.left = "";
  body.style.right = "";
  body.style.width = "";
  body.style.overflow = snapshot.bodyOverflow;
  html.style.overflow = snapshot.htmlOverflow;
  window.scrollTo(snapshot.scrollX, snapshot.scrollY);
}
