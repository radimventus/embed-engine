import { useEffect, useRef } from "react";

import { markPinnedNavigationTiming } from "./scrollToSection";

/** Product-tunable input distance; not part of the public UX contract. */
export const PROGRESSIVE_SCROLL_UNLOCK_THRESHOLD_PX = 160;

const BOTTOM_TOLERANCE_PX = 2;
const INTENT_IDLE_RESET_MS = 450;

export type ScrollIntentResult = {
  readonly accumulatedPx: number;
  readonly thresholdReached: boolean;
};

export type ProgressiveScrollIntentState = {
  readonly accumulatedPx: number;
  readonly lockedUntilIdle: boolean;
};

export const EMPTY_SCROLL_INTENT: ProgressiveScrollIntentState = {
  accumulatedPx: 0,
  lockedUntilIdle: false,
};

export function accumulateScrollIntent(
  accumulatedPx: number,
  downwardDeltaPx: number,
  thresholdPx = PROGRESSIVE_SCROLL_UNLOCK_THRESHOLD_PX,
): ScrollIntentResult {
  const next = Math.max(0, accumulatedPx) + Math.max(0, downwardDeltaPx);
  return next >= thresholdPx
    ? { accumulatedPx: 0, thresholdReached: true }
    : { accumulatedPx: next, thresholdReached: false };
}

export function applyScrollIntent(
  state: ProgressiveScrollIntentState,
  downwardDeltaPx: number,
  thresholdPx = PROGRESSIVE_SCROLL_UNLOCK_THRESHOLD_PX,
): { readonly state: ProgressiveScrollIntentState; readonly unlock: boolean } {
  if (state.lockedUntilIdle) {
    return {
      state: { accumulatedPx: 0, lockedUntilIdle: true },
      unlock: false,
    };
  }
  const result = accumulateScrollIntent(
    state.accumulatedPx,
    downwardDeltaPx,
    thresholdPx,
  );
  return result.thresholdReached
    ? { state: { accumulatedPx: 0, lockedUntilIdle: true }, unlock: true }
    : {
        state: {
          accumulatedPx: result.accumulatedPx,
          lockedUntilIdle: false,
        },
        unlock: false,
      };
}

export function lockScrollIntentUntilIdle(): ProgressiveScrollIntentState {
  return { accumulatedPx: 0, lockedUntilIdle: true };
}

export function touchDownwardDeltaPx(
  previousClientY: number,
  currentClientY: number,
): number {
  return previousClientY - currentClientY;
}

export function nextProgressiveSceneId(
  sceneIds: readonly string[],
  currentSceneId: string | null,
): string | null {
  const currentIndex =
    currentSceneId === null ? -1 : sceneIds.indexOf(currentSceneId);
  return currentIndex >= 0 ? (sceneIds[currentIndex + 1] ?? null) : null;
}

export type ProgressiveNavigationDirection = "forward" | "backward";

export type DirectionalIntentState = {
  readonly direction: ProgressiveNavigationDirection | null;
  readonly accumulatedPx: number;
};

export const EMPTY_DIRECTIONAL_INTENT: DirectionalIntentState = {
  direction: null,
  accumulatedPx: 0,
};

export function applyDirectionalIntent(
  state: DirectionalIntentState,
  signedDeltaPx: number,
  thresholdPx = PROGRESSIVE_SCROLL_UNLOCK_THRESHOLD_PX,
): {
  readonly state: DirectionalIntentState;
  readonly transition: ProgressiveNavigationDirection | null;
} {
  if (signedDeltaPx === 0) {
    return { state, transition: null };
  }
  const direction = signedDeltaPx > 0 ? "forward" : "backward";
  const accumulatedPx =
    (state.direction === direction ? state.accumulatedPx : 0) +
    Math.abs(signedDeltaPx);
  return accumulatedPx >= thresholdPx
    ? { state: EMPTY_DIRECTIONAL_INTENT, transition: direction }
    : { state: { direction, accumulatedPx }, transition: null };
}

export function previousProgressiveSceneId(
  sceneIds: readonly string[],
  currentSceneId: string | null,
): string | null {
  const currentIndex =
    currentSceneId === null ? -1 : sceneIds.indexOf(currentSceneId);
  return currentIndex > 0 ? (sceneIds[currentIndex - 1] ?? null) : null;
}

