import { useEffect, useState } from 'react';
import {
  HOUSEHOLD_CHOICES,
  HOUSEHOLD_PROFILE_FACT_KEY,
  isHouseholdProfile,
  recommendPromptFor,
  type HouseholdProfile,
} from '@embed-engine/object-house';
import { PrimaryButton } from '@embed-engine/ui';

import {
  applyQuestionOpened,
  useApplyCognitiveSignal,
} from '../../cognitive/CognitiveRuntimeContext';
import { useExperienceSession } from '../../cognitive/ExperienceBindingProvider';
import { useActiveDecisionMove } from '../../cognitive/DecisionStoryProvider';
import { useWalkthrough } from '../../../walkthrough';
import { PRIORITY_ENGINE_INTRO_PANEL_CLASS } from '../PriorityEngine/priority-engine-layout';
import { OutcomeCommitment } from './OutcomeCommitment';

const STAIRS_WHY_NOW =
  'Because you just explored another floor, there is one additional aspect worth considering.';

type TerminalAction = {
  readonly label: string;
  readonly run: () => void;
  readonly disabled?: boolean;
};

/**
 * Decision Terminal — Experience Surface for the active Decision Story.
 * Slice D: Outcome is a Decision Commitment (layout closed → site evaluation).
 */
export function DecisionTerminal() {
  const applySignal = useApplyCognitiveSignal();
  const session = useExperienceSession();
  const walkthrough = useWalkthrough();
  const { story, definition, outcome, activeMoveId } = useActiveDecisionMove();
  const [pending, setPending] = useState(false);
  const [householdProfile, setHouseholdProfile] = useState<HouseholdProfile | null>(
    null,
  );

  const sessionProfile = readSessionHouseholdProfile(session.facts);

  useEffect(() => {
    setPending(false);
  }, [activeMoveId, outcome?.status, story?.id]);

  useEffect(() => {
    if (activeMoveId === 'layout.ask-household-shape') {
      setHouseholdProfile(sessionProfile);
      return;
    }
    if (story === null || outcome !== null) {
      setHouseholdProfile(null);
    }
  }, [activeMoveId, outcome, sessionProfile, story]);

  const withTransition = (action: () => void) => {
    if (pending) {
      return;
    }
    setPending(true);
    action();
  };

  if (outcome && story) {
    return (
      <OutcomeCommitment
        outcome={outcome}
        profile={sessionProfile}
        slots={story.slots}
        storyId={story.id}
        pending={pending}
        withTransition={withTransition}
        onPendingClear={() => setPending(false)}
      />
    );
  }

  if (story === null || definition === null || activeMoveId === null) {
    return (
      <TerminalShell
        testId="decision-terminal"
        empty
        pending={pending}
        eyebrow="Decision Terminal"
        title="Start the Layout decision dialogue"
        body="Disposition first. Beauty second. One guided path from Priority to a clear layout verdict."
        action={{
          label: pending ? 'Starting…' : 'Start disposition dialogue',
          run: () => {
            withTransition(() => {
              applyQuestionOpened(
                applySignal,
                'layout',
                'Priority focus: Dispozice',
              );
            });
          },
        }}
      />
    );
  }

  const completedCount = story.slots.filter((slot) => slot.status === 'completed').length;
  const isStairsWarn = activeMoveId === 'layout.warn-stairs-mobility';
  const body =
    activeMoveId === 'layout.recommend-disposition-fit'
      ? recommendPromptFor(sessionProfile ?? undefined)
      : definition.advisorPrompt;

  if (activeMoveId === 'layout.ask-household-shape') {
    return (
      <TerminalShell
        testId="decision-terminal"
        activeMove={activeMoveId}
        pending={pending}
        eyebrow={`Decision Terminal · Move ${completedCount + 1}/${story.slots.length}`}
        intent={definition.intent}
        title={definition.purpose}
        body={definition.advisorPrompt}
        tradeOff={definition.tradeOff}
        householdProfile={householdProfile}
        onSelectHousehold={setHouseholdProfile}
        action={{
          label: pending ? 'Updating…' : 'Continue with this household',
          disabled: householdProfile === null || pending,
          run: () => {
            if (householdProfile === null) {
              return;
            }
            withTransition(() => {
              applyQuestionOpened(
                applySignal,
                activeMoveId,
                `Household: ${householdProfile}`,
                { householdProfile },
              );
            });
          },
        }}
      />
    );
  }

  const action = resolveMoveAction(activeMoveId, {
    pending,
    withTransition,
    applySignal,
    selectRoom: walkthrough.selectRoom,
    purpose: definition.purpose,
  });

  return (
    <TerminalShell
      testId="decision-terminal"
      activeMove={activeMoveId}
      pending={pending}
      eyebrow={`Decision Terminal · Move ${completedCount + 1}/${story.slots.length}`}
      intent={definition.intent}
      title={definition.purpose}
      whyNow={isStairsWarn ? STAIRS_WHY_NOW : undefined}
      body={body}
      tradeOff={definition.tradeOff}
      action={action}
    />
  );
}

