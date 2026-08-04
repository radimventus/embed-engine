import { usePilotWorkspaceContext } from '../../../office/PilotWorkspaceContext';
import {
  PILOT_WORKFLOW_STEP_STATE_LABELS,
} from '../../../office/pilotWorkflowModel';

/**
 * CAP-OP-06 — Workflow terminal view mirrors navigator projection.
 */
export function PilotTerminalWorkflow() {
  const { activeCase, workflow, navigateWorkflowStep } =
    usePilotWorkspaceContext();

  return (
    <div
      className="office-pilot-terminal__view"
      data-testid="pilot-terminal-workflow"
      data-workflow-runtime="true"
    >
      <header className="office-pilot-terminal__view-head">
        <h3 className="office-pilot-ws__panel-title">Workflow</h3>
        <p className="office-pilot-ws__panel-body">
          {activeCase === null
            ? 'Pracovní plocha kroků — vyberte obchodní případ.'
            : `Stav obchodního případu · ${activeCase.label}. Kliknutím navigujete terminál.`}
        </p>
      </header>

      <div
        className="office-pilot-workflow-board"
        data-testid="pilot-workflow-board"
      >
        {workflow.steps.map((step) => {
          const highlighted = step.id === workflow.highlightedStepId;
          return (
            <button
              key={step.id}
              type="button"
              className={
                highlighted
                  ? `office-pilot-workflow-board__step office-pilot-workflow-board__step--${step.state} office-pilot-workflow-board__step--highlighted`
                  : `office-pilot-workflow-board__step office-pilot-workflow-board__step--${step.state}`
              }
              data-testid={`pilot-workflow-step-${step.id}`}
              data-step-state={step.state}
              onClick={() => navigateWorkflowStep(step.id)}
            >
              <h4>{step.label}</h4>
              <p>
                {PILOT_WORKFLOW_STEP_STATE_LABELS[step.state]} · {step.contextHint}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
