/**
 * EPIC-BX-12 — Sales Studio integration point for Decision Intelligence Core.
 * Architecture ready — not yet wired into Sales product surface.
 */

export {
  analyzeViaSalesAdapter,
  createSalesIntelligenceAdapter,
  analyzeProject,
  computeDecisionScore,
  buildRecommendations,
  buildInsights,
  type IntelligenceProjectContext,
  type IntelligenceAnalysis,
  type StudioIntelligenceAdapter,
} from '@embed-engine/intelligence';
