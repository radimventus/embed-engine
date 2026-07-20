import { useEffect, useState } from 'react';
import { PrimaryButton } from '@embed-engine/ui';

import {
  applyQuestionOpened,
  useApplyCognitiveSignal,
} from '../../cognitive/CognitiveRuntimeContext';
import { useActiveDecisionMove } from '../../cognitive/DecisionStoryProvider';
import { useWalkthrough } from '../../../walkthrough';
import { PRIORITY_ENGINE_INTRO_PANEL_CLASS } from '../PriorityEngine/priority-engine-layout';

const AUDIT_SECTION_ID = 'audit-lead-capture';

type TerminalAction = {
  readonly label: string;
  readonly run: () => void;
};

/**
 * Decision Terminal — Experience Surface for the active Decision Story.
 * Demo-hardened: every state has exactly one primary CTA and a valid transition.
 */
export function DecisionTerminal() {
  const applySignal = useApplyCognitiveSignal();
  const walkthrough = useWalkthrough();
  const { story, definition, outcome, activeMoveId } = useActiveDecisionMove();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setPending(false);
  }, [activeMoveId, outcome?.status, story?.id]);

  const withTransition = (action: () => void) => {
    if (pending) {
      return;
    }
    setPending(true);
    action();
  };

  if (outcome) {
    return (
      <TerminalShell
        testId="decision-terminal"
        outcome={outcome.status}
        pending={pending}
        eyebrow="Decision outcome"
        title={outcome.status.replace('-', ' ')}
        body={outcome.summary}
        action={{
          label: pending ? 'Opening audit…' : 'Continue to site audit',
          run: () => {
            withTransition(() => {
              document
                .getElementById(AUDIT_SECTION_ID)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              window.setTimeout(() => setPending(false), 600);
            });
          },
        }}
        hint="Run again: select Dispozice in Priority."
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
      body={definition.advisorPrompt}
      tradeOff={definition.tradeOff}
      action={action}
    />
  );
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
  empty?: boolean;
  outcome?: string;
  activeMove?: string;
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
  empty,
  outcome,
  activeMove,
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
      <p className="mt-3 text-sm leading-relaxed text-embed-foreground-primary/80">{body}</p>
      {tradeOff ? (
        <p className="mt-3 text-xs leading-relaxed text-embed-foreground-primary/55">
          Trade-off: {tradeOff}
        </p>
      ) : null}
      {hint ? (
        <p className="mt-3 text-xs text-embed-foreground-primary/55">{hint}</p>
      ) : null}
      {pending ? (
        <p className="mt-3 text-xs font-medium text-embed-brand-gold" data-testid="decision-terminal-pending">
          Advancing…
        </p>
      ) : null}
      <PrimaryButton
        size="sm"
        className="mt-4 self-start"
        disabled={pending}
        data-testid="decision-terminal-cta"
        onClick={action.run}
      >
        {action.label}
      </PrimaryButton>
    </aside>
  );
}
