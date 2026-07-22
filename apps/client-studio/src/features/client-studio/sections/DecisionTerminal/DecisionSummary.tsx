import {
  DECISION_TERMINAL_CHROME_CS,
  formatDecisionKeyCs,
} from '../../pilot/decisionTerminalLabels';
import { formatOutcomeStatusCs } from '../../pilot/pilotVocabulary';
import type { DecisionPresentation } from '../../runtime/projectDecisionPresentation';

type DecisionSummaryProps = {
  readonly summary: DecisionPresentation['summary'];
};

/**
 * Decision Summary — Runtime Outcome + Story focus (CSCB-05 / CSCB-05A).
 */
export function DecisionSummary({ summary }: DecisionSummaryProps) {
  return (
    <header aria-label="Shrnutí rozhodnutí" className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
        {DECISION_TERMINAL_CHROME_CS.title}
      </p>
      <h3 className="text-base font-semibold text-embed-foreground-primary">
        {formatDecisionKeyCs(summary.recommendation)}
      </h3>
      <p className="text-sm text-embed-foreground-primary/75">
        {formatOutcomeStatusCs(summary.status)}
        <span className="mx-2 text-embed-border-strong" aria-hidden="true">
          ·
        </span>
        {DECISION_TERMINAL_CHROME_CS.confidence}{' '}
        {Math.round(summary.confidence * 100)} %
      </p>
      <p className="text-sm leading-relaxed text-embed-foreground-primary/80">
        {formatDecisionKeyCs(summary.primaryExplanation)}
      </p>
      {summary.focusRoomName !== null ? (
        <p className="text-xs text-embed-foreground-primary/55">
          {DECISION_TERMINAL_CHROME_CS.focus}: {summary.focusRoomName}
          <span className="mx-1.5" aria-hidden="true">
            ·
          </span>
          {formatDecisionKeyCs(summary.focusReason)}
        </p>
      ) : (
        <p className="text-xs text-embed-foreground-primary/55">
          {formatDecisionKeyCs(summary.focusReason)}
        </p>
      )}
      <p className="text-sm font-medium text-embed-foreground-primary">
        {DECISION_TERMINAL_CHROME_CS.nextStep}:{' '}
        {formatDecisionKeyCs(summary.recommendedNextAction)}
      </p>
    </header>
  );
}
