/**
 * EPIC-BX-20 — Product Learning types (aggregation only).
 * Feedback links to existing Company / Workspace / Project — no second customer model.
 */

import type { CapabilityId } from '@embed-engine/capabilities';
import type { PlatformStudioId } from '@embed-engine/platform-access';

export type LearningCategory =
  | 'UX'
  | 'Product'
  | 'Platform'
  | 'Performance'
  | 'Bug'
  | 'Feature Request';

export type LearningImpact = 'High Impact' | 'Medium Impact' | 'Low Impact';

export type LearningPriority = 'P0' | 'P1' | 'P2';

export type LearningFeedbackEntry = {
  readonly id: string;
  readonly message: string;
  readonly category: LearningCategory;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string | null;
  readonly studioId: PlatformStudioId | null;
  readonly capabilityId: CapabilityId | null;
  readonly releaseLabel: string | null;
  readonly createdAt: string;
  readonly source: 'shell-feedback' | 'learning';
};

export type LearningThemeRecommendation = {
  readonly id: string;
  readonly theme: string;
  readonly category: LearningCategory;
  readonly frequency: number;
  readonly impact: LearningImpact;
  readonly priority: LearningPriority;
  readonly sampleMessages: readonly string[];
  readonly capabilityIds: readonly CapabilityId[];
  readonly studioIds: readonly PlatformStudioId[];
};

export type ProductInsights = {
  readonly topThemes: readonly LearningThemeRecommendation[];
  readonly capabilitiesAffected: readonly {
    readonly capabilityId: CapabilityId;
    readonly count: number;
  }[];
  readonly studiosAffected: readonly {
    readonly studioId: PlatformStudioId;
    readonly count: number;
  }[];
  readonly pilotTrends: readonly {
    readonly companyId: string;
    readonly companyName: string;
    readonly count: number;
    readonly topCategory: LearningCategory | null;
  }[];
};

export type RoadmapSuggestion = {
  readonly id: string;
  readonly title: string;
  readonly impact: LearningImpact;
  readonly priority: LearningPriority;
  readonly rationale: string;
  readonly themeId: string;
};

export type ProductLearningExecutive = {
  readonly pilotLearnings: string;
  readonly topRecommendations: readonly string[];
  readonly greatestRisks: readonly string[];
  readonly greatestOpportunities: readonly string[];
};

export type ProductLearningReport = {
  readonly entries: readonly LearningFeedbackEntry[];
  readonly recommendations: readonly LearningThemeRecommendation[];
  readonly insights: ProductInsights;
  readonly roadmapSuggestions: readonly RoadmapSuggestion[];
  readonly executive: ProductLearningExecutive;
};
