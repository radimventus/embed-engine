export { ChapterSpacer } from "./ChapterSpacer";
export { GuidedJourneyRoot } from "./GuidedJourneyRoot";
export { JourneySceneFrame } from "./JourneySceneFrame";
export {
  JOURNEY_CTA_FOOTER_ROW_CLASS,
  JOURNEY_CTA_PRIMARY_CLASS,
  JOURNEY_CTA_SECONDARY_CLASS,
} from "./journeyCta";
export {
  canonicalSectionTarget,
  isDecisionSection,
  isOrientationSection,
  isPrioritySection,
  isRacioSection,
  navigateToJourneySection,
  registerJourneySectionNavigator,
} from "./journeyNavigation";
export type { CanonicalSectionTarget } from "./journeyNavigation";
export { RuntimeBootstrapGate } from "./RuntimeBootstrapGate";
export { decisionJourneyScenes } from "./decisionJourney";
export { resolvePinnedSceneTarget } from "./pinnedSceneOrder";
export type { PinnedSceneTarget } from "./pinnedSceneOrder";
export {
  CANONICAL_SCROLL_MAX_DURATION_MS,
  CANONICAL_SCROLL_MIN_DURATION_MS,
  HERO_TOUR_REFERENCE_DISTANCE_PX,
  HERO_TOUR_REFERENCE_DURATION_MS,
  PRIORITY_BRIDGE_ANCHOR_ID,
  canonicalScrollDurationMs,
  canonicalScrollProgress,
  heroTourScrollDurationMs,
  isSectionAtScrollAnchor,
  markPinnedNavigationTiming,
  isSectionScrollReady,
  scrollElementIntoView,
  scrollToSection,
  sectionScrollDurationMs,
} from "./scrollToSection";
export type { ScrollToSectionOptions } from "./scrollToSection";
export { StudioLoading } from "./StudioLoading";
export { useActiveSection } from "./useActiveSection";
export {
  EMPTY_DIRECTIONAL_INTENT,
  PROGRESSIVE_SCROLL_UNLOCK_THRESHOLD_PX,
  applyDirectionalIntent,
  applyScrollIntent,
  accumulateScrollIntent,
  hasReachedNavigationBoundary,
  hasReachedSceneStart,
  lockScrollIntentUntilIdle,
  nextProgressiveSceneId,
  previousProgressiveSceneId,
  touchDownwardDeltaPx,
  useProgressiveScrollUnlock,
} from "./useProgressiveScrollUnlock";
export type {
  DirectionalIntentState,
  ProgressiveNavigationDirection,
} from "./useProgressiveScrollUnlock";
export { createFrameScheduler } from "./scheduleOnAnimationFrame";
export {
  PRODUCTION_VALIDATION_WIDTHS_PX,
  resolveValidationBand,
} from "./productionValidation";
export {
  VIEWPORT_BREAKPOINTS,
  matchViewportBand,
  resolveViewportBand,
} from "./responsiveLayout";
