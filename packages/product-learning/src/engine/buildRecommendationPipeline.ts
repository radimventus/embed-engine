/**
 * EPIC-BX-20 — Deterministic recommendation pipeline.
 */

import type { CapabilityId } from '@embed-engine/capabilities';
import type { PlatformStudioId } from '@embed-engine/platform-access';

import type {
  LearningCategory,
  LearningFeedbackEntry,
  LearningImpact,
  LearningPriority,
  LearningThemeRecommendation,
} from '../domain/types';

const CATEGORY_WEIGHT: Record<LearningCategory, number> = {
  Bug: 5,
  Performance: 4,
  UX: 3,
  Platform: 3,
  'Feature Request': 2,
  Product: 2,
};

function themeKey(entry: LearningFeedbackEntry): string {
  const tokens = entry.message
    .toLowerCase()
    .replace(/[^a-zá-ž0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 3)
    .slice(0, 3);
  const stem = tokens.join('-') || entry.category.toLowerCase();
  return `${entry.category}:${stem}`;
}

function impactFor(
  frequency: number,
  category: LearningCategory,
): LearningImpact {
  const score = frequency * CATEGORY_WEIGHT[category];
  if (score >= 10 || (category === 'Bug' && frequency >= 2)) {
    return 'High Impact';
  }
  if (score >= 5 || frequency >= 2) return 'Medium Impact';
  return 'Low Impact';
}

function priorityFor(
  impact: LearningImpact,
  category: LearningCategory,
): LearningPriority {
  if (impact === 'High Impact' || category === 'Bug') return 'P0';
  if (impact === 'Medium Impact') return 'P1';
  return 'P2';
}

export function buildRecommendationPipeline(
  entries: readonly LearningFeedbackEntry[],
): readonly LearningThemeRecommendation[] {
  const groups = new Map<string, LearningFeedbackEntry[]>();
  for (const entry of entries) {
    const key = themeKey(entry);
    const bucket = groups.get(key) ?? [];
    bucket.push(entry);
    groups.set(key, bucket);
  }

  const recommendations: LearningThemeRecommendation[] = [];
  for (const [key, group] of groups) {
    const category = group[0]!.category;
    const frequency = group.length;
    const impact = impactFor(frequency, category);
    const capabilityIds = [
      ...new Set(
        group
          .map((item) => item.capabilityId)
          .filter((id): id is CapabilityId => id !== null),
      ),
    ];
    const studioIds = [
      ...new Set(
        group
          .map((item) => item.studioId)
          .filter((id): id is PlatformStudioId => id !== null),
      ),
    ];
    recommendations.push({
      id: key,
      theme: group[0]!.message.slice(0, 72),
      category,
      frequency,
      impact,
      priority: priorityFor(impact, category),
      sampleMessages: group.slice(0, 3).map((item) => item.message),
      capabilityIds,
      studioIds,
    });
  }

  return recommendations.sort((a, b) => {
    const rank = { P0: 0, P1: 1, P2: 2 } as const;
    if (rank[a.priority] !== rank[b.priority]) {
      return rank[a.priority] - rank[b.priority];
    }
    return b.frequency - a.frequency;
  });
}