type UseProgressiveScrollUnlockOptions = {
  readonly navigationBlocked: boolean;
  readonly canNavigateForward: boolean;
  readonly canNavigateBackward: boolean;
  readonly currentSceneStartId: string;
  readonly currentSceneBoundaryId: string;
  readonly currentSceneScrollOffsetPx: number;
  readonly progressKey: string | number;
  readonly onNavigate: (direction: ProgressiveNavigationDirection) => void;
  readonly thresholdPx?: number;
};

function scrollRoot(): HTMLElement | Window {
  return (
    document.querySelector<HTMLElement>("[data-embed-overlay-mount]") ?? window
  );
}

function currentSceneBoundary(boundaryId: string): HTMLElement | null {
  return (
    Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-journey-navigation-boundary]",
      ),
    ).find(
      (element) => element.dataset.journeyNavigationBoundary === boundaryId,
    ) ?? document.getElementById(boundaryId)
  );
}

function isAtCurrentSceneBoundary(
  root: HTMLElement | Window,
  boundaryId: string,
): boolean {
  const boundary = currentSceneBoundary(boundaryId);
  if (boundary === null) return false;
  const viewportBottom =
    root instanceof HTMLElement
      ? root.getBoundingClientRect().bottom
      : window.innerHeight;
  return hasReachedNavigationBoundary(
    boundary.getBoundingClientRect().bottom,
    viewportBottom,
  );
}

function headerOffsetPx(): number {
  const header = document.querySelector<HTMLElement>(
    "[data-experience-header]",
  );
  return (header?.getBoundingClientRect().height ?? 72) + 20;
}

function isAtCurrentSceneStart(
  root: HTMLElement | Window,
  startId: string,
  scrollOffsetPx: number,
): boolean {
  const scene = document.getElementById(startId);
  if (scene === null) return false;
  const viewportTop =
    root instanceof HTMLElement ? root.getBoundingClientRect().top : 0;
  return hasReachedSceneStart(
    scene.getBoundingClientRect().top,
    viewportTop,
    headerOffsetPx() - scrollOffsetPx,
  );
}

export function hasReachedSceneStart(
  sceneTopPx: number,
  viewportTopPx: number,
  headerOffset: number,
  tolerancePx = BOTTOM_TOLERANCE_PX,
): boolean {
  return sceneTopPx >= viewportTopPx + headerOffset - tolerancePx;
}

export function hasReachedNavigationBoundary(
  boundaryBottomPx: number,
  viewportBottomPx: number,
  tolerancePx = BOTTOM_TOLERANCE_PX,
): boolean {
  return boundaryBottomPx <= viewportBottomPx + tolerancePx;
}

function nestedScrollerCanContinue(
  target: EventTarget | null,
  root: HTMLElement | Window,
  direction: ProgressiveNavigationDirection,
): boolean {
  let element = target instanceof HTMLElement ? target : null;

  while (
    element !== null &&
    element !== root &&
    element !== document.body &&
    element !== document.documentElement
  ) {
    const overflowY = window.getComputedStyle(element).overflowY;
    const scrollable = overflowY === "auto" || overflowY === "scroll";
    if (scrollable) {
      if (
        direction === "forward" &&
        element.scrollTop + element.clientHeight <
          element.scrollHeight - BOTTOM_TOLERANCE_PX
      )
        return true;
      if (direction === "backward" && element.scrollTop > BOTTOM_TOLERANCE_PX) {
        return true;
      }
    }
    element = element.parentElement;
  }

  return false;
}

function wheelDeltaPx(event: WheelEvent, root: HTMLElement | Window): number {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return event.deltaY * 16;
  }
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return (
      event.deltaY *
      (root instanceof HTMLElement ? root.clientHeight : window.innerHeight)
    );
  }
  return event.deltaY;
}

