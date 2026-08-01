/**
 * EPIC-BX-12 — Manager Studio integration point for Decision Intelligence Core.
 * Architecture ready — not yet wired into Manager UI.
 */

export {
  analyzeViaManagerAdapter,
  createManagerIntelligenceAdapter,
  analyzeProject,
  computeDecisionScore,
  buildRecommendations,
  buildInsights,
  type IntelligenceProjectContext,
  type IntelligenceAnalysis,
  type StudioIntelligenceAdapter,
} from '@embed-engine/intelligence';
