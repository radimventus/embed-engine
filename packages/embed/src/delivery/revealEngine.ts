/**
 * Reveal Engine — Delivery-owned viewport settle after Experience readiness
 * (LRI-01 / ADR-014 / PT-BOOTSTRAP-READY-01).
 *
 * Waits only on EXPERIENCE_READY (lifecycle bus). Never polls the DOM.
 * Optional one-shot Landing Anchor settle is presentation only — not a sync gate.
 */

import { bootstrapEvents } from "@client-studio/bootstrap-events";

import {
  landingAnchorSelector,
  resolveLandingAnchorId,
} from "./landingAnchorResolver";

/** Static Hero hold before landing roll (CAP UX3 08) — 0,5 s statický obrázek. */
export const LANDING_STATIC_HOLD_MS = 500;
/** Linear landing roll after hold — lands ~1 s from ready (CAP UX3 08). */
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
  /** Static hold at Hero before rolling (default LANDING_STATIC_HOLD_MS). */
  readonly staticHoldMs?: number;
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

function waitMs(ms: number, signal: AbortSignal): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const timer = setTimeout(() => resolve(), ms);
    const onAbort = (): void => {
      clearTimeout(timer);
      resolve();
    };
    signal.addEventListener("abort", onAbort, { once: true });
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
 * Animate `scrollTop` with linear tempo (CAP UX3 08).
 * Forces scroll-behavior:auto so CSS smooth cannot re-ease each frame.
 */
export function animateScrollTop(
  scrollContainer: HTMLElement,
  targetTop: number,
  durationMs: number,
  signal: AbortSignal,
): Promise<void> {
  const from = scrollContainer.scrollTop;
  const to = Math.max(0, targetTop);
  const previousBehavior = scrollContainer.style.scrollBehavior;
  const previousPadding = scrollContainer.style.scrollPaddingTop;
  scrollContainer.style.scrollBehavior = "auto";
  scrollContainer.style.scrollPaddingTop = "0px";

  const restore = (): void => {
    scrollContainer.style.scrollBehavior = previousBehavior;
    scrollContainer.style.scrollPaddingTop = previousPadding;
  };

  if (durationMs <= 0 || Math.abs(to - from) < 1) {
    scrollContainer.scrollTo({ top: to, left: 0, behavior: "auto" });
    restore();
    return Promise.resolve();
  }

  if (typeof requestAnimationFrame !== "function") {
    scrollContainer.scrollTo({ top: to, left: 0, behavior: "auto" });
    restore();
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const start =
      typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();

    const tick = (now: number): void => {
      if (signal.aborted) {
        restore();
        resolve();
        return;
      }
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      // Linear — ease-in-out felt stuck then rushed (CAP UX3 08).
      scrollContainer.scrollTop = from + (to - from) * t;
      if (t < 1) {
        requestAnimationFrame(tick);
        return;
      }
      scrollContainer.scrollTop = to;
      restore();
      resolve();
    };

    requestAnimationFrame(tick);
  });
}

/**
 * Scroll Delivery scrollport so `element` sits flush under the sticky header.
 * Default: Hero static hold → linear roll to Landing Anchor (CAP UX3 08).
 */
export async function settleViewportToElement(
  scrollContainer: HTMLElement,
  element: HTMLElement,
  settleOptions: SettleViewportOptions = {},
): Promise<void> {
  const signal = settleOptions.signal ?? new AbortController().signal;
  const durationMs = settleOptions.durationMs ?? LANDING_REVEAL_DURATION_MS;
  const staticHoldMs = settleOptions.staticHoldMs ?? LANDING_STATIC_HOLD_MS;
  const fromTop = settleOptions.fromTop !== false;

  if (fromTop) {
    scrollContainer.style.scrollBehavior = "auto";
    scrollContainer.scrollTo({ top: 0, left: 0, behavior: "auto" });
    await waitForNextPaint();
  }

  if (isAborted(signal)) {
    return;
  }

  // Static Hero first (0.5 s), then linear roll — Social Proof flush under header.
  await waitMs(staticHoldMs, signal);

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
 * One-shot query for a settle target after Experience is ready.
 * Never waits — missing nodes degrade to scroll-top.
 */
function resolveSettleTarget(
  studioRoot: HTMLElement,
  configuredLandingAnchorId: string,
  modeDefaultLandingAnchorId: string,
): { readonly element: HTMLElement | null; readonly anchorId: string; readonly usedDefault: boolean } {
  const resolved = resolveLandingAnchorId({
    configuredId: configuredLandingAnchorId,
    modeDefaultId: modeDefaultLandingAnchorId,
  });
  const primary = studioRoot.querySelector(
    landingAnchorSelector(resolved.elementId),
  );
  if (primary instanceof HTMLElement) {
    return {
      element: primary,
      anchorId: primary.id || resolved.elementId,
      usedDefault: resolved.usedDefault,
    };
  }
  const hero = studioRoot.querySelector("#hero");
  if (hero instanceof HTMLElement) {
    return {
      element: hero,
      anchorId: resolved.elementId,
      usedDefault: true,
    };
  }
  return {
    element: null,
    anchorId: resolved.elementId,
    usedDefault: true,
  };
}

/**
 * Run Reveal after EXPERIENCE_READY. Does not touch Runtime semantics.
 * Does not poll the DOM or busy-loop microtasks.
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

  try {
    await bootstrapEvents.waitFor("EXPERIENCE_READY", options.signal);
  } catch {
    setState(options, "aborted");
    return {
      state: "aborted",
      anchorId: options.modeDefaultLandingAnchorId,
      degraded: true,
    };
  }

  if (isAborted(options.signal)) {
    setState(options, "aborted");
    return {
      state: "aborted",
      anchorId: options.modeDefaultLandingAnchorId,
      degraded: true,
    };
  }

  setState(options, "resolving-anchor");
  const settle = resolveSettleTarget(
    options.studioRoot,
    options.configuredLandingAnchorId,
    options.modeDefaultLandingAnchorId,
  );

  if (settle.element === null) {
    setState(options, "degraded");
    options.scrollContainer.scrollTo({ top: 0, left: 0, behavior: "auto" });
    bootstrapEvents.emit("REVEAL_READY");
    options.scrollContainer.dataset.viewportReady = "true";
    options.scrollContainer.dataset.landingAnchorId = settle.anchorId;
    return {
      state: "degraded",
      anchorId: settle.anchorId,
      degraded: true,
    };
  }

  if (isAborted(options.signal)) {
    setState(options, "aborted");
    return {
      state: "aborted",
      anchorId: settle.anchorId,
      degraded: true,
    };
  }

  setState(options, "revealing");
  await settleViewportToElement(options.scrollContainer, settle.element, {
    signal: options.signal,
    durationMs: LANDING_REVEAL_DURATION_MS,
    fromTop: true,
  });

  if (isAborted(options.signal)) {
    setState(options, "aborted");
    return {
      state: "aborted",
      anchorId: settle.anchorId,
      degraded: true,
    };
  }

  const degraded =
    settle.usedDefault || settle.element.id !== settle.anchorId;

  setState(options, degraded ? "degraded" : "active");
  options.scrollContainer.dataset.landingAnchorId = settle.anchorId;
  options.scrollContainer.dataset.viewportReady = "true";
  bootstrapEvents.emit("REVEAL_READY");

  return {
    state: degraded ? "degraded" : "active",
    anchorId: settle.anchorId,
    degraded,
  };
}
