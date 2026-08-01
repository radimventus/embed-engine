/**
 * EPIC-BX-12 — Public Intelligence API (platform-wide).
 */

import type {
  DecisionReadiness,
  DecisionScore,
  Insight,
  IntelligenceAnalysis,
  IntelligenceProjectContext,
  Recommendation,
} from '../domain/types';
import {
  buildInsights as engineBuildInsights,
  buildRecommendations as engineBuildRecommendations,
  computeDecisionReadiness as engineComputeDecisionReadiness,
  computeDecisionScore as engineComputeDecisionScore,
  runRecommendationEngine,
} from '../engine/recommendationEngine';

/** Full project analysis — coaches, readiness, recommendations, insights. */
export function analyzeProject(
  context: IntelligenceProjectContext,
): IntelligenceAnalysis {
  return runRecommendationEngine(context);
}

export function computeDecisionScore(
  context: IntelligenceProjectContext,
): DecisionScore {
  return engineComputeDecisionScore(context);
}

export function buildRecommendations(
  context: IntelligenceProjectContext,
): readonly Recommendation[] {
  return engineBuildRecommendations(context);
}

export function buildInsights(
  context: IntelligenceProjectContext,
): readonly Insight[] {
  return engineBuildInsights(context);
}

export function buildDecisionReadiness(
  context: IntelligenceProjectContext,
): DecisionReadiness {
  return engineComputeDecisionReadiness(context);
}
