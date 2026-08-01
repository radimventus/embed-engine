/**
 * EPIC-BX-09 — Builder Intelligence types (deterministic product coach, no LLM).
 */

import type { HousePackageNavId } from '../house-package/HousePackageSidebar';

export type IntelligenceCoachId =
  | 'quality'
  | 'conversion'
  | 'knowledge'
  | 'decision';

export type RecommendationSeverity = 'high' | 'medium' | 'low';

export type IntelligenceRecommendation = {
  readonly id: string;
  readonly coachId: IntelligenceCoachId;
  readonly title: string;
  readonly detail: string;
  readonly severity: RecommendationSeverity;
  readonly nav: HousePackageNavId;
};

export type CoachFinding = {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly severity: RecommendationSeverity;
  readonly nav: HousePackageNavId;
};

export type CoachReport = {
  readonly id: IntelligenceCoachId;
  readonly label: string;
  readonly description: string;
  readonly findings: readonly CoachFinding[];
  readonly score: number;
};

export type DecisionReadinessGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export type DecisionReadinessPillar = {
  readonly id: string;
  readonly label: string;
  readonly score: number;
};

export type DecisionReadinessReport = {
  readonly score: number;
  readonly grade: DecisionReadinessGrade;
  readonly pillars: readonly DecisionReadinessPillar[];
};

export const INTELLIGENCE_COACHES: readonly {
  readonly id: IntelligenceCoachId;
  readonly label: string;
  readonly description: string;
}[] = [
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
