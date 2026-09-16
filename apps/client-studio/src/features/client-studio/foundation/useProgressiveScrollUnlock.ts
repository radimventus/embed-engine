import { useEffect, useRef } from "react";

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
    return { state: { accumulatedPx: 0, lockedUntilIdle: true }, unlock: false };
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

type UseProgressiveScrollUnlockOptions = {
  readonly enabled: boolean;
  readonly currentSceneId: string;
  readonly progressKey: string | number;
  readonly onUnlockNext: () => void;
  readonly thresholdPx?: number;
};

function scrollRoot(): HTMLElement | Window {
  return (
    document.querySelector<HTMLElement>("[data-embed-overlay-mount]") ??
    window
  );
}

function currentSceneBoundary(sceneId: string): HTMLElement | null {
  return (
    Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-journey-navigation-boundary]",
      ),
    ).find(
      (element) => element.dataset.journeyNavigationBoundary === sceneId,
    ) ?? document.getElementById(sceneId)
  );
}

function isAtCurrentSceneBoundary(
  root: HTMLElement | Window,
  sceneId: string,
): boolean {
  const boundary = currentSceneBoundary(sceneId);
  if (boundary === null) return false;
  const viewportBottom =
    root instanceof HTMLElement
      ? root.getBoundingClientRect().bottom
      : window.innerHeight;
  return boundary.getBoundingClientRect().bottom <=
    viewportBottom + BOTTOM_TOLERANCE_PX;
}

function nestedScrollerCanContinue(
  target: EventTarget | null,
  root: HTMLElement | Window,
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
    if (
      scrollable &&
      element.scrollTop + element.clientHeight <
        element.scrollHeight - BOTTOM_TOLERANCE_PX
    ) {
      return true;
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
    return event.deltaY *
      (root instanceof HTMLElement ? root.clientHeight : window.innerHeight);
  }
  return event.deltaY;
}

/**
 * Reveals one more journey scene only when downward input continues at the
 * bottom of all currently revealed content. It never scrolls the viewport.
 */
export function useProgressiveScrollUnlock({
  enabled,
  currentSceneId,
  progressKey,
  onUnlockNext,
  thresholdPx = PROGRESSIVE_SCROLL_UNLOCK_THRESHOLD_PX,
}: UseProgressiveScrollUnlockOptions): void {
  const intentRef = useRef<ProgressiveScrollIntentState>(EMPTY_SCROLL_INTENT);
  const previousProgressKeyRef = useRef(progressKey);
  const touchYRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const unlockRef = useRef(onUnlockNext);
  unlockRef.current = onUnlockNext;

  useEffect(() => {
    if (!enabled) {
      intentRef.current = EMPTY_SCROLL_INTENT;
      return;
    }

    const root = scrollRoot();
    const eventTarget: EventTarget = root;
    const progressChanged = previousProgressKeyRef.current !== progressKey;
    previousProgressKeyRef.current = progressKey;

    const clearIdleTimer = () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
    const resetIntent = () => {
      intentRef.current = EMPTY_SCROLL_INTENT;
      clearIdleTimer();
    };
    const releaseAfterIdle = () => {
      clearIdleTimer();
      idleTimerRef.current = window.setTimeout(() => {
        intentRef.current = EMPTY_SCROLL_INTENT;
        idleTimerRef.current = null;
      }, INTENT_IDLE_RESET_MS);
    };
    if (progressChanged) {
      intentRef.current = lockScrollIntentUntilIdle();
      releaseAfterIdle();
    }
    const addIntent = (deltaPx: number, target: EventTarget | null) => {
      if (deltaPx <= 0) {
        intentRef.current = lockScrollIntentUntilIdle();
        releaseAfterIdle();
        return;
      }
      if (intentRef.current.lockedUntilIdle) {
        releaseAfterIdle();
        return;
      }
      if (
        !isAtCurrentSceneBoundary(root, currentSceneId) ||
        nestedScrollerCanContinue(target, root)
      ) {
        resetIntent();
        return;
      }

      const result = applyScrollIntent(intentRef.current, deltaPx, thresholdPx);
      intentRef.current = result.state;
      clearIdleTimer();
      if (result.unlock) {
        releaseAfterIdle();
        unlockRef.current();
        return;
      }
      idleTimerRef.current = window.setTimeout(
        resetIntent,
        INTENT_IDLE_RESET_MS,
      );
    };

    const onWheel = (event: WheelEvent) => {
      addIntent(wheelDeltaPx(event, root), event.target);
    };
    const onTouchStart = (event: TouchEvent) => {
      touchYRef.current = event.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY ?? null;
      const previousY = touchYRef.current;
      touchYRef.current = currentY;
      if (currentY !== null && previousY !== null) {
        addIntent(touchDownwardDeltaPx(previousY, currentY), event.target);
      }
    };
    const onTouchEnd = () => {
      touchYRef.current = null;
      resetIntent();
    };

    eventTarget.addEventListener("wheel", onWheel as EventListener, { passive: true });
    eventTarget.addEventListener("touchstart", onTouchStart as EventListener, { passive: true });
    eventTarget.addEventListener("touchmove", onTouchMove as EventListener, { passive: true });
    eventTarget.addEventListener("touchend", onTouchEnd as EventListener, { passive: true });
    eventTarget.addEventListener("touchcancel", onTouchEnd as EventListener, { passive: true });

    return () => {
      clearIdleTimer();
      eventTarget.removeEventListener("wheel", onWheel as EventListener);
      eventTarget.removeEventListener("touchstart", onTouchStart as EventListener);
      eventTarget.removeEventListener("touchmove", onTouchMove as EventListener);
      eventTarget.removeEventListener("touchend", onTouchEnd as EventListener);
      eventTarget.removeEventListener("touchcancel", onTouchEnd as EventListener);
    };
  }, [currentSceneId, enabled, progressKey, thresholdPx]);
}
