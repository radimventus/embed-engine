import { Panel, PrimaryButton } from '@embed-engine/ui';

import {
  CHAPTER_PANEL_DIVIDER_CLASS,
  CHAPTER_PANEL_LABEL_CLASS,
} from '../../chapter-layout';
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
    <Panel as="section" aria-label="Recommendation" variant="inset" className="mt-section">
      <h3 className="text-sm font-semibold tracking-wide text-embed-foreground-primary">
        {viewModel.title}
      </h3>

      <div className={CHAPTER_PANEL_DIVIDER_CLASS}>
        <p className={CHAPTER_PANEL_LABEL_CLASS}>Overall Match</p>
        <p
          className="mt-1 text-base leading-none tracking-wide text-embed-brand-gold"
          aria-label={`Overall match rating: ${viewModel.score} out of 5 stars`}
        >
          {renderStars(viewModel.score)}
        </p>
      </div>

      <div className={CHAPTER_PANEL_DIVIDER_CLASS}>
        <h4 className={CHAPTER_PANEL_LABEL_CLASS}>Strengths</h4>
        <ul className="mt-2 space-y-1.5" aria-label="Strengths">
          {strengths.map((strength) => (
            <li
              key={strength}
              className="flex items-start gap-2 text-sm leading-snug text-embed-foreground-primary"
            >
              <span className="mt-px shrink-0 text-embed-brand-gold" aria-hidden="true">
                ✓
              </span>
              <span>{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={CHAPTER_PANEL_DIVIDER_CLASS}>
        <h4 className={CHAPTER_PANEL_LABEL_CLASS}>Considerations</h4>
        <ul className="mt-2 space-y-1.5" aria-label="Considerations">
          {considerations.map((consideration) => (
            <li
              key={consideration}
              className="flex items-start gap-2 text-sm leading-snug text-embed-foreground-primary/70"
            >
              <span className="mt-px shrink-0" aria-hidden="true">
                •
              </span>
              <span>{consideration}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={CHAPTER_PANEL_DIVIDER_CLASS}>
        <h4 className={CHAPTER_PANEL_LABEL_CLASS}>Next Step</h4>
        <p className="mt-2 text-sm leading-relaxed text-embed-foreground-primary/70">
          {viewModel.nextStep}
        </p>
        <PrimaryButton type="button" className="mt-4">
          Continue →
        </PrimaryButton>
      </div>
    </Panel>
  );
}
