import type { Insight, IntelligenceProjectContext, Rule } from '../domain/types';
import { insight, rule } from './ruleHelpers';

function enabledOrder(ctx: IntelligenceProjectContext): readonly string[] {
  return ctx.experience.modules
    .filter((module) => module.enabled)
    .map((module) => module.id);
}

export const CONVERSION_RULES: readonly Rule[] = [
  rule('conversion-lead-late', 'conversion', 'Lead je příliš pozdě', (ctx) => {
    const order = enabledOrder(ctx);
    const leadIndex = order.indexOf('lead-capture');
    if (
      leadIndex >= 0 &&
      order.length > 0 &&
      leadIndex === order.length - 1 &&
      order.length >= 5
    ) {
      return insight(
        {
          id: 'conversion-lead-late',
          category: 'conversion',
          title: 'Lead je příliš pozdě',
        },
        'Lead Capture je až na konci dlouhého toku — zvažte dřívější CTA.',
        'medium',
        'experience',
      );
    }
    return null;
  }),
  rule('conversion-lead-missing', 'conversion', 'Lead Capture chybí', (ctx) => {
    const hasLead = ctx.experience.modules.some(
      (module) => module.id === 'lead-capture' && module.enabled,
    );
    return !hasLead
      ? insight(
          {
            id: 'conversion-lead-missing',
            category: 'conversion',
            title: 'Lead Capture chybí',
          },
          'Bez Lead Capture Experience neuzavírá rozhodnutí.',
          'high',
          'experience',
        )
      : null;
  }),
  rule('conversion-faq-few', 'conversion', 'FAQ obsahuje pouze dvě otázky', (ctx) => {
    const faqCount = ctx.experience.faqItems.filter(
      (item) => item.question.trim().length > 0,
    ).length;
    if (faqCount > 0 && faqCount <= 2) {
      return insight(
        {
          id: 'conversion-faq-few',
          category: 'conversion',
          title: 'FAQ obsahuje pouze dvě otázky',
        },
        'Doporučeno alespoň 3 FAQ položky pro konverzi důvěry.',
        'medium',
        'knowledge',
      );
    }
    return null;
  }),
  rule('conversion-faq-missing', 'conversion', 'FAQ je prázdné', (ctx) => {
    const faqCount = ctx.experience.faqItems.filter(
      (item) => item.question.trim().length > 0,
    ).length;
    return faqCount === 0
      ? insight(
          {
            id: 'conversion-faq-missing',
            category: 'conversion',
            title: 'FAQ je prázdné',
          },
          'Doplňte FAQ před publikací.',
          'high',
          'knowledge',
        )
      : null;
  }),
  rule(
    'conversion-priority-below-gallery',
    'conversion',
    'Priority jsou až pod Gallery',
    (ctx) => {
      const order = enabledOrder(ctx);
      const priorityIndex = order.indexOf('priority');
      const galleryNavIndex = order.indexOf('house-navigator');
      if (
        priorityIndex >= 0 &&
        galleryNavIndex >= 0 &&
        priorityIndex > galleryNavIndex
      ) {
        return insight(
          {
            id: 'conversion-priority-below-gallery',
            category: 'conversion',
            title: 'Priority jsou až pod Gallery',
          },
          'Přesuňte Priority výše — dříve než House Navigator.',
          'high',
          'experience',
        );
      }
      return null;
    },
  ),
  rule('conversion-cta-missing', 'conversion', 'CTA chybí', (ctx) =>
    ctx.experience.heroCta.trim().length === 0
      ? insight(
          {
            id: 'conversion-cta-missing',
            category: 'conversion',
            title: 'CTA chybí',
          },
          'Hero CTA je prázdné.',
          'high',
          'experience',
        )
      : null,
  ),
  rule('conversion-cta-late', 'conversion', 'CTA se zobrazí příliš pozdě', (ctx) => {
    if (ctx.experience.heroCta.trim().length === 0) return null;
    const order = enabledOrder(ctx);
    const heroIndex = order.indexOf('hero');
    return heroIndex > 0
      ? insight(
          {
            id: 'conversion-cta-late',
            category: 'conversion',
            title: 'CTA se zobrazí příliš pozdě',
          },
          'Hero (s CTA) není na začátku Experience toku.',
          'medium',
          'experience',
        )
      : null;
  }),
  rule('conversion-priority-off', 'conversion', 'Priority jsou vypnuté', (ctx) => {
    const order = enabledOrder(ctx);
    const priorityIndex = order.indexOf('priority');
    if (!ctx.experience.priorityEnabled || priorityIndex < 0) {
      return insight(
        {
          id: 'conversion-priority-off',
          category: 'conversion',
          title: 'Priority jsou vypnuté',
        },
        'Bez Priority Runtime nedostane Decision Signal.',
        'high',
        'experience',
      );
    }
    return null;
  }),
];

export function evaluateConversionRules(
  context: IntelligenceProjectContext,
): Insight[] {
  return CONVERSION_RULES.map((item) => item.evaluate(context)).filter(
    (item): item is Insight => item !== null,
  );
}
