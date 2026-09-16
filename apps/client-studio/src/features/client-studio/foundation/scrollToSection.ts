/**
 * Smooth scroll to a Decision Journey section anchor (CSCB-01).
 * Aligns the section just below the sticky Experience header when present.
 */
export const CANONICAL_SCROLL_MIN_DURATION_MS = 816;
export const CANONICAL_SCROLL_MAX_DURATION_MS = 1320;

export function canonicalScrollDurationMs(distancePx: number): number {
  return Math.round(
    Math.min(
      CANONICAL_SCROLL_MAX_DURATION_MS,
      Math.max(
        CANONICAL_SCROLL_MIN_DURATION_MS,
        768 + Math.abs(distancePx) * 0.456,
      ),
    ),
  );
}

/** Cubic smoothstep: monotonic, zero velocity at both ends, no midpoint kink. */
export function canonicalScrollProgress(progress: number): number {
  const bounded = Math.min(1, Math.max(0, progress));
  return bounded * bounded * (3 - 2 * bounded);
}

export type ScrollToSectionOptions = {
  /** Moves the target this many pixels above the standard 20px safe inset. */
  readonly additionalOffsetPx?: number;
  readonly onFirstFrame?: () => void;
  readonly onComplete?: () => void;
};

/** Exact 090cd3b3 HeroCTA runtime geometry (not the generic scene inset).
 * Social Proof is flush below the sticky header in document and overlay hosts.
 */
export function heroTourTargetY(): number | null {
  const target = document.getElementById("social-proof");
  if (!target) return null;
  const header = document.querySelector<HTMLElement>("[data-experience-header]");
  const offset = Math.ceil(header?.getBoundingClientRect().height ?? 72);
  const overlay = document.querySelector<HTMLElement>("[data-embed-overlay-mount]");
  return Math.max(0, (overlay?.scrollTop ?? window.scrollY) +
    target.getBoundingClientRect().top - (overlay?.getBoundingClientRect().top ?? 0) - offset);
}

export function isBeforeHeroTourAnchor(): boolean {
  const to = heroTourTargetY();
  const overlay = document.querySelector<HTMLElement>("[data-embed-overlay-mount]");
  return to !== null && (overlay?.scrollTop ?? window.scrollY) < to - 3;
}

export type PinnedNavigationTimingMark =
  | "threshold"
  | "transition-request"
  | "first-frame"
  | "target-reached"
  | "lock-start";

export function markPinnedNavigationTiming(
  mark: PinnedNavigationTimingMark,
): void {
  if (typeof performance !== "undefined" && "mark" in performance) {
    const at = performance.now();
    performance.mark(`client-studio:pinned-${mark}`, { startTime: at });
    const root = document.documentElement;
    const previous = root.dataset.pinnedNavigationTiming;
    const entries = previous
      ? (JSON.parse(previous) as Array<{ mark: string; at: number }>)
      : [];
    root.dataset.pinnedNavigationTiming = JSON.stringify([
      ...entries.slice(-9),
      { mark, at },
    ]);
  }
}

