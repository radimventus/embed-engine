/**
 * EPIC-BX-12 — Shared Decision Intelligence domain model (platform-wide).
 * Pure TypeScript — no React, no UI, no browser APIs.
 */

/** Coach / rule category — single taxonomy for the platform. */
export type RuleCategory =
  | 'quality'
  | 'conversion'
  | 'knowledge'
  | 'decision';

/** @deprecated Prefer RuleCategory — kept as alias for coach IDs. */
export type IntelligenceCoachId = RuleCategory;

export type RecommendationSeverity = 'high' | 'medium' | 'low';

/**
 * Opaque navigation / action target for studio adapters.
 * Builder maps these to HousePackageNavId; Manager/Sales map later.
 */
export type IntelligenceTarget = string;

export type Recommendation = {
  readonly id: string;
  readonly category: RuleCategory;
  readonly title: string;
  readonly detail: string;
  readonly severity: RecommendationSeverity;
  readonly target: IntelligenceTarget;
};

/** Decision Score — 0–100 product readiness / coach score. */
export type DecisionScore = {
  readonly value: number;
  readonly max: 100;
};

export type DecisionReadinessGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export type DecisionReadinessPillar = {
  readonly id: string;
  readonly label: string;
  readonly score: number;
};

export type DecisionReadiness = {
  readonly score: number;
  readonly grade: DecisionReadinessGrade;
  readonly pillars: readonly DecisionReadinessPillar[];
};

export type Insight = {
  readonly id: string;
  readonly category: RuleCategory;
  readonly title: string;
  readonly detail: string;
  readonly severity: RecommendationSeverity;
  readonly target: IntelligenceTarget;
  readonly ruleId: string;
};

export type CoachResult = {
  readonly id: RuleCategory;
  readonly label: string;
  readonly description: string;
  readonly findings: readonly Insight[];
  readonly score: number;
};

export type Rule = {
  readonly id: string;
  readonly category: RuleCategory;
  readonly title: string;
  readonly evaluate: (context: IntelligenceProjectContext) => Insight | null;
};

export type IntelligenceCategoryMeta = {
  readonly id: RuleCategory;
  readonly label: string;
  readonly description: string;
};

export const INTELLIGENCE_CATEGORIES: readonly IntelligenceCategoryMeta[] = [
  {
    id: 'quality',
    label: 'Quality Coach',
    description: 'Kontrola médií a obsahu objektu.',
  },
  {
    id: 'conversion',
    label: 'Conversion Coach',
    description: 'Struktura Experience a konverzní tok.',
  },
  {
    id: 'knowledge',
    label: 'Knowledge Coach',
    description: 'Úplnost Knowledge (pravidla, ne AI).',
  },
  {
    id: 'decision',
    label: 'Decision Coach',
    description: 'Decision Path a persony přes Runtime priority.',
  },
] as const;

/** @deprecated Prefer INTELLIGENCE_CATEGORIES */
export const INTELLIGENCE_COACHES = INTELLIGENCE_CATEGORIES;

/** Full analysis result from the Recommendation Engine. */
export type IntelligenceAnalysis = {
  readonly coaches: readonly CoachResult[];
  readonly readiness: DecisionReadiness;
  readonly recommendations: readonly Recommendation[];
  readonly insights: readonly Insight[];
  readonly score: DecisionScore;
};

export type KnowledgeHealth = 'complete' | 'partial' | 'missing';

export type IntelligenceKnowledgeCategory = {
  readonly id: string;
  readonly label: string;
  readonly health: KnowledgeHealth;
  readonly itemCount: number;
  readonly summary: string;
};

export type IntelligenceExperienceModule = {
  readonly id: string;
  readonly label: string;
  readonly enabled: boolean;
};

export type IntelligenceFaqItem = {
  readonly question: string;
  readonly answer: string;
};

export type IntelligencePersona = {
  readonly id: string;
  readonly label: string;
  readonly priorityIds: readonly string[];
};

export type IntelligenceGalleryRow = {
  readonly room: string;
};

export type IntelligenceVideoRow = {
  readonly room: string;
  readonly mediaId: string;
};

/**
 * Normalized project input for Intelligence Core.
 * Adapters project House Package / Experience / Knowledge into this shape.
 */
export type IntelligenceProjectContext = {
  readonly projectId: string;
  readonly housePackage: {
    readonly heroPath: string;
    readonly galleryRows: readonly IntelligenceGalleryRow[];
    readonly videoRows: readonly IntelligenceVideoRow[];
    readonly roomCount: number;
    readonly floorPlanCount: number;
    readonly galleryCount: number;
    readonly videoCount: number;
    readonly validationOk: boolean;
  };
  readonly experience: {
    readonly modules: readonly IntelligenceExperienceModule[];
    readonly faqItems: readonly IntelligenceFaqItem[];
    readonly heroCta: string;
    readonly priorityEnabled: boolean;
  };
  readonly knowledge: {
    readonly categories: readonly IntelligenceKnowledgeCategory[];
    readonly completeCount: number;
    readonly partialCount: number;
    readonly missingCount: number;
  };
  readonly media: {
    readonly heroAlt: string;
    readonly documentTitles: readonly string[];
    readonly documentUrls: readonly string[];
    readonly energyClass: string;
  };
  readonly qa: {
    readonly passCount: number;
    readonly warnCount: number;
    readonly failCount: number;
  };
  readonly validationStatus: 'PASS' | 'WARNING' | 'ERROR' | 'UNKNOWN';
  readonly personas: readonly IntelligencePersona[];
  readonly criticalPathStepIds: readonly string[];
};
