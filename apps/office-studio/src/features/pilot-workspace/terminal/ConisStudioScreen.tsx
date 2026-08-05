import { resolveClientStudioHref } from '@embed-engine/platform-access';

import type { PilotWorkspaceCase } from '../../../office/pilotWorkspaceModel';

type ConisStudioScreenProps = {
  readonly activeCase: PilotWorkspaceCase;
};

/**
 * PT-CJ-02 — CONIS Studio entry after QR payment confirmation.
 * Partner-facing thank-you · no Office handoff UI.
 */
export function ConisStudioScreen({ activeCase }: ConisStudioScreenProps) {
  return (
    <div
      className="office-cj-screen office-cj-screen--conis-studio"
      data-testid="commercial-journey-screen"
      data-cj-step="conis_studio"
    >
      <p className="office-cj-pilot__eyebrow">CONIS Studio</p>
      <h2 className="office-cj-screen__title" data-testid="cj-studio-title">
        Děkujeme. Platba byla oznámena.
      </h2>
      <p className="office-cj-screen__lead" data-testid="cj-studio-lead">
        Nyní můžete začít pracovat v CONIS Studio.
      </p>
      <p className="office-cj-screen__note">
        Podklady můžete nahrát nyní nebo kdykoliv později.
      </p>
      <p className="office-cj-screen__meta">
        Office mezitím automaticky přebírá implementaci na pozadí ·{' '}
        {activeCase.partnerName}.
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
