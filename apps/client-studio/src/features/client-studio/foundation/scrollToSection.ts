/**
 * Smooth scroll to a Decision Journey section anchor (CSCB-01).
 * Aligns the section just below the sticky Experience header when present.
 */
export function scrollToSection(
  sectionId: string,
  behavior: ScrollBehavior = "smooth",
): void {
  const target = document.getElementById(sectionId);
  if (target === null) {
    return;
  }

  const header = document.querySelector<HTMLElement>(
    "[data-experience-header]",
  );
  const safeOffset = 20;
  const headerOffset = header
    ? Math.ceil(header.getBoundingClientRect().height) + safeOffset
    : safeOffset;

  const overlayMount = document.querySelector<HTMLElement>(
    "[data-embed-overlay-mount]",
  );

  if (overlayMount) {
    const containerRect = overlayMount.getBoundingClientRect();
    const elementRect = target.getBoundingClientRect();
    const nextTop =
      overlayMount.scrollTop +
      (elementRect.top - containerRect.top) -
      headerOffset;
    overlayMount.scrollTo({
      top: Math.max(0, nextTop),
      left: 0,
      behavior,
    });
  } else {
    const top =
      window.scrollY + target.getBoundingClientRect().top - headerOffset;
    window.scrollTo({ top: Math.max(0, top), left: 0, behavior });
  }

  if (typeof target.focus === "function") {
    target.focus({ preventScroll: true });
  }
}

/**
 * A newly revealed scene can exist before its content contributes to the
 * scroll range. Wait to scroll until the requested header offset is reachable.
 */
export function isSectionScrollReady(sectionId: string): boolean {
  const target = document.getElementById(sectionId);
  if (target === null) {
    return false;
  }

  const header = document.querySelector<HTMLElement>(
    "[data-experience-header]",
  );
  const safeOffset = 20;
  const headerOffset = header
    ? Math.ceil(header.getBoundingClientRect().height) + safeOffset
    : safeOffset;
  const overlayMount = document.querySelector<HTMLElement>(
    "[data-embed-overlay-mount]",
  );

  if (overlayMount === null) {
    return true;
  }

  const containerRect = overlayMount.getBoundingClientRect();
  const targetTop =
    overlayMount.scrollTop +
    (target.getBoundingClientRect().top - containerRect.top) -
    headerOffset;
  const maximumScrollTop =
    overlayMount.scrollHeight - overlayMount.clientHeight;
  return targetTop <= maximumScrollTop;
}

/** Priority chapter bridge block — CAP UX 39 scroll target. */
export const PRIORITY_BRIDGE_ANCHOR_ID = "priority-chapter-bridge";

export type ScrollElementIntoViewOptions = {
  /** Constant-speed roll (default). Ease-in-out feels stuck then rushes. */
  readonly easing?: "linear" | "ease-in-out";
};

/**
 * Timed scroll for Priority bridge anchor (CAP UX 39 / CAP UX3 07).
 * Caller holds the target statically first; this only performs the roll.
 * Default easing is linear so tempo stays even for the whole distance.
 */
export function scrollElementIntoView(
  target: HTMLElement,
  durationMs: number = 600,
  options: ScrollElementIntoViewOptions = {},
): void {
  const header = document.querySelector<HTMLElement>(
    "[data-experience-header]",
  );
  const safeOffset = 20;
  const headerOffset = header
    ? Math.ceil(header.getBoundingClientRect().height) + safeOffset
    : safeOffset;
  const easing = options.easing ?? "linear";

  const overlayMount = document.querySelector<HTMLElement>(
    "[data-embed-overlay-mount]",
  );

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (overlayMount) {
    const containerRect = overlayMount.getBoundingClientRect();
    const elementRect = target.getBoundingClientRect();
    const nextTop =
      overlayMount.scrollTop +
      (elementRect.top - containerRect.top) -
      headerOffset;
    animateScroll(
      overlayMount,
      Math.max(0, nextTop),
      durationMs,
      reducedMotion,
      easing,
    );
  } else {
    const top =
      window.scrollY + target.getBoundingClientRect().top - headerOffset;
    animateScroll(window, Math.max(0, top), durationMs, reducedMotion, easing);
  }

  if (typeof target.focus === "function") {
    target.focus({ preventScroll: true });
  }
}

function easeProgress(
  progress: number,
  easing: "linear" | "ease-in-out",
): number {
  if (easing === "linear") {
    return progress;
  }
  return progress < 0.5
    ? 2 * progress * progress
    : 1 - (-2 * progress + 2) ** 2 / 2;
}

function animateScroll(
  scroller: HTMLElement | Window,
  to: number,
  durationMs: number,
  reducedMotion: boolean,
  easing: "linear" | "ease-in-out",
): void {
  const from =
    scroller instanceof Window ? scroller.scrollY : scroller.scrollTop;

  if (reducedMotion || durationMs <= 0) {
    if (scroller instanceof Window) {
      scroller.scrollTo({ top: to, left: 0, behavior: "auto" });
    } else {
      scroller.scrollTop = to;
    }
    return;
  }

  const delta = to - from;
  if (Math.abs(delta) < 1) {
    return;
  }

  const startedAt = performance.now();

  const tick = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / durationMs);
    const next = from + delta * easeProgress(progress, easing);
    if (scroller instanceof Window) {
      scroller.scrollTo({ top: next, left: 0, behavior: "auto" });
    } else {
      scroller.scrollTop = next;
    }
    if (progress < 1) {
      window.requestAnimationFrame(tick);
    }
  };

  window.requestAnimationFrame(tick);
}
