import type { ReactNode } from 'react';

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
 * Outcome Cards — structured Runtime Outcome fields (CSCB-05).
 */
export function OutcomeCards({ outcome }: OutcomeCardsProps) {
  return (
    <section
      aria-label="Outcome Cards"
      className="mt-5 grid grid-cols-2 gap-3 mobile:grid-cols-1"
    >
      <OutcomeCard title="Výsledek">
        <p className="font-medium text-embed-foreground-primary">
          {formatOutcomeStatusCs(outcome.status)}
        </p>
        <p className="mt-1 text-xs">
          Jistota {Math.round(outcome.confidence * 100)} %
        </p>
      </OutcomeCard>

      <OutcomeCard title="Doporučení">
        <p className="font-medium text-embed-foreground-primary">
          {outcome.recommendation}
        </p>
        <p className="mt-1 text-xs">Další: {outcome.recommendedNextAction}</p>
      </OutcomeCard>

      <OutcomeCard title="Silné stránky">
        {outcome.strengths.length === 0 ? (
          <p className="text-xs text-embed-foreground-primary/55">—</p>
        ) : (
          <ul className="list-disc space-y-1 pl-4">
            {outcome.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </OutcomeCard>

      <OutcomeCard title="Na co si dát pozor">
        {outcome.considerations.length === 0 ? (
          <p className="text-xs text-embed-foreground-primary/55">—</p>
        ) : (
          <ul className="list-disc space-y-1 pl-4">
            {outcome.considerations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </OutcomeCard>
    </section>
  );
}
