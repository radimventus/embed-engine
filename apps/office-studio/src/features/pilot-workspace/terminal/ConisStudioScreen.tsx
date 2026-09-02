
import type { PilotWorkspaceCase } from '../../../office/pilotWorkspaceModel';

type ConisStudioScreenProps = {
  readonly activeCase: PilotWorkspaceCase;
};

/**
 * PT-CJ-04 — Commercial Journey completion · CONIS Studio entry.
 */
export function ConisStudioScreen({ activeCase }: ConisStudioScreenProps) {
  void activeCase;

  return (
    <div
      className="office-cj-screen office-cj-screen--conis-studio"
      data-testid="commercial-journey-screen"
      data-cj-step="conis_studio"
    >
      <h2 className="office-cj-pilot__title" data-testid="cj-studio-title">
        Děkujeme. Platba byla oznámena.
      </h2>
      <p className="office-cj-pilot__lead" data-testid="cj-studio-lead">
        Vítejte v CONIS Studio.
      </p>
      <p className="office-cj-screen__note">
        Po ověření platby vám pošleme instrukce k podkladům, které od vás potřebujeme pro zapracování do systému.
      </p>
      <a
        className="office-cj-pilot__continue office-cj-pilot__continue--link"
        href="/studio/manager/"
        data-testid="cj-studio-open"
      >
        Otevřít CONIS Studio
      </a>
    </div>
  );
}
