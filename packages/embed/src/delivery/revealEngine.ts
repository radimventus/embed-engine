/**
 * Reveal Engine — Delivery-owned viewport settle to Landing Anchor (LRI-01 / ADR-014).
 *
 * Starts only after Runtime Ready + Studio Ready (state sync — no fixed delays).
 * Runtime remains unaware of Reveal.
 *
 * UX settle: open at document start (Hero), then smooth-scroll (~500ms) so the
 * Landing Anchor aligns just below the sticky Experience header.
 */

import {
  landingAnchorSelector,
  resolveLandingAnchorId,
} from "./landingAnchorResolver";

/** Smooth landing reveal duration (presentation only — not a public mount option). */
export const LANDING_REVEAL_DURATION_MS = 500;

export type RevealState =
  | "idle"
  | "waiting-ready"
  | "resolving-anchor"
  | "revealing"
  | "active"
  | "degraded"
  | "aborted";

export type RevealEngineOptions = {
  /** Root that contains Client Studio (overlay mount target). */
  readonly studioRoot: HTMLElement;
  /** Scrollport owned by Delivery (usually the overlay mount). */
  readonly scrollContainer: HTMLElement;
  /** True when Delivery Runtime Session has Experience projection. */
  readonly runtimeReady: boolean;
  readonly configuredLandingAnchorId: string;
  readonly modeDefaultLandingAnchorId: string;
  readonly signal: AbortSignal;
  readonly onStateChange?: (state: RevealState) => void;
};

export type RevealEngineResult = {
  readonly state: "active" | "degraded" | "aborted";
  readonly anchorId: string;
  readonly degraded: boolean;
};

export type SettleViewportOptions = {
  readonly signal?: AbortSignal;
  /** Scroll animation length in ms. Use `0` for instant settle (tests). */
  readonly durationMs?: number;
  /**
   * When true (default), jump to top first so Hero is the initial view,
   * then animate to the Landing Anchor.
   */
  readonly fromTop?: boolean;
};

function setState(
  options: RevealEngineOptions,
  state: RevealState,
): void {
  options.onStateChange?.(state);
  options.scrollContainer.dataset.embedRevealState = state;
}

function isAborted(signal: AbortSignal): boolean {
  return signal.aborted;
}

function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame !== "function") {
      resolve();
      return;
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

/**
 * Sticky Experience header height inside the Delivery scrollport.
 * Landing Anchor settle subtracts this so content sits just below the header.
 */
export function readStickyHeaderOffset(scrollContainer: HTMLElement): number {
  const header = scrollContainer.querySelector<HTMLElement>(
    "[data-experience-header]",
  );
  if (!header) {
    return 0;
  }
  return Math.ceil(header.getBoundingClientRect().height);
}

/**
 * Ease-in-out cubic for a natural vertical reveal (no fade / no library).
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Animate `scrollTop` over `durationMs`. Resolves early when aborted.
 */
export function animateScrollTop(
  scrollContainer: HTMLElement,
  targetTop: number,
  durationMs: number,
  signal: AbortSignal,
): Promise<void> {
  const from = scrollContainer.scrollTop;
  const to = Math.max(0, targetTop);

  if (durationMs <= 0 || Math.abs(to - from) < 1) {
    scrollContainer.scrollTo({ top: to, left: 0, behavior: "auto" });
    return Promise.resolve();
  }

  if (typeof requestAnimationFrame !== "function") {
    scrollContainer.scrollTo({ top: to, left: 0, behavior: "auto" });
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const start =
      typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();

    const tick = (now: number): void => {
      if (signal.aborted) {
        resolve();
        return;
      }
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      scrollContainer.scrollTop = from + (to - from) * easeInOutCubic(t);
      if (t < 1) {
        requestAnimationFrame(tick);
        return;
      }
      scrollContainer.scrollTop = to;
      resolve();
    };

    requestAnimationFrame(tick);
  });
}

/**
 * Wait until `selector` exists under `root` (Studio Ready for that anchor).
 * Resolves immediately if already present. Abort ends the wait.
 * Uses MutationObserver when available; otherwise microtask polling (still state-based).
 */
export function waitForSelector(
  root: ParentNode,
  selector: string,
  signal: AbortSignal,
): Promise<Element> {
  const existing = root.querySelector(selector);
  if (existing) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Reveal aborted", "AbortError"));
      return;
    }

    let settled = false;
    let observer: MutationObserver | null = null;

    const cleanup = (): void => {
      observer?.disconnect();
      signal.removeEventListener("abort", failAbort);
    };

    const finish = (el: Element): void => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(el);
    };

    const failAbort = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(new DOMException("Reveal aborted", "AbortError"));
    };

    const poll = (): void => {
      if (settled) {
        return;
      }
      if (signal.aborted) {
        failAbort();
        return;
      }
      const found = root.querySelector(selector);
      if (found) {
        finish(found);
        return;
      }
      queueMicrotask(poll);
    };

    signal.addEventListener("abort", failAbort);

    if (typeof MutationObserver !== "undefined") {
      observer = new MutationObserver(() => {
        const found = root.querySelector(selector);
        if (found) {
          finish(found);
        }
      });
      observer.observe(root, { childList: true, subtree: true });
    }

    queueMicrotask(poll);
  });
}

