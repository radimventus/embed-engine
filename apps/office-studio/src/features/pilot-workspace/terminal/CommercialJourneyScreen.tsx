import { usePilotWorkspaceContext } from '../../../office/PilotWorkspaceContext';
import type { PilotWorkspaceCase } from '../../../office/pilotWorkspaceModel';
import type { CommercialJourneyStepId } from '../../../office/commercialJourneyModel';
import { CompleteOrderScreen } from './CompleteOrderScreen';
import { ConisStudioScreen } from './ConisStudioScreen';
import { PaymentScreen } from './PaymentScreen';
import { PilotProgramScreen } from './PilotProgramScreen';

type CommercialJourneyScreenProps = {
  readonly stepId: CommercialJourneyStepId;
  readonly activeCase: PilotWorkspaceCase | null;
};

/**
 * PT-CJ-04 — Complete partner Commercial Journey (production preview).
 * Vítejte → Pilotní program → Dokončit objednávku → Platba → CONIS Studio.
 */
export function CommercialJourneyScreen({
  stepId,
  activeCase,
}: CommercialJourneyScreenProps) {
  if (activeCase === null) {
    return (
      <div
        className="office-cj-screen"
        data-testid="commercial-journey-screen"
        data-cj-step="none"
      >
        <p className="office-pilot-ws__panel-body">Vyberte projekt.</p>
      </div>
    );
  }

  switch (stepId) {
    case 'welcome':
      return <WelcomeScreen partnerName={activeCase.partnerName} />;
    case 'pilot_program':
      return <PilotProgramScreen activeCase={activeCase} />;
    case 'complete_order':
      return <CompleteOrderScreen activeCase={activeCase} />;
    case 'payment':
      return <PaymentScreen activeCase={activeCase} />;
    case 'conis_studio':
      return <ConisStudioScreen activeCase={activeCase} />;
    default: {
      const _exhaustive: never = stepId;
      return _exhaustive;
    }
  }
}

function WelcomeScreen({ partnerName }: { readonly partnerName: string }) {
  const { navigateWorkflowStep } = usePilotWorkspaceContext();

  return (
    <div
      className="office-cj-screen office-cj-screen--welcome"
      data-testid="commercial-journey-screen"
      data-cj-step="welcome"
    >
      <p className="office-cj-pilot__partner">{partnerName}</p>
      <h2 className="office-cj-pilot__title" data-testid="cj-welcome-title">
        Vítejte ve svém CONIS Studio
      </h2>
      <p className="office-cj-pilot__lead" data-testid="cj-welcome-lead">
        Vše je připravené.
        <br />
        Zbývá už jen vybrat pilotní program.
      </p>
      <button
        type="button"
        className="office-cj-pilot__continue"
        data-testid="cj-welcome-cta"
        onClick={() => navigateWorkflowStep('pilot_program')}
      >
        Vybrat pilotní program
      </button>
    </div>
  );
}
