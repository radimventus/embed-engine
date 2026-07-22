import type { ReactNode } from 'react';

import {
  DECISION_TERMINAL_CHROME_CS,
  formatDecisionKeyCs,
} from '../../pilot/decisionTerminalLabels';
import { formatOutcomeStatusCs } from '../../pilot/pilotVocabulary';
import type { DecisionPresentation } from '../../runtime/projectDecisionPresentation';

type OutcomeCardsProps = {
  readonly outcome: DecisionPresentation['outcome'];
};

type CardProps = {
  readonly title: string;
  readonly children: ReactNode;
};

function OutcomeCard({ title, children }: CardProps) {
  return (
    <article className="rounded-[8px] border border-embed-border-default bg-embed-background-primary px-3 py-3">
      <h5 className="text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        {title}
      </h5>
      <div className="mt-2 text-sm text-embed-foreground-primary/80">{children}</div>
    </article>
  );
}

/**
 * Trade-off / Outcome Cards — structured Runtime Outcome fields (CSCB-05 / 05A).
 */
export function OutcomeCards({ outcome }: OutcomeCardsProps) {
  const strengths = outcome.strengths.slice(0, 5).map(formatDecisionKeyCs);
  const considerations = outcome.considerations
    .slice(0, 5)
    .map(formatDecisionKeyCs);

  return (
    <section
      aria-label={DECISION_TERMINAL_CHROME_CS.outcomes}
      className="mt-5 grid grid-cols-2 gap-3 mobile:grid-cols-1"
    >
      <OutcomeCard title={DECISION_TERMINAL_CHROME_CS.outcomeStatus}>
        <p className="font-medium text-embed-foreground-primary">
          {formatOutcomeStatusCs(outcome.status)}
        </p>
        <p className="mt-1 text-xs">
          {DECISION_TERMINAL_CHROME_CS.confidence}{' '}
          {Math.round(outcome.confidence * 100)} %
        </p>
      </OutcomeCard>

      <OutcomeCard title={DECISION_TERMINAL_CHROME_CS.recommendation}>
        <p className="font-medium text-embed-foreground-primary">
          {formatDecisionKeyCs(outcome.recommendation)}
        </p>
        <p className="mt-1 text-xs">
          {DECISION_TERMINAL_CHROME_CS.nextStep}:{' '}
          {formatDecisionKeyCs(outcome.recommendedNextAction)}
        </p>
      </OutcomeCard>

      <OutcomeCard title={DECISION_TERMINAL_CHROME_CS.strengths}>
        {strengths.length === 0 ? (
          <p className="text-xs text-embed-foreground-primary/55">—</p>
        ) : (
          <ul className="list-disc space-y-1 pl-4">
            {strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </OutcomeCard>

      <OutcomeCard title={DECISION_TERMINAL_CHROME_CS.considerations}>
        {considerations.length === 0 ? (
          <p className="text-xs text-embed-foreground-primary/55">—</p>
        ) : (
          <ul className="list-disc space-y-1 pl-4">
            {considerations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </OutcomeCard>
    </section>
  );
}
