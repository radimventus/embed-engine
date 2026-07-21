import { useEffect, useState } from 'react';
import type { DecisionOutcome } from '@embed-engine/core/decision-layer';
import {
  getDecisionFactors,
  storyConsideredStairs,
  type DecisionFactor,
  type HouseholdProfile,
} from '@embed-engine/object-house';
import { PrimaryButton } from '@embed-engine/ui';

import {
  formatOutcomeStatusCs,
  PILOT_SECTION_IDS,
  PILOT_TERMS,
} from '../../pilot/pilotVocabulary';
import { PRIORITY_ENGINE_INTRO_PANEL_CLASS } from '../PriorityEngine/priority-engine-layout';

export type LayoutCommitment = 'continue-with-layout' | 'layout-does-not-fit';

type OutcomeCommitmentProps = {
  outcome: DecisionOutcome;
  profile: HouseholdProfile | null;
  slots: readonly { readonly moveId: string; readonly status: string }[];
  storyId: string;
  pending: boolean;
  nextAction?: string;
  onCommit: (commitment: LayoutCommitment) => void;
  withTransition: (action: () => void) => void;
  onPendingClear: () => void;
};

/**
 * Outcome as Decision Commitment — Story outcome + presentation commitment.
 * Commitment emits Signal via `onCommit`; scroll to Audit is presentation-only.
 */
export function OutcomeCommitment({
  outcome,
  profile,
  slots,
  storyId,
  pending,
  nextAction,
  onCommit,
  withTransition,
  onPendingClear,
}: OutcomeCommitmentProps) {
  const [commitment, setCommitment] = useState<LayoutCommitment | null>(null);

  useEffect(() => {
    setCommitment(null);
  }, [storyId, outcome.status, outcome.summary]);

  const factors = getDecisionFactors(profile ?? undefined, {
    stairsConsidered: storyConsideredStairs(slots),
  });

  const layoutClosed = commitment !== null;

  const choose = (next: LayoutCommitment) => {
    if (pending) {
      return;
    }
    setCommitment(next);
    onCommit(next);
  };

  if (layoutClosed) {
    return (
      <aside
        aria-label={PILOT_TERMS.decisionTerminal}
        aria-busy={pending}
        className={`${PRIORITY_ENGINE_INTRO_PANEL_CLASS} overflow-y-auto`}
        data-testid="decision-terminal"
        data-outcome={outcome.status}
        data-commitment={commitment}
        data-layout-closed="true"
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
          {PILOT_TERMS.commitment} zaznamenán
        </p>
        <p className="mt-2 text-sm font-medium text-embed-foreground-primary">
          {commitment === 'continue-with-layout'
            ? 'Zvolili jste pokračovat s touto dispozicí.'
            : 'Rozhodli jste, že tato dispozice vám nevyhovuje.'}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-embed-foreground-primary/80">
          Obě cesty jsou úspěšné {PILOT_TERMS.decision.toLowerCase()}. Dispozice je
          uzavřená. {PILOT_TERMS.nextStep}: {PILOT_TERMS.audit} — zda pozemek
          podporuje, jak chcete bydlet.
        </p>
        {nextAction ? (
          <p className="mt-2 text-xs leading-relaxed text-embed-foreground-primary/55">
            {nextAction}
          </p>
        ) : null}
        <PrimaryButton
          size="sm"
          className="mt-4 self-start"
          disabled={pending}
          data-testid="decision-terminal-cta"
          onClick={() => {
            withTransition(() => {
              document
                .getElementById(PILOT_SECTION_IDS.audit)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              window.setTimeout(onPendingClear, 600);
            });
          }}
        >
          {pending
            ? `Otevírám ${PILOT_TERMS.audit}…`
            : `Pokračovat k ${PILOT_TERMS.audit}u`}
        </PrimaryButton>
      </aside>
    );
  }

  return (
    <aside
      aria-label={PILOT_TERMS.decisionTerminal}
      aria-busy={pending}
      className={`${PRIORITY_ENGINE_INTRO_PANEL_CLASS} overflow-y-auto`}
      data-testid="decision-terminal"
      data-outcome={outcome.status}
      data-commitment="pending"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
        Váš {PILOT_TERMS.outcome.toLowerCase()} dispozice
      </p>
      <p className="mt-2 text-sm font-medium text-embed-foreground-primary">
        {formatOutcomeStatusCs(outcome.status)}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-embed-foreground-primary/80">
        {outcome.summary}
      </p>

      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Faktory Rozhodnutí
      </p>
      <ul className="mt-2 flex flex-col gap-1.5" data-testid="decision-factors">
        {factors.map((factor) => (
          <DecisionFactorRow key={factor.id} factor={factor} />
        ))}
      </ul>

      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Váš {PILOT_TERMS.commitment}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-embed-foreground-primary/60">
        Toto je vaše Rozhodnutí o dispozici — ne skóre k přijetí. Obě volby jsou
        úspěšný {PILOT_TERMS.outcome.toLowerCase()}.
      </p>

      <PrimaryButton
        size="sm"
        className="mt-4 self-start"
        disabled={pending}
        data-testid="decision-terminal-cta"
        onClick={() => choose('continue-with-layout')}
      >
        Pokračovat s touto dispozicí
      </PrimaryButton>
      <button
        type="button"
        className="mt-2 self-start text-left text-xs font-medium text-embed-foreground-primary/65 underline-offset-2 hover:text-embed-foreground-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/40 disabled:opacity-50"
        data-testid="decision-terminal-secondary"
        disabled={pending}
        onClick={() => choose('layout-does-not-fit')}
      >
        Tato dispozice mi nevyhovuje
      </button>
    </aside>
  );
}

function DecisionFactorRow({ factor }: { factor: DecisionFactor }) {
  const mark = factor.tone === 'support' ? '✓' : '⚠';
  return (
    <li className="flex gap-2 text-xs leading-relaxed text-embed-foreground-primary/80">
      <span aria-hidden="true" className="shrink-0 font-semibold text-embed-brand-gold">
        {mark}
      </span>
      <span>{factor.label}</span>
    </li>
  );
}
