import { useDecisionContext } from '../../runtime/useDecisionContext';
import { useExperienceProjection } from '../../runtime/useExperienceProjection';

/**
 * PT-002 / PT-003 — Recommended topics from Decision Context.
 * Labels come from context.recommendations only.
 */
export function RecommendedSectionOrder() {
  const context = useDecisionContext();
  const { recommendedSectionOrder } = useExperienceProjection();

  return (
    <section
      aria-label="Doporučené pořadí"
      data-testid="pt002-section-order"
      data-pt002-surface="section-order"
      data-pt003-context="true"
      data-pt002-primary={context.focusPriority ?? ''}
      data-pt003-recommendations={context.recommendations.join('|')}
      data-pt002-section-order={recommendedSectionOrder.map((s) => s.id).join(',')}
      className="mt-5 rounded-[8px] border border-embed-border-default bg-embed-surface-elevated p-4"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
        Recommendations
      </p>
      <p className="mt-1 text-xs text-embed-foreground-primary/55">
        Decision Context — doporučená témata Experience
      </p>
      {context.recommendations.length === 0 ? (
        <p className="mt-3 text-sm text-embed-foreground-primary/60">
          Po výběru priorit se zde objeví doporučení z Decision Context.
        </p>
      ) : (
        <ol className="mt-3 space-y-2">
          {recommendedSectionOrder.map((section, index) => (
            <li key={`${section.id}-${section.label}`}>
              <a
                href={section.href}
                data-section-id={section.id}
                data-section-rank={String(index + 1)}
                className="flex items-baseline gap-2 text-sm text-embed-foreground-primary transition-colors hover:text-embed-brand-gold"
              >
                <span className="tabular-nums text-embed-foreground-primary/45">
                  {index + 1}.
                </span>
                <span className={index === 0 ? 'font-semibold' : undefined}>
                  {section.label}
                </span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
