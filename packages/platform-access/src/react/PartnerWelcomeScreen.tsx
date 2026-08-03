type PartnerWelcomeScreenProps = {
  readonly displayName: string;
  readonly firmName: string;
  readonly projectName: string;
  readonly onEnterClientStudio: () => void;
  readonly onContinueToStudios: () => void;
};

/**
 * CS-01 / PE-03 — first-entry welcome after NDA activation.
 * Confirms Pilot Workspace + sample project + partner studios.
 */
export function PartnerWelcomeScreen({
  displayName,
  firmName,
  projectName,
  onEnterClientStudio,
  onContinueToStudios,
}: PartnerWelcomeScreenProps) {
  return (
    <div className="platform-access" data-testid="partner-welcome">
      <div className="platform-access__panel">
        <p className="platform-access__eyebrow">CONIS Pilot · Workspace</p>
        <h1 className="platform-access__title">Pilotní prostředí je připraveno</h1>
        <p className="platform-access__lead">
          Vítejte, {displayName}. Účet pro {firmName} je aktivní — Workspace je
          připraven bez dalších kroků.
        </p>
        <ul className="platform-access__list platform-access__lead">
          <li data-testid="welcome-workspace-ready">Pilot Workspace připraven</li>
          <li data-testid="welcome-sample-project">
            Ukázkový projekt CONIS · {projectName}
          </li>
          <li data-testid="welcome-studio-client">Client Studio připraveno</li>
          <li data-testid="welcome-studio-manager">Manager Studio připraveno</li>
          <li data-testid="welcome-studio-sales">Sales Studio připraveno</li>
        </ul>
        <button
          type="button"
          className="platform-access__submit"
          style={{ width: '100%', marginTop: 16 }}
          onClick={onEnterClientStudio}
          data-testid="welcome-enter-client-studio"
        >
          Přejít do Client Studia
        </button>
        <button
          type="button"
          className="platform-access__logout"
          onClick={onContinueToStudios}
          data-testid="welcome-continue-studios"
        >
          Pokračovat do Studií
        </button>
      </div>
    </div>
  );
}
