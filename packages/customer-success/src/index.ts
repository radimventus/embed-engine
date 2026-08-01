export type {
  OnboardingStepId,
  OnboardingStepState,
  OnboardingStep,
  CustomerHealthStatus,
  SuccessTimelineEventId,
  SuccessTimelineEvent,
  SuccessRecommendationId,
  SuccessRecommendation,
  CustomerSuccessSnapshotInput,
  CustomerSuccessReport,
} from './domain/types';

export { buildOnboardingJourney } from './engine/buildOnboardingJourney';
export { computeAdoptionScore } from './engine/computeAdoptionScore';
export { evaluateCustomerHealth } from './engine/evaluateCustomerHealth';
export { buildSuccessTimeline } from './engine/buildSuccessTimeline';
export { buildSuccessRecommendations } from './engine/buildSuccessRecommendations';
export { buildCustomerSuccessReport } from './engine/buildCustomerSuccessReport';

export {
  buildCustomerSuccessSnapshot,
  analyzeCustomerSuccess,
} from './adapters/platformCustomerSuccess';
