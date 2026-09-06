import { useEffect } from 'react';

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
  useEffect(() => {
    // TASK 90 — every Commercial Journey step starts at top.
    // The journey runs inside a same-origin Workspace iframe whose host owns
    // the primary document scroll. Reset both the local document and the host
    // document whenever the authoritative step identity changes.
    const scrollToTop = (): void => {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      } catch {
        window.scrollTo(0, 0);
      }

      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      try {
        const parentWindow =
          window.parent !== window
            ? window.parent
            : null;

        if (parentWindow !== null) {
          try {
            parentWindow.scrollTo({
              top: 0,
              left: 0,
              behavior: 'auto',
            });
          } catch {
            parentWindow.scrollTo(0, 0);
          }

          const parentDocument = parentWindow.document;
          parentDocument.documentElement.scrollTop = 0;
          parentDocument.body.scrollTop = 0;

          const hostMain =
            parentDocument.querySelector<HTMLElement>(
              '[data-testid="workspace-shell-main"]',
            );

          if (hostMain !== null) {
            hostMain.scrollTop = 0;
          }
        }
      } catch {
        // Commercial Journey is same-origin in production.
        // If embedded elsewhere, local reset remains authoritative.
      }
    };

    scrollToTop();

    const raf = window.requestAnimationFrame(scrollToTop);

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [stepId]);

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
  const { navigateCommercialJourneyStep } = usePilotWorkspaceContext();

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
        onClick={() => navigateCommercialJourneyStep('pilot_program')}
      >
        Vybrat pilotní program
      </button>
    </div>
  );
}
