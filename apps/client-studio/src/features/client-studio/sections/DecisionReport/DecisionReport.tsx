import type { Experience } from '@embed-engine/core/experience';

import { SECTION_SURFACE_CLASS } from '../../section-surface';

export type DecisionReportProps = {
  experience: Experience;
};

/**
 * Decision Report — structured Experience presentation.
 * Pure renderer; owns no Priority, Object, Composer, or Fragments.
 */
export function DecisionReport({ experience }: DecisionReportProps) {
  return (
    <article
      className={`mt-section ${SECTION_SURFACE_CLASS} p-section`}
      data-experience-id={experience.id}
      data-testid="decision-report"
      aria-label="Decision Report"
    >
      <header className="border-b border-embed-foreground-primary/10 pb-section">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
          Decision Report
        </p>
        <h2 className="mt-2 text-base font-semibold text-embed-foreground-primary">
          {experience.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-embed-foreground-primary/80">
          {experience.summary}
        </p>
      </header>

      <section className="mt-section" aria-labelledby="decision-report-focus">
        <h3
          id="decision-report-focus"
          className="text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45"
        >
          Focus
        </h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-embed-foreground-primary/70">
          {experience.focus.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      <section className="mt-section" aria-labelledby="decision-report-evidence">
        <h3
          id="decision-report-evidence"
          className="text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45"
        >
          Evidence
        </h3>
        <dl
          className="mt-2 space-y-3 text-sm"
          data-testid="decision-report-evidence"
        >
          {experience.evidence.map((item) => (
            <div key={item.id}>
              <dt className="font-medium text-embed-foreground-primary">
                {item.title}
              </dt>
              <dd className="mt-0.5 text-embed-foreground-primary/70">
                {item.description}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-section" aria-labelledby="decision-report-concerns">
        <h3
          id="decision-report-concerns"
          className="text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45"
        >
          Concerns
        </h3>
        <dl
          className="mt-2 space-y-3 text-sm"
          data-testid="decision-report-concerns"
        >
          {experience.concerns.map((item) => (
            <div key={item.id}>
              <dt className="font-medium text-embed-foreground-primary">
                {item.title}{' '}
                <span className="text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
                  ({item.severity})
                </span>
              </dt>
              <dd className="mt-0.5 text-embed-foreground-primary/70">
                {item.description}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        className="mt-section"
        aria-labelledby="decision-report-recommendations"
      >
        <h3
          id="decision-report-recommendations"
          className="text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45"
        >
          Recommendations
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-embed-foreground-primary/70">
          {experience.recommendations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section
        className="mt-section"
        aria-labelledby="decision-report-confidence"
      >
        <h3
          id="decision-report-confidence"
          className="text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45"
        >
          Confidence
        </h3>
        <div
          className="mt-2 space-y-1 text-sm text-embed-foreground-primary/70"
          data-testid="decision-report-confidence"
        >
          <p className="font-medium text-embed-foreground-primary">
            {experience.confidence.level} · {experience.confidence.score}
          </p>
          <p className="leading-relaxed">{experience.confidence.explanation}</p>
        </div>
      </section>
    </article>
  );
}
