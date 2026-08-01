/**
 * EPIC-BX-12 — Single Rule Registry for CONIS Decision Intelligence.
 */

import type { Rule, RuleCategory } from '../domain/types';
import {
  CONVERSION_RULES,
  evaluateConversionRules,
} from './conversionRules';
import {
  DECISION_PATH_RULE_TEMPLATE,
  DECISION_PERSONA_RULE_TEMPLATE,
  DECISION_RULES,
  evaluateDecisionRules,
} from './decisionRules';
import {
  evaluateKnowledgeRules,
  KNOWLEDGE_GAP_RULE_TEMPLATE,
  KNOWLEDGE_RULES,
} from './knowledgeRules';
import { evaluateQualityRules, QUALITY_RULES } from './qualityRules';
import type { Insight, IntelligenceProjectContext } from '../domain/types';

export const INTELLIGENCE_RULE_REGISTRY: readonly Rule[] = [
  ...QUALITY_RULES,
  ...CONVERSION_RULES,
  ...KNOWLEDGE_RULES,
  KNOWLEDGE_GAP_RULE_TEMPLATE,
  ...DECISION_RULES,
  DECISION_PATH_RULE_TEMPLATE,
  DECISION_PERSONA_RULE_TEMPLATE,
] as const;

export function getRulesByCategory(category: RuleCategory): readonly Rule[] {
  return INTELLIGENCE_RULE_REGISTRY.filter((item) => item.category === category);
}

export function getRule(id: string): Rule | undefined {
  return INTELLIGENCE_RULE_REGISTRY.find((item) => item.id === id);
}

export function evaluateCategoryRules(
  category: RuleCategory,
  context: IntelligenceProjectContext,
): readonly Insight[] {
  switch (category) {
    case 'quality':
      return evaluateQualityRules(context);
    case 'conversion':
      return evaluateConversionRules(context);
    case 'knowledge':
      return evaluateKnowledgeRules(context);
    case 'decision':
      return evaluateDecisionRules(context);
  }
}

export function evaluateAllRules(
  context: IntelligenceProjectContext,
): readonly Insight[] {
  return [
    ...evaluateQualityRules(context),
    ...evaluateConversionRules(context),
    ...evaluateKnowledgeRules(context),
    ...evaluateDecisionRules(context),
  ];
}
