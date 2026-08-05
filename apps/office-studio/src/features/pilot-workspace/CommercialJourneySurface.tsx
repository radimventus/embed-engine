import { usePilotWorkspaceContext } from '../../office/PilotWorkspaceContext';
import { CommercialJourneyScreen } from './terminal/CommercialJourneyScreen';
import { CommercialJourneyNavigator } from './CommercialJourneyNavigator';

/**
 * PT-VR-01 — Partner Commercial Journey production preview (isolated route).
 * Uses Select Project activeCase — does not replace Office Workspace.
 */
export function CommercialJourneySurface() {
  const { activeCase, activeCaseId, commercialJourneyStepId } =
    usePilotWorkspaceContext();

  return (
    <div
      className="office-work-surface"
      data-testid="commercial-journey-surface"
      data-office-mode="commercial-journey"
      data-mail-session="active"
      data-communication-platform="true"
    >
      <div
        className="office-pilot-ws__terminal office-pilot-ws__terminal--journey"
        data-testid="commercial-journey-terminal"
        data-terminal-view="journey"
        data-cj-step={commercialJourneyStepId}
        data-active-project={activeCaseId ?? ''}
        data-project-activated={activeCaseId !== null ? 'true' : 'false'}
        data-office-mode="commercial-journey"
      >
        <header className="office-pilot-ws__journey-head">
          <h3 className="office-pilot-ws__panel-title">
            Partner Commercial Journey
          </h3>
          <p
            className="office-pilot-ws__panel-body"
            data-testid="cj-terminal-context"
          >
            {activeCase === null
              ? 'Vyberte projekt — zobrazí se Commercial Journey partnera.'
              : `${activeCase.label} · ${stepLabel(commercialJourneyStepId)}`}
          </p>
        </header>

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
      <CommercialJourneyNavigator />
    </div>
  );
}

function stepLabel(stepId: string): string {
  switch (stepId) {
    case 'welcome':
      return 'Vítejte';
    case 'pilot_program':
      return 'Pilotní program';
    case 'complete_order':
      return 'Dokončit objednávku';
    case 'payment':
      return 'Platba';
    case 'conis_studio':
      return 'CONIS Studio';
    default:
      return stepId;
  }
}
