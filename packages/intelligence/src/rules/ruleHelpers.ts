import type {
  Insight,
  IntelligenceProjectContext,
  RecommendationSeverity,
  Rule,
  RuleCategory,
} from '../domain/types';

export function insight(
  rule: Pick<Rule, 'id' | 'category' | 'title'>,
  detail: string,
  severity: RecommendationSeverity,
  target: string,
): Insight {
  return {
    id: rule.id,
    ruleId: rule.id,
    category: rule.category,
    title: rule.title,
    detail,
    severity,
    target,
  };
}

export function rule(
  id: string,
  category: RuleCategory,
  title: string,
  evaluate: (context: IntelligenceProjectContext) => Insight | null,
): Rule {
  return { id, category, title, evaluate };
}

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function scoreFromInsights(
  insights: readonly Insight[],
  weights: { readonly high: number; readonly medium: number; readonly low: number },
): number {
  const penalty = insights.reduce(
    (sum, item) =>
      sum +
      (item.severity === 'high'
        ? weights.high
        : item.severity === 'medium'
          ? weights.medium
          : weights.low),
    0,
  );
  return clampScore(100 - penalty);
}
