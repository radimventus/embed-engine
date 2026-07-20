import { useEffect, useState } from 'react';
import type { DecisionOutcome } from '@embed-engine/core/decision-layer';
import {
  getDecisionFactors,
  storyConsideredStairs,
  type DecisionFactor,
  type HouseholdProfile,
} from '@embed-engine/object-house';
import { PrimaryButton } from '@embed-engine/ui';

import { PRIORITY_ENGINE_INTRO_PANEL_CLASS } from '../PriorityEngine/priority-engine-layout';

const AUDIT_SECTION_ID = 'audit-lead-capture';

export type LayoutCommitment = 'continue-with-layout' | 'layout-does-not-fit';

type OutcomeCommitmentProps = {
  outcome: DecisionOutcome;
  profile: HouseholdProfile | null;
  slots: readonly { readonly moveId: string; readonly status: string }[];
  storyId: string;
  pending: boolean;
  withTransition: (action: () => void) => void;
  onPendingClear: () => void;
};

/**
 * FP-01 Slice D — Outcome as Decision Commitment (Experience only).
 */
export function OutcomeCommitment({
  outcome,
  profile,
  slots,
  storyId,
  pending,
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

  if (layoutClosed) {
    return (
      <aside
        aria-label="Decision Terminal"
        aria-busy={pending}
        className={`${PRIORITY_ENGINE_INTRO_PANEL_CLASS} overflow-y-auto`}
        data-testid="decision-terminal"
        data-outcome={outcome.status}
        data-commitment={commitment}
        data-layout-closed="true"
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
          Layout decision closed
        </p>
        <p className="mt-2 text-sm font-medium text-embed-foreground-primary">
          {commitment === 'continue-with-layout'
            ? 'You chose to continue with this layout.'
            : 'You decided this layout does not fit your needs.'}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-embed-foreground-primary/80">
          Both paths are a successful decision. Layout is complete. The next chapter is site
          evaluation — whether the plot supports how you want to live.
        </p>
        <PrimaryButton
          size="sm"
          className="mt-4 self-start"
          disabled={pending}
          data-testid="decision-terminal-cta"
          onClick={() => {
            withTransition(() => {
              document
                .getElementById(AUDIT_SECTION_ID)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              window.setTimeout(onPendingClear, 600);
            });
          }}
        >
          {pending ? 'Opening site evaluation…' : 'Continue to Site Evaluation'}
        </PrimaryButton>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Decision Terminal"
      aria-busy={pending}
      className={`${PRIORITY_ENGINE_INTRO_PANEL_CLASS} overflow-y-auto`}
      data-testid="decision-terminal"
      data-outcome={outcome.status}
      data-commitment="pending"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
        Your layout decision
      </p>
      <p className="mt-2 text-sm font-medium capitalize text-embed-foreground-primary">
        {formatFitClass(outcome.status)}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-embed-foreground-primary/80">
        {outcome.summary}
      </p>

      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Decision factors
      </p>
      <ul className="mt-2 flex flex-col gap-1.5" data-testid="decision-factors">
        {factors.map((factor) => (
          <DecisionFactorRow key={factor.id} factor={factor} />
        ))}
      </ul>

      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/45">
        Your commitment
      </p>
      <p className="mt-1 text-xs leading-relaxed text-embed-foreground-primary/60">
        This is your decision about the layout — not a score to accept. Either choice is a
        successful outcome.
      </p>

      <PrimaryButton
        size="sm"
        className="mt-4 self-start"
        disabled={pending}
        data-testid="decision-terminal-cta"
        onClick={() => {
          if (pending) {
            return;
          }
          setCommitment('continue-with-layout');
        }}
      >
        Continue with this layout
      </PrimaryButton>
      <button
        type="button"
        className="mt-2 self-start text-left text-xs font-medium text-embed-foreground-primary/65 underline-offset-2 hover:text-embed-foreground-primary hover:underline disabled:opacity-50"
        data-testid="decision-terminal-secondary"
        disabled={pending}
        onClick={() => {
          if (pending) {
            return;
          }
          setCommitment('layout-does-not-fit');
        }}
      >
        This layout doesn&apos;t fit my needs
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

function formatFitClass(status: string): string {
  return status.replace(/-/g, ' ');
}
