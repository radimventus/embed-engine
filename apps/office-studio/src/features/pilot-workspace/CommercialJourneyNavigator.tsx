import { usePilotWorkspaceContext } from '../../office/PilotWorkspaceContext';
import type { CommercialJourneyStep } from '../../office/commercialJourneyModel';

/**
 * PT-VR-01 — Partner Commercial Journey step navigator (preview only).
 * Synced to Select Project activeCase — not Office Workflow.
 */
export function CommercialJourneyNavigator() {
  const {
    commercialJourneySteps,
    commercialJourneyStepId,
    navigateCommercialJourneyStep,
    activeCaseId,
  } = usePilotWorkspaceContext();

  return (
    <div
      className="office-pilot-ws__workflow"
      data-testid="commercial-journey-navigator"
      data-workflow-runtime="true"
      data-workflow-catalog="commercial-journey"
      data-active-project={activeCaseId ?? ''}
    >
      <h3 className="office-pilot-ws__panel-title">Commercial Journey</h3>
      <ol
        className="office-pilot-workflow-nav"
        data-testid="commercial-journey-steps"
      >
        {commercialJourneySteps.map((step) => (
          <JourneyNavItem
            key={step.id}
            step={step}
            highlighted={step.id === commercialJourneyStepId}
            onNavigate={() => navigateCommercialJourneyStep(step.id)}
          />
        ))}
      </ol>
    </div>
  );
}

function JourneyNavItem({
  step,
  highlighted,
  onNavigate,
}: {
  readonly step: CommercialJourneyStep;
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
        data-testid={`commercial-journey-nav-${step.id}`}
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
