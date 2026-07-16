import {
  DECISION_CTA_ENABLED_CLASS,
  DECISION_CTA_FOCUS_CLASS,
} from './decision-cards-layout';
import {
  MOCK_RECOMMENDATION_VIEW_MODEL,
  RECOMMENDATION_MAX_CONSIDERATIONS,
  RECOMMENDATION_MAX_STRENGTHS,
  type RecommendationViewModel,
} from './RecommendationViewModel';

type RecommendationPanelProps = {
  viewModel?: RecommendationViewModel;
};

function renderStars(score: number): string {
  const filled = Math.min(5, Math.max(0, Math.round(score)));
  return `${'★'.repeat(filled)}${'☆'.repeat(5 - filled)}`;
}

export function RecommendationPanel({
  viewModel = MOCK_RECOMMENDATION_VIEW_MODEL,
}: RecommendationPanelProps) {
  const strengths = viewModel.strengths.slice(0, RECOMMENDATION_MAX_STRENGTHS);
  const considerations = viewModel.considerations.slice(0, RECOMMENDATION_MAX_CONSIDERATIONS);

  return (
    <section
      aria-label="Recommendation"
      className="mt-section rounded-xl border border-embed-neutral-200/80 bg-embed-white px-section py-5"
    >
      <h3 className="text-sm font-semibold tracking-wide text-embed-brand-navy">
        {viewModel.title}
      </h3>

      <div className="mt-4 border-t border-embed-neutral-200/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-embed-foreground-tertiary">
          Overall Match
        </p>
        <p
          className="mt-1 text-base leading-none tracking-wide text-embed-brand-navy"
          aria-label={`Overall match rating: ${viewModel.score} out of 5 stars`}
        >
          {renderStars(viewModel.score)}
        </p>
      </div>

      <div className="mt-4 border-t border-embed-neutral-200/80 pt-4">
        <h4 className="text-xs font-medium uppercase tracking-wide text-embed-foreground-tertiary">
          Strengths
        </h4>
        <ul className="mt-2 space-y-1.5" aria-label="Strengths">
          {strengths.map((strength) => (
            <li
              key={strength}
              className="flex items-start gap-2 text-sm leading-snug text-embed-foreground-primary"
            >
              <span className="mt-px shrink-0 text-embed-brand-navy" aria-hidden="true">
                ✓
              </span>
              <span>{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 border-t border-embed-neutral-200/80 pt-4">
        <h4 className="text-xs font-medium uppercase tracking-wide text-embed-foreground-tertiary">
          Considerations
        </h4>
        <ul className="mt-2 space-y-1.5" aria-label="Considerations">
          {considerations.map((consideration) => (
            <li
              key={consideration}
              className="flex items-start gap-2 text-sm leading-snug text-embed-foreground-muted"
            >
              <span className="mt-px shrink-0" aria-hidden="true">
                •
              </span>
              <span>{consideration}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 border-t border-embed-neutral-200/80 pt-4">
        <h4 className="text-xs font-medium uppercase tracking-wide text-embed-foreground-tertiary">
          Next Step
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-embed-foreground-secondary">
          {viewModel.nextStep}
        </p>
        <button
          type="button"
          className={`mt-4 ${DECISION_CTA_FOCUS_CLASS} ${DECISION_CTA_ENABLED_CLASS}`}
        >
          Continue →
        </button>
      </div>
    </section>
  );
}
