import { usePilotWorkspaceContext } from '../../office/PilotWorkspaceContext';
import { CommercialJourneyScreen } from './terminal/CommercialJourneyScreen';
import { CommercialJourneyNavigator } from './CommercialJourneyNavigator';

/**
 * Partner-facing Commercial Journey surface.
 * Business/data authority stays in PilotWorkspaceContext.
 * Presentation: horizontal journey navigation above the active step.
 */
export function CommercialJourneySurface() {
  const { activeCase, activeCaseId, commercialJourneyStepId } =
    usePilotWorkspaceContext();

  return (
    <div
      className="office-work-surface office-work-surface--commercial-journey"
      data-testid="commercial-journey-surface"
      data-office-mode="commercial-journey"
      data-mail-session="active"
      data-communication-platform="true"
    >
      <CommercialJourneyNavigator />

      <div
        className="office-pilot-ws__terminal office-pilot-ws__terminal--journey"
        data-testid="commercial-journey-terminal"
        data-terminal-view="journey"
        data-cj-step={commercialJourneyStepId}
        data-active-project={activeCaseId ?? ''}
        data-project-activated={activeCaseId !== null ? 'true' : 'false'}
        data-office-mode="commercial-journey"
      >
        <div
          className="office-pilot-ws__terminal-body office-pilot-ws__terminal-body--journey"
          data-testid="commercial-journey-panel"
        >
          <CommercialJourneyScreen
            stepId={commercialJourneyStepId}
            activeCase={activeCase}
          />
        </div>
      </div>
    </div>
  );
}
