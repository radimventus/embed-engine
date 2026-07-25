import { useExperienceProjection } from '../../runtime/useExperienceProjection';

/**
 * PT-002 — Recommendation banner driven by Decision Story primary.
 * Visible proof that Experience interpretation changed.
 */
export function DecisionStoryRecommendationBanner() {
  const { story, interpretation, highlight } = useExperienceProjection();

  if (story.primaryPriority === null) {
    return null;
  }

  return (
    <aside
      aria-label="Recommendation banner"
      data-testid="pt002-recommendation-banner"
      data-pt002-surface="recommendation-banner"
      data-pt002-primary={story.primaryPriority}
      data-pt002-related={highlight.relatedPriorityIds.join(',')}
      className="mb-5 rounded-[8px] border-2 border-embed-brand-gold/50 bg-embed-brand-gold/10 px-4 py-3"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
        Experience lens
      </p>
      <p className="mt-1 text-sm font-semibold text-embed-foreground-primary">
        {interpretation.headline}
      </p>
      <p className="mt-1 text-sm leading-snug text-embed-foreground-primary/75">
        {interpretation.body}
      </p>
    </aside>
  );
}
