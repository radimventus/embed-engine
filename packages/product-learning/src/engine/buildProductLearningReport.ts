/**
 * EPIC-BX-20 — Product Learning report (insights, roadmap suggestions, executive).
 */

import { findCompany, getDefaultCompanyRegistry } from '@embed-engine/platform-access';
import type { CapabilityId } from '@embed-engine/capabilities';
import type { PlatformStudioId } from '@embed-engine/platform-access';

import { bridgePlatformFeedbackToLearning } from '../adapters/bridgePlatformFeedback';
import type {
  LearningCategory,
  LearningImpact,
  ProductInsights,
  ProductLearningExecutive,
  ProductLearningReport,
  RoadmapSuggestion,
} from '../domain/types';
import { buildRecommendationPipeline } from './buildRecommendationPipeline';
import { listLearningFeedback } from '../registry/learningFeedbackRegistry';

function buildInsights(
  entries: ProductLearningReport['entries'],
  recommendations: ProductLearningReport['recommendations'],
): ProductInsights {
  const registry = getDefaultCompanyRegistry();
  const capabilityCounts = new Map<CapabilityId, number>();
  const studioCounts = new Map<PlatformStudioId, number>();
  const companyCounts = new Map<
    string,
    { count: number; categories: Map<LearningCategory, number> }
  >();

  for (const entry of entries) {
    if (entry.capabilityId !== null) {
      capabilityCounts.set(
        entry.capabilityId,
        (capabilityCounts.get(entry.capabilityId) ?? 0) + 1,
      );
    }
    if (entry.studioId !== null) {
      studioCounts.set(
        entry.studioId,
        (studioCounts.get(entry.studioId) ?? 0) + 1,
      );
    }
    const company = companyCounts.get(entry.companyId) ?? {
      count: 0,
      categories: new Map(),
    };
    company.count += 1;
    company.categories.set(
      entry.category,
      (company.categories.get(entry.category) ?? 0) + 1,
    );
    companyCounts.set(entry.companyId, company);
  }

  const capabilitiesAffected = [...capabilityCounts.entries()]
    .map(([capabilityId, count]) => ({ capabilityId, count }))
    .sort((a, b) => b.count - a.count);

  const studiosAffected = [...studioCounts.entries()]
    .map(([studioId, count]) => ({ studioId, count }))
    .sort((a, b) => b.count - a.count);

  const pilotTrends = [...companyCounts.entries()]
    .map(([companyId, data]) => {
      let topCategory: LearningCategory | null = null;
      let topCount = 0;
      for (const [category, count] of data.categories) {
        if (count > topCount) {
          topCount = count;
          topCategory = category;
        }
      }
      return {
        companyId,
        companyName: findCompany(registry, companyId)?.name ?? companyId,
        count: data.count,
        topCategory,
      };
    })
    .sort((a, b) => b.count - a.count);

  return {
    topThemes: recommendations.slice(0, 8),
    capabilitiesAffected,
    studiosAffected,
    pilotTrends,
  };
}

function buildRoadmapSuggestions(
  recommendations: ProductLearningReport['recommendations'],
): readonly RoadmapSuggestion[] {
  const byImpact: Record<LearningImpact, number> = {
    'High Impact': 0,
    'Medium Impact': 0,
    'Low Impact': 0,
  };

  return recommendations.slice(0, 12).map((theme) => {
    byImpact[theme.impact] += 1;
    return {
      id: `roadmap-${theme.id}`,
      title: `[${theme.impact}] ${theme.category}: ${theme.theme}`,
      impact: theme.impact,
      priority: theme.priority,
      rationale: `${theme.frequency}× u pilotů · priorita ${theme.priority}`,
      themeId: theme.id,
    };
  });
}

function buildExecutive(
  entries: ProductLearningReport['entries'],
  recommendations: ProductLearningReport['recommendations'],
  insights: ProductInsights,
): ProductLearningExecutive {
  const bugCount = entries.filter((item) => item.category === 'Bug').length;
  const featureCount = entries.filter(
    (item) => item.category === 'Feature Request',
  ).length;

  return {
    pilotLearnings: `${entries.length} feedback(ů) · ${recommendations.length} témat · ${insights.pilotTrends.length} pilot firm(s)`,
    topRecommendations: recommendations
      .slice(0, 10)
      .map(
        (item) =>
          `${item.priority} · ${item.impact} · ${item.category} (${item.frequency}×)`,
      ),
    greatestRisks:
      bugCount > 0 || recommendations.some((item) => item.category === 'Bug')
        ? [
            `${bugCount} bug signal(s)`,
            ...recommendations
              .filter((item) => item.category === 'Bug' || item.priority === 'P0')
              .slice(0, 3)
              .map((item) => item.theme),
          ]
        : ['Žádná kritická bug rizika z feedbacku'],
    greatestOpportunities:
      featureCount > 0 ||
      recommendations.some((item) => item.category === 'Feature Request')
        ? [
            `${featureCount} feature request(s)`,
            ...recommendations
              .filter(
                (item) =>
                  item.category === 'Feature Request' ||
                  item.category === 'Product',
              )
              .slice(0, 3)
              .map((item) => item.theme),
          ]
        : ['Sledujte další pilotní feedback pro příležitosti'],
  };
}

export function buildProductLearningReport(): ProductLearningReport {
  bridgePlatformFeedbackToLearning();
  const entries = listLearningFeedback();
  const recommendations = buildRecommendationPipeline(entries);
  const insights = buildInsights(entries, recommendations);
  const roadmapSuggestions = buildRoadmapSuggestions(recommendations);
  const executive = buildExecutive(entries, recommendations, insights);
  return {
    entries,
    recommendations,
    insights,
    roadmapSuggestions,
    executive,
  };
}
