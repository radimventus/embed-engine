import { useCallback, useEffect, useRef, useState } from "react";
import type { WelcomeBridgeConfig, WelcomeBridgeTrigger } from "@embed-engine/ui";

type UseWelcomeBridgeControllerOptions = {
  readonly config: WelcomeBridgeConfig;
  /** The timer exists only while the Tour is the active Experience state. */
  readonly isTourActive: boolean;
  /** Scene id that represents Priority / interpretation entry. */
  readonly prioritySceneId: string;
  readonly onEnterPriority: (sceneId: string) => void;
};

function hasTrigger(
  triggers: readonly WelcomeBridgeTrigger[],
  kind: WelcomeBridgeTrigger["kind"],
): WelcomeBridgeTrigger | undefined {
  return triggers.find((trigger) => trigger.kind === kind);
}

/**
 * Configurable Welcome Bridge trigger controller.
 * In-memory once-per-mount only — no localStorage / sessionStorage.
 * Each new Experience entry remounts and starts the delay fresh.
 */
export function useWelcomeBridgeController({
  config,
  isTourActive,
  prioritySceneId,
  onEnterPriority,
}: UseWelcomeBridgeControllerOptions) {
  const [open, setOpen] = useState(false);
  const seenRef = useRef(false);

  const markSeenAndClose = useCallback(() => {
    seenRef.current = true;
    setOpen(false);
  }, []);

  const tryOpen = useCallback(() => {
    if (seenRef.current || open) {
      return false;
    }
    setOpen(true);
    return true;
  }, [open]);

  const delayTrigger = hasTrigger(config.triggers, "delay-after-mount");
  useEffect(() => {
    if (delayTrigger === undefined || delayTrigger.kind !== "delay-after-mount") {
      return;
    }
    if (!isTourActive || seenRef.current) {
      return;
    }
    const timer = window.setTimeout(() => {
      tryOpen();
    }, delayTrigger.delayMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [delayTrigger, isTourActive, tryOpen]);

  const continueToPriority = useCallback(() => {
    markSeenAndClose();
    onEnterPriority(prioritySceneId);
  }, [markSeenAndClose, onEnterPriority, prioritySceneId]);

  const dismiss = useCallback(() => {
    markSeenAndClose();
  }, [markSeenAndClose]);

  return {
    open,
    continueToPriority,
    dismiss,
  };
}
