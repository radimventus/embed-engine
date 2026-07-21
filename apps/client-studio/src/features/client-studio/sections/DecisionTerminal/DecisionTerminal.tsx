import { OutcomeCommitment } from './OutcomeCommitment';
import { TerminalShell } from './TerminalShell';
import { STAIRS_WHY_NOW, useDecisionTerminal } from './useDecisionTerminal';

/**
 * Decision Terminal MVP (S-004 / ADR-008 Accepted).
 * Session Story + Interpretation context; Signals only for cognitive intent.
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
    isStairsWarn,
  } = terminal;

  if (phase === 'loading') {
    return (
      <TerminalShell
        testId="decision-terminal"
        loading
        pending={false}
        eyebrow="Decision Terminal"
        title="Preparing your decision path"
        body="The session is loading. Priority and Terminal will sync on the same Interpretation."
      />
    );
  }

  if (phase === 'error') {
    return (
      <TerminalShell
        testId="decision-terminal"
        error
        pending={false}
        eyebrow="Decision Terminal"
        title="Decision path unavailable"
        body={
          definition === null && activeMoveId !== null
            ? `Move “${activeMoveId}” has no presentation definition in the Behavior Pack.`
            : 'Reload the experience to continue the guided dialogue.'
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
        eyebrow="Decision Terminal"
        title={topic ? `Guide your ${topic} decision` : 'Start the disposition dialogue'}
        body={
          next ??
          'Disposition first. Beauty second. One guided path from Priority to a clear layout verdict.'
        }
        hint={
          topic
            ? 'Starts from your current Priority focus — peers stay synchronized.'
            : undefined
        }
        action={{
          label: pending ? 'Starting…' : 'Start disposition dialogue',
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
        eyebrow={`Decision Terminal · Move ${completedCount + 1}/${totalMoves}`}
        intent={definition.intent}
        title={definition.purpose}
        body={definition.advisorPrompt}
        tradeOff={definition.tradeOff}
        householdProfile={householdDraft}
        onSelectHousehold={setHouseholdDraft}
        action={{
          label: pending ? 'Updating…' : 'Continue with this household',
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
        eyebrow={`Decision Terminal · Move ${completedCount + 1}/${totalMoves}`}
        intent={definition.intent}
        title={definition.purpose}
        whyNow={isStairsWarn ? STAIRS_WHY_NOW : undefined}
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
      eyebrow="Decision Terminal"
      title="Unable to render this step"
      body="The active Story step could not be presented. Try restarting from Priority."
    />
  );
}
