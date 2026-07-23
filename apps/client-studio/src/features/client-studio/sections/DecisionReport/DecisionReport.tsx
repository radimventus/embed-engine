import {
  formatDecisionKeyCs,
} from '../../pilot/decisionTerminalLabels';
import { formatOutcomeStatusCs } from '../../pilot/pilotVocabulary';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { projectTerminalPresentation } from '../../runtime/projectTerminalPresentation';
import { SECTION_SURFACE_CLASS } from '../../section-surface';
import { PRIORITY_ENGINE_DECISION_REPORT_MAX_HEIGHT_PX } from '../PriorityEngine/priority-engine-layout';

/**
 * Decision Report — structured Terminal presentation (Experience Integration Pack 1).
 * Pure renderer with Czech presentation mapping — no semantic invention.
 * Max height constrained for Priority composition (PT-PRIORITY-REDESIGN-01).
 */
export function DecisionReport() {
  const { experience } = useDecisionSessionRuntime();
  const view = projectTerminalPresentation(experience.context.decision.terminal);
  const recommendation = formatDecisionKeyCs(view.recommendation);
  const status = formatOutcomeStatusCs(view.status);
  const nextAction = formatDecisionKeyCs(view.recommendedNextAction);

  return (
    <article
      className={`mt-section overflow-y-auto ${SECTION_SURFACE_CLASS} p-section`}
      style={{ maxHeight: PRIORITY_ENGINE_DECISION_REPORT_MAX_HEIGHT_PX }}
      data-terminal-id={view.id}
      data-testid="decision-report"
      aria-label="Report rozhodnutí"
    >
      <header className="border-b border-embed-foreground-primary/10 pb-section">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
          Report rozhodnutí
        </p>
        <h2 className="mt-2 text-base font-semibold text-embed-foreground-primary">
          {recommendation}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-embed-foreground-primary/80">
          {status}
        </p>
      </header>

      <section className="mt-section" aria-labelledby="decision-report-focus">
        <h3
          id="decision-report-focus"
          className="text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45"
        >
          Dokončené kroky
        </h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-embed-foreground-primary/70">
          {view.completedMoveIds.map((item) => (
            <li key={item}>{formatDecisionKeyCs(item)}</li>
          ))}
        </ol>
      </section>

      <section className="mt-section" aria-labelledby="decision-report-evidence">
        <h3
          id="decision-report-evidence"
          className="text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45"
        >
          Proč toto doporučení
        </h3>
        <dl
          className="mt-2 space-y-3 text-sm"
          data-testid="decision-report-evidence"
        >
          {view.rationale.map((key) => (
            <div key={key}>
              <dt className="font-medium text-embed-foreground-primary">
                {formatDecisionKeyCs(key)}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-section" aria-labelledby="decision-report-concerns">
        <h3
          id="decision-report-concerns"
          className="text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45"
        >
          Na co si dát pozor
        </h3>
        <dl
          className="mt-2 space-y-3 text-sm"
          data-testid="decision-report-concerns"
        >
          {view.unresolvedQuestions.map((key) => (
            <div key={key}>
              <dt className="font-medium text-embed-foreground-primary">
                {formatDecisionKeyCs(key)}
              </dt>
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
          Doporučení
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-embed-foreground-primary/70">
          <li>{recommendation}</li>
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
          Míra jistoty doporučení
        </h3>
        <div
          className="mt-2 space-y-1 text-sm text-embed-foreground-primary/70"
          data-testid="decision-report-confidence"
        >
          <p className="font-medium text-embed-foreground-primary">
            {Math.round(view.confidence * 100)} %
          </p>
        </div>
      </section>

      <section className="mt-section" aria-labelledby="decision-report-actions">
        <h3
          id="decision-report-actions"
          className="text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45"
        >
          Doporučené další kroky
        </h3>
        <ul
          className="mt-2 list-disc space-y-2 pl-5 text-sm text-embed-foreground-primary/70"
          data-testid="decision-report-actions"
        >
          <li>
            <span className="font-medium text-embed-foreground-primary">
              {nextAction}
            </span>
          </li>
        </ul>
      </section>
    </article>
  );
}
