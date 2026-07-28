/**
 * Reveal Engine — Delivery-owned viewport settle after Experience readiness
 * (LRI-01 / ADR-014 / PT-BOOTSTRAP-READY-01).
 *
 * Waits only on EXPERIENCE_READY (lifecycle bus). Never polls the DOM.
 * Optional one-shot Landing Anchor settle is presentation only — not a sync gate.
 */
/** Static Hero hold before landing roll (CAP UX3 08) — 0,5 s statický obrázek. */
export declare const LANDING_STATIC_HOLD_MS = 500;
/** Linear landing roll after hold — lands ~1 s from ready (CAP UX3 08). */
export declare const LANDING_REVEAL_DURATION_MS = 500;
export type RevealState = "idle" | "waiting-ready" | "resolving-anchor" | "revealing" | "active" | "degraded" | "aborted";
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
/**
 * Sticky Experience header height inside the Delivery scrollport.
 * Landing Anchor settle subtracts this so content sits just below the header.
 */
export declare function readStickyHeaderOffset(scrollContainer: HTMLElement): number;
/**
 * Animate `scrollTop` with linear tempo (CAP UX3 08).
 * Forces scroll-behavior:auto so CSS smooth cannot re-ease each frame.
 */
export declare function animateScrollTop(scrollContainer: HTMLElement, targetTop: number, durationMs: number, signal: AbortSignal): Promise<void>;
/**
 * Scroll Delivery scrollport so `element` sits flush under the sticky header.
 * Default: Hero static hold → linear roll to Landing Anchor (CAP UX3 08).
 */
export declare function settleViewportToElement(scrollContainer: HTMLElement, element: HTMLElement, settleOptions?: SettleViewportOptions): Promise<void>;
/**
 * Run Reveal after EXPERIENCE_READY. Does not touch Runtime semantics.
 * Does not poll the DOM or busy-loop microtasks.
 */
export declare function runRevealEngine(options: RevealEngineOptions): Promise<RevealEngineResult>;
//# sourceMappingURL=revealEngine.d.ts.map