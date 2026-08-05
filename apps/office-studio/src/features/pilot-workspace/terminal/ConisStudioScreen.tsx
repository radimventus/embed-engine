import { resolveClientStudioHref } from '@embed-engine/platform-access';

import type { PilotWorkspaceCase } from '../../../office/pilotWorkspaceModel';

type ConisStudioScreenProps = {
  readonly activeCase: PilotWorkspaceCase;
};

/**
 * PT-CJ-04 — CONIS Studio after QR payment confirmation.
 */
export function ConisStudioScreen({ activeCase }: ConisStudioScreenProps) {
  void activeCase;

  return (
    <div
      className="office-cj-screen office-cj-screen--conis-studio"
      data-testid="commercial-journey-screen"
      data-cj-step="conis_studio"
    >
      <h2 className="office-cj-screen__title" data-testid="cj-studio-title">
        Děkujeme. Platba byla oznámena.
      </h2>
      <p className="office-cj-screen__lead" data-testid="cj-studio-lead">
        Nyní můžete začít pracovat v CONIS Studio.
      </p>
      <p className="office-cj-screen__note">
        Podklady můžete nahrát nyní nebo kdykoliv později.
      </p>
      <a
        className="office-cj-pilot__continue office-cj-pilot__continue--link"
        href={resolveClientStudioHref()}
        data-testid="cj-studio-open"
      >
        Otevřít CONIS Studio
      </a>
    </div>
  );
}
