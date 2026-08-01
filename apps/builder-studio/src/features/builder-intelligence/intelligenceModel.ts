/**
 * EPIC-BX-09 — Builder Intelligence aggregate model.
 */

import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageValidationReport } from '../house-package/housePackageValidationReport';
import { buildConversionCoach } from './conversionCoach';
import { buildDecisionCoach } from './decisionCoach';
import { buildDecisionReadiness } from './decisionReadiness';
import { buildKnowledgeCoach } from './knowledgeCoach';
import { buildQualityCoach } from './qualityCoach';
import {
  INTELLIGENCE_COACHES,
  type CoachReport,
  type DecisionReadinessReport,
  type IntelligenceCoachId,
  type IntelligenceRecommendation,
  type RecommendationSeverity,
} from './intelligenceTypes';

export type BuilderIntelligenceModel = {
  readonly coaches: readonly CoachReport[];
  readonly readiness: DecisionReadinessReport;
  readonly recommendations: readonly IntelligenceRecommendation[];
};

const SEVERITY_RANK: Record<RecommendationSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function buildBuilderIntelligenceModel(input: {
  readonly projectId: string;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly validationReport: HousePackageValidationReport | null;
}): BuilderIntelligenceModel {
  const coaches: CoachReport[] = [
    buildQualityCoach(input),
    buildConversionCoach(input),
    buildKnowledgeCoach(input),
    buildDecisionCoach(input),
  ];

  const readiness = buildDecisionReadiness(input);
  const recommendations = coaches
    .flatMap((coach) =>
      coach.findings.map(
        (finding): IntelligenceRecommendation => ({
          id: finding.id,
          coachId: coach.id,
          title: finding.title,
          detail: finding.detail,
          severity: finding.severity,
          nav: finding.nav,
        }),
      ),
    )
    .sort((left, right) => {
      const severityDelta =
        SEVERITY_RANK[left.severity] - SEVERITY_RANK[right.severity];
      if (severityDelta !== 0) return severityDelta;
      return left.title.localeCompare(right.title, 'cs');
    });

  return { coaches, readiness, recommendations };
}

export function getCoachLabel(id: IntelligenceCoachId): string {
  return INTELLIGENCE_COACHES.find((item) => item.id === id)?.label ?? id;
}

export { INTELLIGENCE_COACHES };
