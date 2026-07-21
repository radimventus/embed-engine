import { OutcomeCommitment } from './OutcomeCommitment';
import { TerminalShell } from './TerminalShell';
import { useDecisionTerminal } from './useDecisionTerminal';
import { PILOT_TERMS } from '../../pilot/pilotVocabulary';

/**
 * Decision Terminal MVP (S-004 / ADR-008 Accepted).
 * Session Story + Interpretation context; Signals only for cognitive intent.
 * Pack supplies advisorPrompt, ctaLabel, whyNow where present (S-005).
 */
export function DecisionTerminal() {
  const terminal = useDecisionTerminal();
  const {
    phase,
    pending,
    clearPending,
    withTransition,
    story,
    definition,
    outcome,
    activeMoveId,
    completedCount,
    totalMoves,
    sessionProfile,
    householdDraft,
    setHouseholdDraft,
    interpretation,
    startDialogue,
    submitHousehold,
    commitLayout,
    moveBody,
    moveAction,
    whyNow,
  } = terminal;

  if (phase === 'loading') {
    return (
      <TerminalShell
        testId="decision-terminal"
        loading
        pending={false}
        eyebrow={PILOT_TERMS.decisionTerminal}
        title="Preparing your Decision path"
        body="The session is loading. Priority and Decision Terminal sync on the same Interpretation."
      />
    );
  }

  if (phase === 'error') {
    return (
      <TerminalShell
        testId="decision-terminal"
        error
        pending={false}
        eyebrow={PILOT_TERMS.decisionTerminal}
        title="Decision path unavailable"
        body={
          definition === null && activeMoveId !== null
            ? `Move “${activeMoveId}” has no presentation definition in the Behavior Pack.`
            : 'Reload the experience to continue the guided Decision.'
        }
      />
    );
  }

  if (phase === 'outcome' && outcome && story) {
    return (
      <OutcomeCommitment
        outcome={outcome}
        profile={sessionProfile}
        slots={story.slots}
        storyId={story.id}
        pending={pending}
        nextAction={interpretation?.nextAction}
        onCommit={commitLayout}
        withTransition={withTransition}
        onPendingClear={clearPending}
      />
    );
  }

  if (phase === 'idle') {
    const topic = interpretation?.activeTopic;
    const next = interpretation?.nextAction;
    return (
      <TerminalShell
        testId="decision-terminal"
        empty
        pending={pending}
        eyebrow={PILOT_TERMS.decisionTerminal}
        title={
          topic
            ? `Guide your ${topic} Decision`
            : 'Start the disposition Decision'
        }
        body={
          next ??
          'Disposition first. Beauty second. One guided path from Priority to a clear layout Outcome.'
        }
        hint={
          topic
            ? 'Starts from your active Priority — peers stay synchronized.'
            : undefined
        }
        action={{
          label: pending ? 'Starting…' : 'Start disposition Decision',
          run: startDialogue,
        }}
      />
    );
  }

  if (phase === 'household' && definition && activeMoveId) {
    return (
      <TerminalShell
        testId="decision-terminal"
        activeMove={activeMoveId}
        pending={pending}
        eyebrow={`${PILOT_TERMS.decisionTerminal} · Move ${completedCount + 1}/${totalMoves}`}
        intent={definition.intent}
        title={definition.purpose}
        body={definition.advisorPrompt}
        tradeOff={definition.tradeOff}
        householdProfile={householdDraft}
        onSelectHousehold={setHouseholdDraft}
        action={{
          label: pending
            ? 'Updating…'
            : (definition.ctaLabel ?? 'Continue with this household'),
          disabled: householdDraft === null || pending,
          run: submitHousehold,
        }}
      />
    );
  }

  if (phase === 'move' && definition && activeMoveId && moveAction && moveBody) {
    return (
      <TerminalShell
        testId="decision-terminal"
        activeMove={activeMoveId}
        pending={pending}
        eyebrow={`${PILOT_TERMS.decisionTerminal} · Move ${completedCount + 1}/${totalMoves}`}
        intent={definition.intent}
        title={definition.purpose}
        whyNow={whyNow}
        body={moveBody}
        tradeOff={definition.tradeOff}
        action={moveAction}
      />
    );
  }

  return (
    <TerminalShell
      testId="decision-terminal"
      error
      pending={false}
      eyebrow={PILOT_TERMS.decisionTerminal}
      title="Unable to render this step"
      body="The active Story step could not be presented. Try restarting from Priority."
    />
  );
}
