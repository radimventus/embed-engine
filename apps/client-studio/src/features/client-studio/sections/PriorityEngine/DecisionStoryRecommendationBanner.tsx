import { useDecisionContext } from '../../runtime/useDecisionContext';

/**
 * PT-002 / PT-003 — Recommendation banner from Decision Context.
 */
export function DecisionStoryRecommendationBanner() {
  const context = useDecisionContext();

  if (context.focusPriority === null) {
    return null;
  }

  return (
    <aside
      aria-label="Recommendation banner"
      data-testid="pt002-recommendation-banner"
      data-pt002-surface="recommendation-banner"
      data-pt003-context="true"
      data-pt002-primary={context.focusPriority}
      data-pt003-focus={context.focusPriority}
      className="mb-5 rounded-[8px] border-2 border-embed-brand-gold/50 bg-embed-brand-gold/10 px-4 py-3"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
        Experience lens
      </p>
      <p className="mt-1 text-sm font-semibold text-embed-foreground-primary">
        {context.headline}
      </p>
      <p className="mt-1 text-sm leading-snug text-embed-foreground-primary/75">
        {context.summary}
      </p>
    </aside>
  );
}
