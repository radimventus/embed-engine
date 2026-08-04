import { PlatformCard } from '@embed-engine/platform-shell';

import { usePilotWorkspaceContext } from '../../office/PilotWorkspaceContext';
import {
  PILOT_WORKFLOW_STEP_STATE_LABELS,
  type PilotWorkflowStep,
} from '../../office/pilotWorkflowModel';

/**
 * CAP-OP-06 — Active Workflow Navigator (right panel).
 * Projects case state and navigates Working Terminal tabs.
 */
export function PilotWorkflowNavigator() {
  const { activeCase, workflow, navigateWorkflowStep } =
    usePilotWorkspaceContext();

  return (
    <PlatformCard title="Workflow" className="office-pilot-ws__workflow">
      <div
        className="office-pilot-ws__workflow-shell"
        data-testid="pilot-workflow-navigator"
        data-workflow-runtime="true"
      >
        <p className="office-pilot-ws__shell-note">
          {activeCase === null
            ? 'Vyberte obchodní případ — Workflow je projekcí jeho stavu.'
            : `Navigátor · ${activeCase.label}`}
        </p>

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

        <p
          className="office-pilot-inbox__timeline-slot"
          data-testid="pilot-workflow-catalog-slot"
          data-workflow-catalog="ready"
        >
          Event Catalog projector připraven — bez auto-přepínání (PT-10).
        </p>
      </div>
    </PlatformCard>
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
        onClick={onNavigate}
      >
        <span
          className="office-pilot-workflow-nav__marker"
          aria-hidden="true"
        />
        <span className="office-pilot-workflow-nav__copy">
          <span className="office-pilot-workflow-nav__label">{step.label}</span>
          <span className="office-pilot-workflow-nav__meta">
            {PILOT_WORKFLOW_STEP_STATE_LABELS[step.state]} · {step.contextHint}
          </span>
        </span>
      </button>
    </li>
  );
}
