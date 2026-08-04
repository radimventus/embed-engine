import {
  buildCanveloIndicators,
  PILOT_CANVELO_STEPS,
  type PilotWorkspaceCase,
} from '../../../office/pilotWorkspaceModel';

type PilotTerminalWorkflowProps = {
  readonly activeCase: PilotWorkspaceCase | null;
};

/**
 * CAP-OP-02 — Workflow workspace for commercial steps (no runtime).
 */
export function PilotTerminalWorkflow({
  activeCase,
}: PilotTerminalWorkflowProps) {
  const indicators =
    activeCase !== null ? buildCanveloIndicators(activeCase.status) : null;

  return (
    <div
      className="office-pilot-terminal__view"
      data-testid="pilot-terminal-workflow"
    >
      <header className="office-pilot-terminal__view-head">
        <h3 className="office-pilot-ws__panel-title">Workflow</h3>
        <p className="office-pilot-ws__panel-body">
          Pracovní plocha kroků obchodního případu. Workflow Runtime přijde
          později — PT-05 připravuje strukturu.
        </p>
      </header>

      <div
        className="office-pilot-workflow-board"
        data-testid="pilot-workflow-board"
      >
        {PILOT_CANVELO_STEPS.map((step) => {
          const state =
            indicators?.find((item) => item.id === step.id)?.state ?? 'todo';
          return (
            <article
              key={step.id}
              className={`office-pilot-workflow-board__step office-pilot-workflow-board__step--${state}`}
              data-testid={`pilot-workflow-step-${step.id}`}
              data-step-state={state}
            >
              <h4>{step.label}</h4>
              <p>
                {state === 'current'
                  ? 'Aktivní krok — připraveno pro runtime akci.'
                  : state === 'done'
                    ? 'Dokončeno (UI indikace).'
                    : 'Čeká — bez runtime logiky.'}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
