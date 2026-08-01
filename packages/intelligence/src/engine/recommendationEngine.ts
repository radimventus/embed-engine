import {
  INTELLIGENCE_CATEGORIES,
  type CoachResult,
  type DecisionReadiness,
  type DecisionReadinessGrade,
  type DecisionScore,
  type Insight,
  type IntelligenceAnalysis,
  type IntelligenceProjectContext,
  type Recommendation,
  type RecommendationSeverity,
  type RuleCategory,
} from '../domain/types';
import { evaluateCategoryRules, evaluateAllRules } from '../rules/ruleRegistry';
import { scoreFromInsights } from '../rules/ruleHelpers';

const SEVERITY_RANK: Record<RecommendationSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const CATEGORY_WEIGHTS: Record<
  RuleCategory,
  { readonly high: number; readonly medium: number; readonly low: number }
> = {
  quality: { high: 18, medium: 10, low: 5 },
  conversion: { high: 20, medium: 12, low: 6 },
  knowledge: { high: 18, medium: 10, low: 5 },
  decision: { high: 16, medium: 9, low: 4 },
};

export function buildCoachResults(
  context: IntelligenceProjectContext,
): CoachResult[] {
  return INTELLIGENCE_CATEGORIES.map((meta) => {
    const findings = evaluateCategoryRules(meta.id, context);
    return {
      id: meta.id,
      label: meta.label,
      description: meta.description,
      findings,
      score: scoreFromInsights(findings, CATEGORY_WEIGHTS[meta.id]),
    };
  });
}

export function buildInsights(
  context: IntelligenceProjectContext,
): readonly Insight[] {
  return evaluateAllRules(context);
}

export function buildRecommendations(
  context: IntelligenceProjectContext,
): readonly Recommendation[] {
  const coaches = buildCoachResults(context);
  return coaches
    .flatMap((coach) =>
      coach.findings.map(
        (finding): Recommendation => ({
          id: finding.id,
          category: coach.id,
          title: finding.title,
          detail: finding.detail,
          severity: finding.severity,
          target: finding.target,
        }),
      ),
    )
    .sort((left, right) => {
      const severityDelta =
        SEVERITY_RANK[left.severity] - SEVERITY_RANK[right.severity];
      if (severityDelta !== 0) return severityDelta;
      return left.title.localeCompare(right.title, 'cs');
    });
}

export function gradeForScore(score: number): DecisionReadinessGrade {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'E';
}

export function computeDecisionReadiness(
  context: IntelligenceProjectContext,
): DecisionReadiness {
  const validationScore =
    context.validationStatus === 'PASS'
      ? 100
      : context.validationStatus === 'WARNING'
        ? 75
        : context.housePackage.validationOk
          ? 85
          : 40;

  const qaTotal =
    context.qa.passCount + context.qa.warnCount + context.qa.failCount;
  const qaScore =
    qaTotal === 0
      ? 50
      : Math.round(
          (context.qa.passCount * 100 +
            context.qa.warnCount * 55 +
            context.qa.failCount * 10) /
            qaTotal,
        );

  const knowledgeTotal =
    context.knowledge.completeCount +
    context.knowledge.partialCount +
    context.knowledge.missingCount;
  const knowledgeScore =
    knowledgeTotal === 0
      ? 50
      : Math.round(
          (context.knowledge.completeCount * 100 +
            context.knowledge.partialCount * 60 +
            context.knowledge.missingCount * 15) /
            knowledgeTotal,
        );

  const enabled = context.experience.modules.filter(
    (module) => module.enabled,
  ).length;
  const experienceScore = Math.min(
    100,
    Math.round((enabled / 6) * 100) -
      (context.experience.faqItems.length < 2 ? 15 : 0),
  );

  let mediaScore = 0;
  if (context.housePackage.heroPath.trim().length > 0) {
    mediaScore += 35;
  }
  mediaScore += Math.min(40, context.housePackage.galleryCount * 8);
  mediaScore += context.housePackage.videoCount > 0 ? 25 : 0;
  mediaScore = Math.min(100, mediaScore);

  const runtimeScore = context.housePackage.validationOk ? 100 : 35;

  const pillars = [
    { id: 'validation', label: 'Validation', score: validationScore },
    { id: 'qa', label: 'QA', score: qaScore },
    { id: 'knowledge', label: 'Knowledge', score: knowledgeScore },
    {
      id: 'experience',
      label: 'Experience',
      score: Math.max(0, experienceScore),
    },
    { id: 'media', label: 'Media', score: mediaScore },
    { id: 'runtime', label: 'Runtime', score: runtimeScore },
  ] as const;

  const score = Math.round(
    pillars.reduce((sum, pillar) => sum + pillar.score, 0) / pillars.length,
  );

  return {
    score,
    grade: gradeForScore(score),
    pillars,
  };
}

export function computeDecisionScore(
  context: IntelligenceProjectContext,
): DecisionScore {
  const readiness = computeDecisionReadiness(context);
  return { value: readiness.score, max: 100 };
}

/**
 * Recommendation Engine — single shared analysis entry for the platform.
 */
export function runRecommendationEngine(
  context: IntelligenceProjectContext,
): IntelligenceAnalysis {
  const coaches = buildCoachResults(context);
  const readiness = computeDecisionReadiness(context);
  const recommendations = buildRecommendations(context);
  const insights = buildInsights(context);
  return {
    coaches,
    readiness,
    recommendations,
    insights,
    score: { value: readiness.score, max: 100 },
  };
}
