type PartnerWelcomeScreenProps = {
  readonly displayName: string;
  readonly firmName: string;
  readonly projectName: string;
  readonly onEnterClientStudio: () => void;
  readonly onContinueToStudios: () => void;
};

/**
 * CS-01 — first-entry welcome after NDA activation.
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
        <p className="platform-access__eyebrow">CONIS Pilot · Welcome</p>
        <h1 className="platform-access__title">Pilotní prostředí je připraveno</h1>
        <p className="platform-access__lead">
          Vítejte, {displayName}. Účet pro {firmName} je aktivní.
        </p>
        <ul className="platform-access__list platform-access__lead">
          <li>Pilotní prostředí připraveno</li>
          <li>Ukázkový projekt připraven · {projectName}</li>
          <li>Přístup: Client Studio · Manager Studio · Sales Studio</li>
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
