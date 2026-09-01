import { usePilotWorkspaceContext } from '../../office/PilotWorkspaceContext';
import type { CommercialJourneyStep } from '../../office/commercialJourneyModel';

/**
 * Partner-facing Commercial Journey navigation.
 * Workflow authority is unchanged; Welcome remains a historical/runtime step
 * but is intentionally omitted from the partner-facing navigation schema.
 */
export function CommercialJourneyNavigator() {
  const {
    commercialJourneySteps,
    commercialJourneyStepId,
    navigateCommercialJourneyStep,
    activeCaseId,
  } = usePilotWorkspaceContext();

  const visibleSteps = commercialJourneySteps.filter(
    (step) => step.id !== 'welcome',
  );

  return (
    <nav
      className="office-pilot-ws__workflow office-pilot-ws__workflow--journey"
      data-testid="commercial-journey-navigator"
      data-workflow-runtime="true"
      data-workflow-catalog="commercial-journey"
      data-active-project={activeCaseId ?? ''}
      aria-label="Průběh pilotního programu"
    >
      <ol
        className="office-pilot-workflow-nav office-pilot-workflow-nav--journey"
        data-testid="commercial-journey-steps"
      >
        {visibleSteps.map((step, index) => (
          <JourneyNavItem
            key={step.id}
            step={step}
            highlighted={
              step.id === commercialJourneyStepId ||
              (commercialJourneyStepId === 'welcome' && index === 0)
            }
            onNavigate={() => navigateCommercialJourneyStep(step.id)}
            showArrow={index < visibleSteps.length - 1}
          />
        ))}
      </ol>
    </nav>
  );
}

function JourneyNavItem({
  step,
  highlighted,
  onNavigate,
  showArrow,
}: {
  readonly step: CommercialJourneyStep;
  readonly highlighted: boolean;
  readonly onNavigate: () => void;
  readonly showArrow: boolean;
}) {
  return (
    <li className="office-pilot-workflow-nav__step">
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
        <span className="office-pilot-workflow-nav__label">
          {step.label}
        </span>
      </button>

      {showArrow ? (
        <span
          className="office-pilot-workflow-nav__arrow"
          aria-hidden="true"
        >
          →
        </span>
      ) : null}
    </li>
  );
}
