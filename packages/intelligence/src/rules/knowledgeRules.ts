import type { Insight, IntelligenceProjectContext, Rule } from '../domain/types';
import { insight, rule } from './ruleHelpers';

export const KNOWLEDGE_RULES: readonly Rule[] = [
  rule('knowledge-energy-missing', 'knowledge', 'Chybí energetické údaje', (ctx) => {
    const energy = ctx.knowledge.categories.find((item) => item.id === 'energy');
    if (
      energy?.health === 'missing' ||
      ctx.media.energyClass.trim().length === 0
    ) {
      return insight(
        {
          id: 'knowledge-energy-missing',
          category: 'knowledge',
          title: 'Chybí energetické údaje',
        },
        'Doplňte energetickou třídu v Knowledge / Runtime defaults.',
        'high',
        'knowledge',
      );
    }
    return null;
  }),
  rule(
    'knowledge-heating-missing',
    'knowledge',
    'Nejsou informace o vytápění',
    (ctx) => {
      const docs = ctx.media.documentTitles.map(
        (title, index) => `${title} ${ctx.media.documentUrls[index] ?? ''}`,
      );
      const heatingMention =
        docs.some((text) => /vytáp|heating|teplo|tepeln/i.test(text)) ||
        ctx.experience.faqItems.some((item) =>
          /vytáp|heating|teplo/i.test(`${item.question} ${item.answer}`),
        );
      return !heatingMention
        ? insight(
            {
              id: 'knowledge-heating-missing',
              category: 'knowledge',
              title: 'Nejsou informace o vytápění',
            },
            'Přidejte dokument nebo FAQ o vytápění.',
            'medium',
            'knowledge',
          )
        : null;
    },
  ),
  rule('knowledge-financing-missing', 'knowledge', 'Chybí financování', (ctx) => {
    const financingFaq = ctx.experience.faqItems.some((item) =>
      /financ|hypoték|úvěr|splat/i.test(`${item.question} ${item.answer}`),
    );
    const financing = ctx.knowledge.categories.find(
      (item) => item.id === 'financing',
    );
    if (!financingFaq && (financing?.itemCount ?? 0) <= 1) {
      return insight(
        {
          id: 'knowledge-financing-missing',
          category: 'knowledge',
          title: 'Chybí financování',
        },
        'Kromě ceny doplňte FAQ nebo Knowledge o financování.',
        'medium',
        'knowledge',
      );
    }
    return null;
  }),
  rule('knowledge-partial-many', 'knowledge', 'Více Knowledge oblastí je neúplných', (ctx) =>
    ctx.knowledge.partialCount > 3
      ? insight(
          {
            id: 'knowledge-partial-many',
            category: 'knowledge',
            title: 'Více Knowledge oblastí je neúplných',
          },
          `${ctx.knowledge.partialCount} kategorií ve stavu partial.`,
          'low',
          'knowledge',
        )
      : null,
  ),
];

/** Dynamic missing-category rules — evaluated outside static registry entries. */
export function evaluateKnowledgeCategoryGaps(
  context: IntelligenceProjectContext,
): Insight[] {
  const findings: Insight[] = [];
  for (const category of context.knowledge.categories) {
    if (category.health === 'missing' && category.id !== 'energy') {
      findings.push(
        insight(
          {
            id: `knowledge-missing-${category.id}`,
            category: 'knowledge',
            title: `Knowledge: ${category.label} chybí`,
          },
          category.summary,
          'medium',
          'knowledge',
        ),
      );
    }
  }
  return findings;
}

export function evaluateKnowledgeRules(
  context: IntelligenceProjectContext,
): Insight[] {
  const staticFindings = KNOWLEDGE_RULES.map((item) =>
    item.evaluate(context),
  ).filter((item): item is Insight => item !== null);
  return [...staticFindings, ...evaluateKnowledgeCategoryGaps(context)];
}

/** Registry entries for dynamic gap rules (documentation / enumeration). */
export const KNOWLEDGE_GAP_RULE_TEMPLATE: Rule = rule(
  'knowledge-missing-*',
  'knowledge',
  'Knowledge kategorie chybí',
  () => null,
);
