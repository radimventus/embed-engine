import { useCallback, useEffect, useRef, useState } from "react";
import type { WelcomeBridgeConfig, WelcomeBridgeTrigger } from "@embed-engine/ui";

type UseWelcomeBridgeControllerOptions = {
  readonly config: WelcomeBridgeConfig;
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
  prioritySceneId,
  onEnterPriority,
}: UseWelcomeBridgeControllerOptions) {
  const [open, setOpen] = useState(false);
  const seenRef = useRef(false);
  const pendingPriorityRef = useRef(false);

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
    if (seenRef.current) {
      return;
    }
    const timer = window.setTimeout(() => {
      tryOpen();
    }, delayTrigger.delayMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [delayTrigger, tryOpen]);

  const interceptSceneNavigate = useCallback(
    (sceneId: string): boolean => {
      const continueTrigger = hasTrigger(
        config.triggers,
        "on-continue-to-priority",
      );
      if (continueTrigger === undefined) {
        return false;
      }
      if (sceneId !== prioritySceneId) {
        return false;
      }
      if (seenRef.current) {
        return false;
      }
      pendingPriorityRef.current = true;
      tryOpen();
      return true;
    },
    [config.triggers, prioritySceneId, tryOpen],
  );

  const continueToPriority = useCallback(() => {
    markSeenAndClose();
    pendingPriorityRef.current = false;
    onEnterPriority(prioritySceneId);
  }, [markSeenAndClose, onEnterPriority, prioritySceneId]);

  const dismiss = useCallback(() => {
    const shouldEnterPriority = pendingPriorityRef.current;
    markSeenAndClose();
    pendingPriorityRef.current = false;
    if (shouldEnterPriority) {
      onEnterPriority(prioritySceneId);
    }
  }, [markSeenAndClose, onEnterPriority, prioritySceneId]);

  return {
    open,
    interceptSceneNavigate,
    continueToPriority,
    dismiss,
  };
}
