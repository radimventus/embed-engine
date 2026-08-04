import { usePilotWorkspaceContext } from '../../office/PilotWorkspaceContext';
import type { PilotWorkflowStep } from '../../office/pilotWorkflowModel';

/**
 * PT-CJ-OS-01 — Commercial Journey navigator (right panel).
 * Steps = partner-facing production path. Click → Working Terminal screen.
 */
export function PilotWorkflowNavigator() {
  const { workflow, navigateWorkflowStep, activeCaseId } =
    usePilotWorkspaceContext();

  return (
    <div
      className="office-pilot-ws__workflow"
      data-testid="pilot-workflow-navigator"
      data-workflow-runtime="true"
      data-workflow-catalog="commercial-journey"
      data-active-project={activeCaseId ?? ''}
    >
      <h3 className="office-pilot-ws__panel-title">Commercial Journey</h3>
      <ol
        className="office-pilot-workflow-nav"
        data-testid="pilot-workflow-steps"
      >
        {workflow.steps.map((step) => (
          <WorkflowNavItem
            key={step.id}
            step={step}
            highlighted={step.id === workflow.highlightedStepId}
            onNavigate={() => navigateWorkflowStep(step.id)}
          />
        ))}
      </ol>
    </div>
  );
}

function WorkflowNavItem({
  step,
  highlighted,
  onNavigate,
}: {
  readonly step: PilotWorkflowStep;
  readonly highlighted: boolean;
  readonly onNavigate: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        className={
          highlighted
            ? `office-pilot-workflow-nav__item office-pilot-workflow-nav__item--${step.state} office-pilot-workflow-nav__item--highlighted`
            : `office-pilot-workflow-nav__item office-pilot-workflow-nav__item--${step.state}`
        }
        data-testid={`pilot-workflow-nav-${step.id}`}
        data-step-state={step.state}
        data-highlighted={highlighted ? 'true' : 'false'}
        aria-current={highlighted ? 'step' : undefined}
        title={step.label}
        onClick={onNavigate}
      >
        <span
          className="office-pilot-workflow-nav__marker"
          aria-hidden="true"
          title={step.label}
        />
        <span className="office-pilot-workflow-nav__label">{step.label}</span>
      </button>
    </li>
  );
}
