/**
 * Coalesces high-frequency handlers (resize / scroll) onto one animation frame.
 * RCS-06 — mobile production readiness; no Runtime coupling.
 */
export type FrameScheduler = {
  readonly schedule: () => void;
  readonly cancel: () => void;
};

export function createFrameScheduler(callback: () => void): FrameScheduler {
  let frameId = 0;

  return {
    schedule: () => {
      if (frameId !== 0) {
        return;
      }
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        callback();
      });
    },
    cancel: () => {
      if (frameId === 0) {
        return;
      }
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    },
  };
}
