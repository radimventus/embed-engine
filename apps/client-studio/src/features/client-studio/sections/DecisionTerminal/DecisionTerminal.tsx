import { OutcomeCommitment } from './OutcomeCommitment';
import { TerminalShell } from './TerminalShell';
import { useDecisionTerminal } from './useDecisionTerminal';
import { PILOT_TERMS } from '../../pilot/pilotVocabulary';

/**
 * Decision Terminal MVP — Pack copy + Czech chrome (S-006A).
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
        title="Připravujeme cestu Rozhodnutí"
        body="Načítá se session. Priorita a Rozhodovací terminál sdílejí stejnou Interpretaci."
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
        title="Cesta Rozhodnutí není dostupná"
        body={
          definition === null && activeMoveId !== null
            ? `Krok „${activeMoveId}“ nemá prezentaci v Behavior Packu.`
            : 'Obnovte experience a pokračujte v průvodci Rozhodnutí.'
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
            ? `Veďte Rozhodnutí: ${topic}`
            : 'Začněte Rozhodnutí o dispozici'
        }
        body={
          next ??
          'Dispozice první. Krása druhá. Jedna cesta od Priority k jasnému Výsledku dispozice.'
        }
        hint={
          topic
            ? 'Navazuje na aktivní Prioritu — ostatní plochy zůstávají synchronní.'
            : undefined
        }
        action={{
          label: pending ? 'Spouštím…' : 'Začít Rozhodnutí o dispozici',
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
        eyebrow={`${PILOT_TERMS.decisionTerminal} · Krok ${completedCount + 1}/${totalMoves}`}
        intent={definition.intent}
        title={definition.purpose}
        body={definition.advisorPrompt}
        tradeOff={definition.tradeOff}
        householdProfile={householdDraft}
        onSelectHousehold={setHouseholdDraft}
        action={{
          label: pending
            ? 'Aktualizuji…'
            : (definition.ctaLabel ?? 'Pokračovat s touto domácností'),
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
        eyebrow={`${PILOT_TERMS.decisionTerminal} · Krok ${completedCount + 1}/${totalMoves}`}
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
      title="Tento krok nelze zobrazit"
      body="Aktivní krok Story se nepodařilo prezentovat. Zkuste znovu od Priority."
    />
  );
}