/**
 * Scroll Delivery scrollport so `element` sits just below the sticky header.
 * Default: start at Hero (top), then smooth-scroll ~500ms to the Landing Anchor.
 */
export async function settleViewportToElement(
  scrollContainer: HTMLElement,
  element: HTMLElement,
  settleOptions: SettleViewportOptions = {},
): Promise<void> {
  const signal = settleOptions.signal ?? new AbortController().signal;
  const durationMs = settleOptions.durationMs ?? LANDING_REVEAL_DURATION_MS;
  const fromTop = settleOptions.fromTop !== false;

  if (fromTop) {
    scrollContainer.scrollTo({ top: 0, left: 0, behavior: "auto" });
    await waitForNextPaint();
  }

  if (isAborted(signal)) {
    return;
  }

  const headerOffset = readStickyHeaderOffset(scrollContainer);
  const containerRect = scrollContainer.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const nextTop =
    scrollContainer.scrollTop +
    (elementRect.top - containerRect.top) -
    headerOffset;

  await animateScrollTop(scrollContainer, nextTop, durationMs, signal);

  if (typeof element.focus === "function") {
    try {
      element.focus({ preventScroll: true });
    } catch {
      // best-effort
    }
  }
}

/**
 * Run Reveal pipeline to Landing Anchor. Does not touch Runtime semantics.
 */
export async function runRevealEngine(
  options: RevealEngineOptions,
): Promise<RevealEngineResult> {
  if (isAborted(options.signal)) {
    setState(options, "aborted");
    return {
      state: "aborted",
      anchorId: options.modeDefaultLandingAnchorId,
      degraded: true,
    };
  }

  setState(options, "waiting-ready");

  if (!options.runtimeReady) {
    setState(options, "degraded");
    return {
      state: "degraded",
      anchorId: options.modeDefaultLandingAnchorId,
      degraded: true,
    };
  }

  // Studio Ready: Client Studio root is mounted (attribute set synchronously on mount).
  if (!options.studioRoot.hasAttribute("data-client-studio-root")) {
    await waitForSelector(
      options.studioRoot.parentNode ?? options.studioRoot,
      "[data-client-studio-root]",
      options.signal,
    ).catch(() => null);
    if (isAborted(options.signal)) {
      setState(options, "aborted");
      return {
        state: "aborted",
        anchorId: options.modeDefaultLandingAnchorId,
        degraded: true,
      };
    }
  }

  setState(options, "resolving-anchor");

  const resolved = resolveLandingAnchorId({
    configuredId: options.configuredLandingAnchorId,
    modeDefaultId: options.modeDefaultLandingAnchorId,
  });

  const primarySelector = landingAnchorSelector(resolved.elementId);
  let target: Element | null = null;

  try {
    target = await waitForSelector(
      options.studioRoot,
      primarySelector,
      options.signal,
    );
  } catch {
    if (isAborted(options.signal)) {
      setState(options, "aborted");
      return {
        state: "aborted",
        anchorId: resolved.elementId,
        degraded: true,
      };
    }
  }

  if (!target) {
    // Degrade to hero / document start inside Experience surface.
    const hero = options.studioRoot.querySelector("#hero");
    target = hero;
  }

  if (!target || !(target instanceof HTMLElement)) {
    setState(options, "degraded");
    options.scrollContainer.scrollTo({ top: 0, left: 0, behavior: "auto" });
    return {
      state: "degraded",
      anchorId: resolved.elementId,
      degraded: true,
    };
  }

  if (isAborted(options.signal)) {
    setState(options, "aborted");
    return {
      state: "aborted",
      anchorId: resolved.elementId,
      degraded: true,
    };
  }

  setState(options, "revealing");
  await settleViewportToElement(options.scrollContainer, target, {
    signal: options.signal,
    durationMs: LANDING_REVEAL_DURATION_MS,
    fromTop: true,
  });

  if (isAborted(options.signal)) {
    setState(options, "aborted");
    return {
      state: "aborted",
      anchorId: resolved.elementId,
      degraded: true,
    };
  }

  const degraded =
    resolved.usedDefault ||
    target.id !== resolved.elementId;

  setState(options, degraded ? "degraded" : "active");
  options.scrollContainer.dataset.landingAnchorId = target.id || resolved.elementId;
  options.scrollContainer.dataset.viewportReady = "true";

  return {
    state: degraded ? "degraded" : "active",
    anchorId: target.id || resolved.elementId,
    degraded,
  };
}
