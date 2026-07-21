import { Panel, PrimaryButton } from '@embed-engine/ui';
import type { Experience } from '@embed-engine/core/experience';

import {
  CHAPTER_PANEL_DIVIDER_CLASS,
  CHAPTER_PANEL_LABEL_CLASS,
} from '../../chapter-layout';
import { recommendationViewFromExperience } from './RecommendationViewModel';

export type RecommendationPanelProps = {
  experience: Experience;
};

/**
 * Recommendation peer — pure Experience renderer.
 * No Interpretation scoring, no mock semantics.
 */
export function RecommendationPanel({ experience }: RecommendationPanelProps) {
  const viewModel = recommendationViewFromExperience(experience);

  return (
    <Panel
      as="section"
      aria-label="Doporučení"
      variant="inset"
      className="mt-section"
      data-experience-id={experience.id}
    >
      <h3 className="text-sm font-semibold tracking-wide text-embed-foreground-primary">
        {viewModel.title}
      </h3>

      <div className={CHAPTER_PANEL_DIVIDER_CLASS}>
        <p className={CHAPTER_PANEL_LABEL_CLASS}>Míra jistoty doporučení</p>
        <p
          className="mt-1 text-base leading-none tracking-wide text-embed-brand-gold"
          aria-label={`Míra jistoty: ${viewModel.matchLabel}, skóre ${viewModel.matchScore}`}
        >
          {viewModel.matchLabel} · {viewModel.matchScore}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-embed-foreground-primary/70">
          {viewModel.matchExplanation}
        </p>
      </div>

      <div className={CHAPTER_PANEL_DIVIDER_CLASS}>
        <h4 className={CHAPTER_PANEL_LABEL_CLASS}>Proč toto doporučení</h4>
        <ul className="mt-2 space-y-1.5" aria-label="Proč toto doporučení">
          {viewModel.strengths.map((strength) => (
            <li
              key={strength}
              className="flex items-start gap-2 text-sm leading-snug text-embed-foreground-primary"
            >
              <span
                className="mt-px shrink-0 text-embed-brand-gold"
                aria-hidden="true"
              >
                ✓
              </span>
              <span>{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={CHAPTER_PANEL_DIVIDER_CLASS}>
        <h4 className={CHAPTER_PANEL_LABEL_CLASS}>Na co si dát pozor</h4>
        <ul className="mt-2 space-y-1.5" aria-label="Na co si dát pozor">
          {viewModel.considerations.map((consideration) => (
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
        <h4 className={CHAPTER_PANEL_LABEL_CLASS}>Další krok</h4>
        <p className="mt-2 text-sm leading-relaxed text-embed-foreground-primary/70">
          {viewModel.nextStep}
        </p>
        {viewModel.primaryActionLabel ? (
          <PrimaryButton type="button" className="mt-4">
            {viewModel.primaryActionLabel}
          </PrimaryButton>
        ) : null}
      </div>
    </Panel>
  );
}
