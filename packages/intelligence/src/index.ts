export type {
  RuleCategory,
  IntelligenceCoachId,
  RecommendationSeverity,
  IntelligenceTarget,
  Recommendation,
  DecisionScore,
  DecisionReadinessGrade,
  DecisionReadinessPillar,
  DecisionReadiness,
  Insight,
  CoachResult,
  Rule,
  IntelligenceCategoryMeta,
  IntelligenceAnalysis,
  KnowledgeHealth,
  IntelligenceKnowledgeCategory,
  IntelligenceExperienceModule,
  IntelligenceFaqItem,
  IntelligencePersona,
  IntelligenceGalleryRow,
  IntelligenceVideoRow,
  IntelligenceProjectContext,
} from './domain/types';

export {
  INTELLIGENCE_CATEGORIES,
  INTELLIGENCE_COACHES,
} from './domain/types';

export {
  createEmptyIntelligenceContext,
  DEFAULT_DECISION_PERSONAS,
  CRITICAL_EXPERIENCE_STEP_IDS,
} from './domain/emptyContext';

export {
  INTELLIGENCE_RULE_REGISTRY,
  getRulesByCategory,
  getRule,
  evaluateCategoryRules,
  evaluateAllRules,
} from './rules/ruleRegistry';

export {
  runRecommendationEngine,
  buildCoachResults,
  gradeForScore,
} from './engine/recommendationEngine';

export {
  analyzeProject,
  computeDecisionScore,
  buildRecommendations,
  buildInsights,
  buildDecisionReadiness,
} from './api/intelligenceApi';

export type {
  StudioIntelligenceId,
  StudioIntelligenceAdapter,
} from './adapters/studioAdapters';

export {
  createBuilderIntelligenceAdapter,
  createManagerIntelligenceAdapter,
  createSalesIntelligenceAdapter,
  analyzeViaBuilderAdapter,
  analyzeViaManagerAdapter,
  analyzeViaSalesAdapter,
} from './adapters/studioAdapters';
