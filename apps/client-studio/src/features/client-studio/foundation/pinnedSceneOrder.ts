import { PILOT_SECTION_IDS } from "../pilot/pilotVocabulary";
import type { ProgressiveNavigationDirection } from "./useProgressiveScrollUnlock";

export type PinnedSceneTarget = {
  readonly activeSceneId: string;
  readonly scrollTargetId: string;
  readonly scrollOffsetPx: number;
};

type ResolvePinnedSceneTargetOptions = {
  readonly direction: ProgressiveNavigationDirection;
  readonly activeSceneId: string;
  readonly orientationSceneId: string;
  readonly sceneIds: readonly string[];
  readonly orientationStop: "hero" | "tour";
};

/**
 * Canonical pinned order. HERO and TOUR are separate navigation stops even
 * though their approved visual composition shares one progressive DOM scene.
 */
export function resolvePinnedSceneTarget({
  direction,
  activeSceneId,
  orientationSceneId,
  sceneIds,
  orientationStop,
}: ResolvePinnedSceneTargetOptions): PinnedSceneTarget | null {
  if (activeSceneId === orientationSceneId) {
    if (direction === "forward" && orientationStop === "hero") {
      return {
        activeSceneId: orientationSceneId,
        scrollTargetId: PILOT_SECTION_IDS.socialProof,
        scrollOffsetPx: 20,
      };
    }
    if (direction === "backward" && orientationStop === "tour") {
      return {
        activeSceneId: orientationSceneId,
        scrollTargetId: PILOT_SECTION_IDS.hero,
        scrollOffsetPx: 0,
      };
    }
  }

  const activeIndex = sceneIds.indexOf(activeSceneId);
  const targetIndex = activeIndex + (direction === "forward" ? 1 : -1);
  const targetSceneId = sceneIds[targetIndex];
  if (targetSceneId === undefined) return null;

  if (direction === "backward" && targetSceneId === orientationSceneId) {
    return {
      activeSceneId: orientationSceneId,
      scrollTargetId: PILOT_SECTION_IDS.socialProof,
      scrollOffsetPx: 20,
    };
  }
  return {
    activeSceneId: targetSceneId,
    scrollTargetId: targetSceneId,
    scrollOffsetPx: 0,
  };
}
