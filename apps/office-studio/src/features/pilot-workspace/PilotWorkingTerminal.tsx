import { usePilotWorkspaceContext } from '../../office/PilotWorkspaceContext';
import {
  COMMERCIAL_JOURNEY_DEFAULT_STEP,
  isCommercialJourneyStepId,
} from '../../office/commercialJourneyModel';
import { CommercialJourneyScreen } from './terminal/CommercialJourneyScreen';

/**
 * PT-CJ-OS-01 — Working Terminal = production Commercial Journey preview.
 * Synced to Workflow step + active project. Not administration.
 */
export function PilotWorkingTerminal() {
  const { activeCase, activeCaseId, workflow } = usePilotWorkspaceContext();

  const stepId =
    workflow.highlightedStepId !== null &&
    isCommercialJourneyStepId(workflow.highlightedStepId)
      ? workflow.highlightedStepId
      : (workflow.projectedActiveStepId ?? COMMERCIAL_JOURNEY_DEFAULT_STEP);

  return (
    <div
      className="office-pilot-ws__terminal office-pilot-ws__terminal--journey"
      data-testid="pilot-working-terminal"
      data-terminal-view="journey"
      data-cj-step={stepId}
      data-active-project={activeCaseId ?? ''}
      data-project-activated={activeCaseId !== null ? 'true' : 'false'}
      data-office-mode="commercial-journey"
    >
      <header className="office-pilot-ws__journey-head">
        <h3 className="office-pilot-ws__panel-title">Working Terminal</h3>
        <p
          className="office-pilot-ws__panel-body"
          data-testid="cj-terminal-context"
        >
          {activeCase === null
            ? 'Vyberte projekt — zobrazí se Commercial Journey partnera.'
            : `${activeCase.label} · ${stepLabel(stepId)}`}
        </p>
      </header>

      <div
        className="office-pilot-ws__terminal-body office-pilot-ws__terminal-body--journey"
        data-testid="pilot-terminal-panel-journey"
      >
        <CommercialJourneyScreen stepId={stepId} activeCase={activeCase} />
      </div>
    </div>
  );
}

function stepLabel(stepId: string): string {
  switch (stepId) {
    case 'welcome':
      return 'Welcome';
    case 'pilot_program':
      return 'Pilot Program';
    case 'order_confirmation':
      return 'Order Confirmation';
    case 'payment':
      return 'Payment';
    case 'pilot_confirmed':
      return 'Pilot Confirmed';
    case 'office_handoff':
      return 'Office Handoff';
    default:
      return stepId;
  }
}
