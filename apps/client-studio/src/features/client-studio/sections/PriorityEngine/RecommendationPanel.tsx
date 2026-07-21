import { Panel, PrimaryButton } from '@embed-engine/ui';

import { useInterpretation } from '../../cognitive/InterpretationProvider';
import {
  CHAPTER_PANEL_DIVIDER_CLASS,
  CHAPTER_PANEL_LABEL_CLASS,
} from '../../chapter-layout';
import {
  RECOMMENDATION_MAX_CONSIDERATIONS,
  RECOMMENDATION_MAX_STRENGTHS,
  type RecommendationViewModel,
} from './RecommendationViewModel';

function renderStars(score: number): string {
  const filled = Math.min(5, Math.max(0, Math.round(score)));
  return `${'★'.repeat(filled)}${'☆'.repeat(5 - filled)}`;
}

/**
 * Recommendation peer — Session Interpretation only (RI-003 / EX-02).
 * No mock Cognitive meaning; no Runtime / DecisionState access.
 */
export function RecommendationPanel() {
  const interpretation = useInterpretation();
  const leading =
    interpretation.priorities.find((priority) => priority.weight === 1) ??
    interpretation.priorities.find((priority) => priority.highlighted);

  const viewModel: RecommendationViewModel = {
    title: `${interpretation.activeTopic} recommendation`,
    score: Math.max(1, Math.round((leading?.weight ?? 0.4) * 5)),
    strengths: interpretation.recommendations.slice(0, RECOMMENDATION_MAX_STRENGTHS),
    considerations: interpretation.recommendedQuestions
      .slice(0, RECOMMENDATION_MAX_CONSIDERATIONS)
      .map((question) => question.why),
    nextStep: interpretation.nextAction,
  };

  const strengths = viewModel.strengths;
  const considerations = viewModel.considerations;

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