export function scrollToSection(
  sectionId: string,
  behavior: ScrollBehavior = "smooth",
  options: ScrollToSectionOptions = {},
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
    const destination = (sectionId === "social-proof" ? heroTourTargetY() : null) ?? Math.max(
      0,
      nextTop + (options.additionalOffsetPx ?? 0),
    );
    animateScroll(
      overlayMount,
      destination,
      behavior === "smooth"
        ? canonicalScrollDurationMs(destination - overlayMount.scrollTop)
        : 0,
      reducedMotion,
      canonicalScrollProgress,
      options.onFirstFrame,
      options.onComplete,
    );
  } else {
    const top =
      window.scrollY + target.getBoundingClientRect().top - headerOffset;
    const destination = (sectionId === "social-proof" ? heroTourTargetY() : null) ?? Math.max(0, top + (options.additionalOffsetPx ?? 0));
    animateScroll(
      window,
      destination,
      behavior === "smooth"
        ? canonicalScrollDurationMs(destination - window.scrollY)
        : 0,
      reducedMotion,
      canonicalScrollProgress,
      options.onFirstFrame,
      options.onComplete,
    );
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

/** Confirms that canonical positioning has actually reached its target. */
export function isSectionAtScrollAnchor(
  sectionId: string,
  additionalOffsetPx = 0,
  tolerancePx = 3,
): boolean {
  const target = document.getElementById(sectionId);
  if (target === null) return false;
  const header = document.querySelector<HTMLElement>(
    "[data-experience-header]",
  );
  const headerOffset =
    (header ? Math.ceil(header.getBoundingClientRect().height) : 0) + 20;
  const overlayMount = document.querySelector<HTMLElement>(
    "[data-embed-overlay-mount]",
  );
  const viewportTop = overlayMount?.getBoundingClientRect().top ?? 0;
  const currentScrollTop = overlayMount?.scrollTop ?? window.scrollY;
  const maximumScrollTop = overlayMount
    ? overlayMount.scrollHeight - overlayMount.clientHeight
    : document.documentElement.scrollHeight - window.innerHeight;
  const requestedScrollTop =
    currentScrollTop +
    target.getBoundingClientRect().top -
    viewportTop -
    headerOffset +
    additionalOffsetPx;
  const reachableScrollTop = Math.min(
    Math.max(0, requestedScrollTop),
    Math.max(0, maximumScrollTop),
  );
  return Math.abs(currentScrollTop - reachableScrollTop) <= tolerancePx;
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
      (progress) => easeProgress(progress, easing),
      undefined,
    );
  } else {
    const top =
      window.scrollY + target.getBoundingClientRect().top - headerOffset;
    animateScroll(
      window,
      Math.max(0, top),
      durationMs,
      reducedMotion,
      (progress) => easeProgress(progress, easing),
      undefined,
    );
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

type ActiveScroll = {
  readonly frameId: number;
  readonly restoreChrome: () => void;
};

const activeScrollFrames = new WeakMap<HTMLElement | Window, ActiveScroll>();

export function cancelSectionScroll(): void {
  const scroller = document.querySelector<HTMLElement>("[data-embed-overlay-mount]") ?? window;
  const active = activeScrollFrames.get(scroller);
  if (!active) return;
  window.cancelAnimationFrame(active.frameId);
  active.restoreChrome();
  activeScrollFrames.delete(scroller);
}

function animateScroll(
  scroller: HTMLElement | Window,
  to: number,
  durationMs: number,
  reducedMotion: boolean,
  easing: (progress: number) => number,
  onFirstFrame?: () => void,
  onComplete?: () => void,
): void {
  const activeScroll = activeScrollFrames.get(scroller);
  if (activeScroll !== undefined) {
    window.cancelAnimationFrame(activeScroll.frameId);
    activeScroll.restoreChrome();
    activeScrollFrames.delete(scroller);
  }
  const chromeRoot =
    scroller instanceof Window ? document.documentElement : scroller;
  const previousBehavior = chromeRoot.style.scrollBehavior;
  const previousSnapType = chromeRoot.style.scrollSnapType;
  const previousAnchor = chromeRoot.style.overflowAnchor;
  chromeRoot.style.scrollBehavior = "auto";
  chromeRoot.style.scrollSnapType = "none";
  chromeRoot.style.overflowAnchor = "none";
  // Native wheel/touch scrolling must not race the RAF writer. This ownership
  // ends synchronously with the last frame, not after a post-arrival timer.
  const preventNativeScroll = (event: Event) => event.preventDefault();
  scroller.addEventListener("wheel", preventNativeScroll, { passive: false, capture: true });
  scroller.addEventListener("touchmove", preventNativeScroll, { passive: false, capture: true });
  let chromeRestored = false;
  const restoreChrome = () => {
    if (chromeRestored) return;
    chromeRestored = true;
    chromeRoot.style.scrollBehavior = previousBehavior;
    chromeRoot.style.scrollSnapType = previousSnapType;
    chromeRoot.style.overflowAnchor = previousAnchor;
    scroller.removeEventListener("wheel", preventNativeScroll, true);
    scroller.removeEventListener("touchmove", preventNativeScroll, true);
  };
  const complete = () => {
    activeScrollFrames.delete(scroller);
    restoreChrome();
    onComplete?.();
  };
  const from =
    scroller instanceof Window ? scroller.scrollY : scroller.scrollTop;

  if (reducedMotion || durationMs <= 0) {
    if (scroller instanceof Window) {
      scroller.scrollTo({ top: to, left: 0, behavior: "auto" });
    } else {
      scroller.scrollTop = to;
    }
    if (Math.abs(to - from) > 0) {
      onFirstFrame?.();
    }
    complete();
    return;
  }

  const delta = to - from;
  if (Math.abs(delta) < 1) {
    complete();
    return;
  }

  const startedAt = performance.now();
  let firstFrameWritten = false;

  const tick = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / durationMs);
    const next = from + delta * easing(progress);
    if (scroller instanceof Window) {
      scroller.scrollTo({ top: next, left: 0, behavior: "auto" });
    } else {
      scroller.scrollTop = next;
    }
    const actual = scroller instanceof Window ? scroller.scrollY : scroller.scrollTop;
    if (!firstFrameWritten && Math.abs(actual - from) > 0) {
      firstFrameWritten = true;
      onFirstFrame?.();
    }
    if (progress < 1) {
      activeScrollFrames.set(scroller, {
        frameId: window.requestAnimationFrame(tick),
        restoreChrome,
      });
    } else {
      complete();
    }
  };

  activeScrollFrames.set(scroller, {
    frameId: window.requestAnimationFrame(tick),
    restoreChrome,
  });
}
