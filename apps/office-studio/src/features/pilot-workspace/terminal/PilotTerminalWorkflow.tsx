import { usePilotWorkspaceContext } from '../../../office/PilotWorkspaceContext';

/**
 * CAP-OP-06 / CAP-OP-10B — Workflow terminal view (data-driven steps).
 */
export function PilotTerminalWorkflow() {
  const { workflow, navigateWorkflowStep } = usePilotWorkspaceContext();

  return (
    <div
      className="office-pilot-terminal__view"
      data-testid="pilot-terminal-workflow"
      data-workflow-runtime="true"
    >
      <header className="office-pilot-terminal__view-head">
        <h3 className="office-pilot-ws__panel-title">Workflow</h3>
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
              title={step.label}
              onClick={() => navigateWorkflowStep(step.id)}
            >
              <h4>{step.label}</h4>
            </button>
          );
        })}
      </div>
    </div>
  );
}