/** Accumulates pinned navigation intent only beyond the scene reading bounds. */
export function useProgressiveScrollUnlock({
  navigationBlocked,
  canNavigateForward,
  canNavigateBackward,
  currentSceneStartId,
  currentSceneBoundaryId,
  currentSceneScrollOffsetPx,
  progressKey,
  onNavigate,
  thresholdPx = PROGRESSIVE_SCROLL_UNLOCK_THRESHOLD_PX,
}: UseProgressiveScrollUnlockOptions): void {
  const intentRef = useRef<DirectionalIntentState>(EMPTY_DIRECTIONAL_INTENT);
  const touchYRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const navigateRef = useRef(onNavigate);
  const gestureConsumedRef = useRef(false);
  const lastWheelAtRef = useRef(-Infinity);
  navigateRef.current = onNavigate;

  useEffect(() => {
    intentRef.current = EMPTY_DIRECTIONAL_INTENT;
    if (navigationBlocked) gestureConsumedRef.current = true;

    const root = scrollRoot();
    const eventTarget: EventTarget = root;

    const clearIdleTimer = () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
    const resetIntent = () => {
      intentRef.current = EMPTY_DIRECTIONAL_INTENT;
      clearIdleTimer();
    };
    const addIntent = (
      signedDeltaPx: number,
      target: EventTarget | null,
    ): boolean => {
      if (signedDeltaPx === 0) return false;
      if (navigationBlocked || gestureConsumedRef.current) return false;
      const direction = signedDeltaPx > 0 ? "forward" : "backward";
      const available =
        direction === "forward" ? canNavigateForward : canNavigateBackward;
      const atReadingBoundary =
        direction === "forward"
          ? isAtCurrentSceneBoundary(root, currentSceneBoundaryId)
          : isAtCurrentSceneStart(
              root,
              currentSceneStartId,
              currentSceneScrollOffsetPx,
            );
      if (
        !available ||
        !atReadingBoundary ||
        nestedScrollerCanContinue(target, root, direction)
      ) {
        resetIntent();
        return false;
      }

      const result = applyDirectionalIntent(
        intentRef.current,
        signedDeltaPx,
        thresholdPx,
      );
      intentRef.current = result.state;
      clearIdleTimer();
      if (result.transition !== null) {
        resetIntent();
        gestureConsumedRef.current = true;
        markPinnedNavigationTiming("threshold");
        navigateRef.current(result.transition);
        return true;
      }
      idleTimerRef.current = window.setTimeout(
        resetIntent,
        INTENT_IDLE_RESET_MS,
      );
      return true;
    };

    const onWheel = (event: WheelEvent) => {
      const now = performance.now();
      if (now - lastWheelAtRef.current > INTENT_IDLE_RESET_MS) {
        gestureConsumedRef.current = false;
        resetIntent();
      }
      lastWheelAtRef.current = now;
      if (navigationBlocked) gestureConsumedRef.current = true;
      if (addIntent(wheelDeltaPx(event, root), event.target)) {
        event.preventDefault();
      }
    };
    const onTouchStart = (event: TouchEvent) => {
      gestureConsumedRef.current = navigationBlocked;
      resetIntent();
      touchYRef.current = event.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY ?? null;
      const previousY = touchYRef.current;
      touchYRef.current = currentY;
      if (currentY !== null && previousY !== null) {
        if (
          addIntent(touchDownwardDeltaPx(previousY, currentY), event.target)
        ) {
          event.preventDefault();
        }
      }
    };
    const onTouchEnd = () => {
      touchYRef.current = null;
      resetIntent();
    };

    eventTarget.addEventListener("wheel", onWheel as EventListener, {
      passive: false,
    });
    eventTarget.addEventListener("touchstart", onTouchStart as EventListener, {
      passive: true,
    });
    eventTarget.addEventListener("touchmove", onTouchMove as EventListener, {
      passive: false,
    });
    eventTarget.addEventListener("touchend", onTouchEnd as EventListener, {
      passive: true,
    });
    eventTarget.addEventListener("touchcancel", onTouchEnd as EventListener, {
      passive: true,
    });

    return () => {
      clearIdleTimer();
      eventTarget.removeEventListener("wheel", onWheel as EventListener);
      eventTarget.removeEventListener(
        "touchstart",
        onTouchStart as EventListener,
      );
      eventTarget.removeEventListener(
        "touchmove",
        onTouchMove as EventListener,
      );
      eventTarget.removeEventListener("touchend", onTouchEnd as EventListener);
      eventTarget.removeEventListener(
        "touchcancel",
        onTouchEnd as EventListener,
      );
    };
  }, [
    canNavigateBackward,
    canNavigateForward,
    currentSceneBoundaryId,
    currentSceneScrollOffsetPx,
    currentSceneStartId,
    navigationBlocked,
    progressKey,
    thresholdPx,
  ]);
}
