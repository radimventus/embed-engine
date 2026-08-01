export type {
  LearningCategory,
  LearningImpact,
  LearningPriority,
  LearningFeedbackEntry,
  LearningThemeRecommendation,
  ProductInsights,
  RoadmapSuggestion,
  ProductLearningExecutive,
  ProductLearningReport,
} from './domain/types';

export {
  classifyLearningCategory,
  inferCapabilityFromMessage,
} from './engine/classifyLearningFeedback';

export {
  LEARNING_FEEDBACK_STORAGE_KEY,
  listLearningFeedback,
  registerLearningFeedback,
  resetLearningFeedbackRegistry,
  upsertLearningFeedback,
} from './registry/learningFeedbackRegistry';

export { bridgePlatformFeedbackToLearning } from './adapters/bridgePlatformFeedback';
export { buildRecommendationPipeline } from './engine/buildRecommendationPipeline';
export { buildProductLearningReport } from './engine/buildProductLearningReport';
