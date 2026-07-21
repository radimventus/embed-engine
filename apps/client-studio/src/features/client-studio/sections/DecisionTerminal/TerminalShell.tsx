import {
  HOUSEHOLD_CHOICES,
  type HouseholdProfile,
} from '@embed-engine/object-house';
import { PrimaryButton } from '@embed-engine/ui';

import { PRIORITY_ENGINE_INTRO_PANEL_CLASS } from '../PriorityEngine/priority-engine-layout';
import type { TerminalAction } from './useDecisionTerminal';

export type TerminalShellProps = {
  testId: string;
  pending: boolean;
  eyebrow: string;
  title: string;
  body: string;
  action?: TerminalAction;
  intent?: string;
  tradeOff?: string;
  hint?: string;
  whyNow?: string;
  empty?: boolean;
  loading?: boolean;
  error?: boolean;
  outcome?: string;
  activeMove?: string;
  householdProfile?: HouseholdProfile | null;
  onSelectHousehold?: (profile: HouseholdProfile) => void;
};

/**
 * Shared Terminal chrome — presentation only.
 */
export function TerminalShell({
  testId,
  pending,
  eyebrow,
  title,
  body,
  action,
  intent,
  tradeOff,
  hint,
  whyNow,
  empty,
  loading,
  error,
  outcome,
  activeMove,
  householdProfile,
  onSelectHousehold,
}: TerminalShellProps) {
  return (
    <aside
      aria-label="Decision Terminal"
      aria-busy={pending || loading === true}
      className={`${PRIORITY_ENGINE_INTRO_PANEL_CLASS} overflow-y-auto`}
      data-testid={testId}
      data-empty={empty ? 'true' : undefined}
      data-loading={loading ? 'true' : undefined}
      data-error={error ? 'true' : undefined}
      data-outcome={outcome}
      data-active-move={activeMove}
      data-pending={pending ? 'true' : undefined}
      data-household={householdProfile ?? undefined}
      data-reactive={whyNow ? 'true' : undefined}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-embed-brand-gold">
        {eyebrow}
      </p>
      {intent ? (
        <p className="mt-1 text-[10px] uppercase tracking-wide text-embed-foreground-primary/45">
          {intent}
        </p>
      ) : null}
      <p className="mt-2 text-sm font-medium text-embed-foreground-primary">{title}</p>
      {whyNow ? (
        <p
          className="mt-3 text-xs font-medium leading-relaxed text-embed-brand-gold"
          data-testid="decision-terminal-why-now"
        >
          {whyNow}
        </p>
      ) : null}
      <p className="mt-3 text-sm leading-relaxed text-embed-foreground-primary/80">{body}</p>
      {tradeOff ? (
        <p className="mt-3 text-xs leading-relaxed text-embed-foreground-primary/55">
          Trade-off: {tradeOff}
        </p>
      ) : null}
      {onSelectHousehold ? (
        <div
          className="mt-3 flex flex-col gap-2"
          role="radiogroup"
          aria-label="Household shape"
          data-testid="decision-terminal-household"
        >
          {HOUSEHOLD_CHOICES.map((choice) => {
            const selected = householdProfile === choice.id;
            return (
              <button
                key={choice.id}
                type="button"
                role="radio"
                aria-checked={selected}
                data-testid={`household-choice-${choice.id}`}
                className={`rounded-[8px] border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/40 ${
                  selected
                    ? 'border-embed-brand-gold bg-embed-brand-gold/15 text-embed-foreground-primary'
                    : 'border-embed-foreground-primary/15 bg-transparent text-embed-foreground-primary/80 hover:border-embed-brand-gold/40'
                }`}
                onClick={() => onSelectHousehold(choice.id)}
              >
                <span className="block text-xs font-semibold">{choice.label}</span>
                <span className="mt-0.5 block text-[11px] opacity-70">{choice.detail}</span>
              </button>
            );
          })}
        </div>
      ) : null}
      {hint ? (
        <p className="mt-3 text-xs text-embed-foreground-primary/55">{hint}</p>
      ) : null}
      {pending ? (
        <p
          className="mt-3 text-xs font-medium text-embed-brand-gold"
          data-testid="decision-terminal-pending"
          aria-live="polite"
        >
          Advancing Decision…
        </p>
      ) : null}
      {action ? (
        <PrimaryButton
          size="sm"
          className="mt-4 self-start"
          disabled={action.disabled === true || pending}
          data-testid="decision-terminal-cta"
          onClick={action.run}
        >
          {action.label}
        </PrimaryButton>
      ) : null}
    </aside>
  );
}