function readSessionHouseholdProfile(
  facts: Readonly<Record<string, unknown>>,
): HouseholdProfile | null {
  const value = facts[HOUSEHOLD_PROFILE_FACT_KEY];
  return isHouseholdProfile(value) ? value : null;
}

function resolveMoveAction(
  activeMoveId: string,
  ctx: {
    pending: boolean;
    withTransition: (action: () => void) => void;
    applySignal: ReturnType<typeof useApplyCognitiveSignal>;
    selectRoom: (roomId: string) => void;
    purpose: string;
  },
): TerminalAction {
  const { pending, withTransition, applySignal, selectRoom, purpose } = ctx;

  if (activeMoveId === 'layout.discover-day-zone') {
    return {
      label: pending ? 'Updating…' : 'Open living room',
      run: () => {
        withTransition(() => {
          selectRoom('living-room');
        });
      },
    };
  }

  if (activeMoveId === 'layout.discover-night-zone') {
    return {
      label: pending ? 'Updating…' : 'Open bedroom',
      run: () => {
        withTransition(() => {
          selectRoom('bedroom');
        });
      },
    };
  }

  if (activeMoveId === 'layout.recommend-disposition-fit') {
    return {
      label: pending ? 'Updating…' : 'Confirm verdict',
      run: () => {
        withTransition(() => {
          applyQuestionOpened(
            applySignal,
            activeMoveId,
            `Move acknowledged: ${purpose}`,
          );
        });
      },
    };
  }

  return {
    label: pending ? 'Updating…' : 'Continue',
    run: () => {
      withTransition(() => {
        applyQuestionOpened(
          applySignal,
          activeMoveId,
          `Move acknowledged: ${purpose}`,
        );
      });
    },
  };
}

type TerminalShellProps = {
  testId: string;
  pending: boolean;
  eyebrow: string;
  title: string;
  body: string;
  action: TerminalAction;
  intent?: string;
  tradeOff?: string;
  hint?: string;
  whyNow?: string;
  empty?: boolean;
  outcome?: string;
  activeMove?: string;
  householdProfile?: HouseholdProfile | null;
  onSelectHousehold?: (profile: HouseholdProfile) => void;
};

function TerminalShell({
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
  outcome,
  activeMove,
  householdProfile,
  onSelectHousehold,
}: TerminalShellProps) {
  return (
    <aside
      aria-label="Decision Terminal"
      aria-busy={pending}
      className={`${PRIORITY_ENGINE_INTRO_PANEL_CLASS} overflow-y-auto`}
      data-testid={testId}
      data-empty={empty ? 'true' : undefined}
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
                className={`rounded-[8px] border px-3 py-2 text-left transition-colors ${
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
        >
          Advancing…
        </p>
      ) : null}
      <PrimaryButton
        size="sm"
        className="mt-4 self-start"
        disabled={action.disabled === true || pending}
        data-testid="decision-terminal-cta"
        onClick={action.run}
      >
        {action.label}
      </PrimaryButton>
    </aside>
  );
}
