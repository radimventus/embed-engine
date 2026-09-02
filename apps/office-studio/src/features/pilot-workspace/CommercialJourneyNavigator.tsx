import { usePilotWorkspaceContext } from '../../office/PilotWorkspaceContext';
import type {
  CommercialJourneyStep,
  CommercialJourneyStepId,
} from '../../office/commercialJourneyModel';

function blockedStepGuidance(
  activeStepId: CommercialJourneyStepId,
): string {
  switch (activeStepId) {
    case 'welcome':
    case 'pilot_program':
      return 'Nejprve vyberte pilotní program.';
    case 'complete_order':
      return 'Nejprve dokončete objednávku.';
    case 'payment':
      return 'Nejprve potvrďte provedení platby.';
    case 'conis_studio':
      return 'Dokončete aktuální krok.';
  }
}

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

  const activeVisibleIndex =
    commercialJourneyStepId === 'welcome'
      ? 0
      : visibleSteps.findIndex(
          (step) => step.id === commercialJourneyStepId,
        );

  const unlockedThroughIndex = Math.max(0, activeVisibleIndex);
  const blockedGuidance = blockedStepGuidance(commercialJourneyStepId);

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
            enabled={index <= unlockedThroughIndex}
            blockedGuidance={
              index > unlockedThroughIndex ? blockedGuidance : null
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
  enabled,
  blockedGuidance,
  onNavigate,
  showArrow,
}: {
  readonly step: CommercialJourneyStep;
  readonly highlighted: boolean;
  readonly enabled: boolean;
  readonly blockedGuidance: string | null;
  readonly onNavigate: () => void;
  readonly showArrow: boolean;
}) {
  return (
    <li
      className="office-pilot-workflow-nav__step"
      data-blocked={blockedGuidance !== null ? 'true' : 'false'}
      tabIndex={blockedGuidance !== null ? 0 : undefined}
    >
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
        data-enabled={enabled ? 'true' : 'false'}
        aria-current={highlighted ? 'step' : undefined}
        aria-disabled={!enabled}
        disabled={!enabled}
        title={enabled ? step.label : undefined}
        aria-describedby={
          blockedGuidance !== null
            ? `commercial-journey-guidance-${step.id}`
            : undefined
        }
        onClick={enabled ? onNavigate : undefined}
      >
        <span className="office-pilot-workflow-nav__label">
          {step.label}
        </span>
      </button>

      {blockedGuidance !== null ? (
        <span
          id={`commercial-journey-guidance-${step.id}`}
          className="office-pilot-workflow-nav__guidance"
          role="tooltip"
          data-testid={`commercial-journey-guidance-${step.id}`}
        >
          {blockedGuidance}
        </span>
      ) : null}

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
