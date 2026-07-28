/**
 * Audit hero copy — the only surface intelligence may change (CAP UX 42 / AUD-02).
 * Panels, workflow, form, and layout stay Freeze-fixed.
 * CAP UX 43/44: title is always one sentence, max 34 characters.
 */
export type AuditHeroCopy = {
  readonly title: string;
  readonly subtitle: string;
  readonly highlight: string;
};

/** General rule — Audit hero title length (CAP UX 44). */
export const AUDIT_HERO_TITLE_MAX_CHARS = 34;

/** Freeze baseline (AUD-01 / AUD-04). */
export const AUDIT_HERO_FREEZE: AuditHeroCopy = Object.freeze({
  title: 'Tento dům vás zaujal.',
  subtitle:
    'Teď ověřme, jak bude pasovat na váš pozemek, ať už jej máte, nebo hledáte.',
  highlight:
    'Provedeme odborné posouzení a doporučíme vám ideální řešení umístění domu.',
});

type AuditHeroInput = {
  readonly recommendation?: string | null;
  readonly priorityIds?: readonly string[];
};

function assertAuditHeroTitle(title: string): string {
  if (title.includes('. ')) {
    throw new Error(`Audit hero title must be one sentence: "${title}"`);
  }
  if (title.length > AUDIT_HERO_TITLE_MAX_CHARS) {
    throw new Error(
      `Audit hero title exceeds ${AUDIT_HERO_TITLE_MAX_CHARS} chars (${title.length}): "${title}"`,
    );
  }
  return title;
}

/**
 * Presentation-only hero resolver.
 * Intelligence may adjust only title / subtitle / highlight — never panels or form.
 * Title: one sentence, ≤ 34 characters (always).
 */
export function resolveAuditHero(input: AuditHeroInput = {}): AuditHeroCopy {
  const priorities = input.priorityIds ?? [];
  const hasPlot = priorities.includes('plot');
  const recommendation = (input.recommendation ?? '').toLowerCase();

  if (hasPlot || recommendation.includes('plot') || recommendation.includes('land')) {
    return {
      title: assertAuditHeroTitle('Tento dům k vám ladí.'),
      subtitle:
        'Teď ověřme pozemek — ať už jej máte, nebo teprve hledáte vhodnou lokalitu.',
      highlight:
        'Provedeme odborné posouzení a doporučíme ideální řešení umístění domu.',
    };
  }

  if (recommendation.length > 0) {
    return {
      title: assertAuditHeroTitle('A teď poslední krok.'),
      subtitle:
        'Ověříme, jak dům pasuje na váš pozemek — ať už jej máte, nebo hledáte.',
      highlight:
        'Posouzení uzavře vaši cestu konkrétním doporučením k umístění domu.',
    };
  }

  return {
    ...AUDIT_HERO_FREEZE,
    title: assertAuditHeroTitle(AUDIT_HERO_FREEZE.title),
  };
}
