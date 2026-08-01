import type { Insight, IntelligenceProjectContext, Rule } from '../domain/types';
import { insight, rule } from './ruleHelpers';

export const DECISION_RULES: readonly Rule[] = [
  rule(
    'decision-never-visited',
    'decision',
    'Části Experience nejsou nikdy navštíveny',
    (ctx) => {
      const neverVisited = ctx.experience.modules.filter(
        (step) => !step.enabled,
      );
      if (neverVisited.length === 0) return null;
      return insight(
        {
          id: 'decision-never-visited',
          category: 'decision',
          title: 'Části Experience nejsou nikdy navštíveny',
        },
        `Vypnuto: ${neverVisited.map((step) => step.label).join(', ')}.`,
        neverVisited.length >= 2 ? 'high' : 'medium',
        'experience',
      );
    },
  ),
  rule(
    'decision-no-priority-runtime',
    'decision',
    'Runtime nedostane Decision Signal',
    (ctx) =>
      !ctx.experience.priorityEnabled
        ? insight(
            {
              id: 'decision-no-priority-runtime',
              category: 'decision',
              title: 'Runtime nedostane Decision Signal',
            },
            'Priority modul je vypnutý — ChangePriority se neaplikuje.',
            'high',
            'preview-center',
          )
        : null,
  ),
];

export function evaluateDecisionPathGaps(
  context: IntelligenceProjectContext,
): Insight[] {
  const enabledIds = new Set(
    context.experience.modules
      .filter((step) => step.enabled)
      .map((step) => step.id),
  );
  const findings: Insight[] = [];
  for (const stepId of context.criticalPathStepIds) {
    if (!enabledIds.has(stepId)) {
      findings.push(
        insight(
          {
            id: `decision-path-missing-${stepId}`,
            category: 'decision',
            title: `Decision Path bez kroku ${stepId}`,
          },
          'Důležitý krok Experience není aktivní — persona ho nenavštíví.',
          'high',
          'experience',
        ),
      );
    }
  }
  return findings;
}

export function evaluateDecisionPersonaGaps(
  context: IntelligenceProjectContext,
): Insight[] {
  const enabledIds = new Set(
    context.experience.modules
      .filter((step) => step.enabled)
      .map((step) => step.id),
  );
  const findings: Insight[] = [];
  for (const persona of context.personas) {
    const needsLayout = persona.priorityIds.includes('layout');
    const needsEnergy = persona.priorityIds.includes('energy');
    const hasNavigator = enabledIds.has('house-navigator');
    const hasFaq = enabledIds.has('faq');

    if (needsLayout && !hasNavigator) {
      findings.push(
        insight(
          {
            id: `decision-persona-${persona.id}-layout`,
            category: 'decision',
            title: `${persona.label}: neuvidí dispozici`,
          },
          'Persona potřebuje layout priority, ale House Navigator je vypnutý.',
          'high',
          'preview-center',
        ),
      );
    }

    if (needsEnergy && !hasFaq && context.experience.faqItems.length < 1) {
      findings.push(
        insight(
          {
            id: `decision-persona-${persona.id}-energy`,
            category: 'decision',
            title: `${persona.label}: chybí energetický kontext`,
          },
          'Persona má energy priority — doplňte FAQ nebo Knowledge.',
          'medium',
          'knowledge',
        ),
      );
    }
  }
  return findings;
}

function dedupeInsights(findings: readonly Insight[]): Insight[] {
  const seen = new Set<string>();
  const result: Insight[] = [];
  for (const finding of findings) {
    if (seen.has(finding.id)) continue;
    seen.add(finding.id);
    result.push(finding);
  }
  return result;
}

export function evaluateDecisionRules(
  context: IntelligenceProjectContext,
): Insight[] {
  const staticFindings = DECISION_RULES.map((item) =>
    item.evaluate(context),
  ).filter((item): item is Insight => item !== null);
  return dedupeInsights([
    ...evaluateDecisionPathGaps(context),
    ...staticFindings,
    ...evaluateDecisionPersonaGaps(context),
  ]);
}

export const DECISION_PATH_RULE_TEMPLATE: Rule = rule(
  'decision-path-missing-*',
  'decision',
  'Decision Path chybí krok',
  () => null,
);

export const DECISION_PERSONA_RULE_TEMPLATE: Rule = rule(
  'decision-persona-*-*',
  'decision',
  'Persona coverage gap',
  () => null,
);
