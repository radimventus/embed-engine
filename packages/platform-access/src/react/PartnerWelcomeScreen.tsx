type PartnerWelcomeScreenProps = {
  readonly displayName: string;
  readonly firmName: string;
  readonly projectName: string;
  readonly onEnterClientStudio: () => void;
  readonly onEnterManagerStudio: () => void;
  readonly onEnterSalesStudio: () => void;
};

/**
 * PE-05 — Welcome Journey: first-session orientation into Partner Workspace.
 * Client Studio is the recommended primary entry; Manager / Sales are secondary.
 * Builder / Office are never offered to partners.
 */
export function PartnerWelcomeScreen({
  displayName,
  firmName,
  projectName,
  onEnterClientStudio,
  onEnterManagerStudio,
  onEnterSalesStudio,
}: PartnerWelcomeScreenProps) {
  return (
    <div className="platform-access" data-testid="partner-welcome">
      <div className="platform-access__panel">
        <p className="platform-access__eyebrow">CONIS Pilot · Welcome Journey</p>
        <h1 className="platform-access__title">Vítejte v CONIS</h1>
        <p className="platform-access__lead" data-testid="welcome-greeting">
          {displayName}, účet pro {firmName} je aktivní. Pilotní prostředí je
          připravené — můžete rovnou pracovat.
        </p>

        <section data-testid="welcome-what-you-got">
          <p className="platform-access__demos-title">Co jste získali</p>
          <ul className="platform-access__list platform-access__lead">
            <li data-testid="welcome-workspace-ready">
              Připravené Pilot Workspace bez dalších kroků
            </li>
            <li data-testid="welcome-sample-project">
              Ukázkový projekt CONIS · {projectName}
            </li>
            <li data-testid="welcome-experience">
              Embed Experience v Client Studiu (priorita → FAQ → chat → audit)
            </li>
            <li data-testid="welcome-partner-studios">
              Manager Studio a Sales Studio pro partnerský provoz
            </li>
          </ul>
        </section>

        <p className="platform-access__lead" data-testid="welcome-sample-note">
          Pracujete s ukázkovým projektem CONIS ({projectName}). Vlastní projekty
          přijdou později — teď si vyzkoušejte Experience end-to-end.
        </p>

        <button
          type="button"
          className="platform-access__submit"
          style={{ width: '100%', marginTop: 16 }}
          onClick={onEnterClientStudio}
          data-testid="welcome-enter-client-studio"
        >
          Otevřít Client Studio
        </button>
        <p
          className="platform-access__lead"
          style={{ marginTop: 12, marginBottom: 4 }}
        >
          Nebo pokračujte do partnerských studií
        </p>
        <div
          className="platform-access__studios"
          data-testid="welcome-secondary-nav"
        >
          <button
            type="button"
            className="platform-access__studio"
            onClick={onEnterManagerStudio}
            data-testid="welcome-enter-manager-studio"
          >
            <span className="platform-access__studio-name">Manager Studio</span>
            <span className="platform-access__studio-meta">Otevřít</span>
          </button>
          <button
            type="button"
            className="platform-access__studio"
            onClick={onEnterSalesStudio}
            data-testid="welcome-enter-sales-studio"
          >
            <span className="platform-access__studio-name">Sales Studio</span>
            <span className="platform-access__studio-meta">Otevřít</span>
          </button>
        </div>
      </div>
    </div>
  );
}
