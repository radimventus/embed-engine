import {
  PILOT_INBOX_SECTIONS,
} from '../../../office/pilotWorkspaceModel';

/**
 * CAP-OP-02 — Inbox view (UI only). Default terminal view.
 * Sections: Nové · Čeká na odpověď · Nepřiřazené.
 */
export function PilotTerminalInbox() {
  return (
    <div
      className="office-pilot-terminal__view"
      data-testid="pilot-terminal-inbox"
      data-pilot-inbox-default="true"
    >
      <header className="office-pilot-terminal__view-head">
        <h3 className="office-pilot-ws__panel-title">Inbox</h3>
        <p className="office-pilot-ws__panel-body">
          Pracovní schránka obchodního případu. Mail Engine a párování jsou mimo
          scope — sekce jsou připravené pro PT-06.
        </p>
      </header>

      <div className="office-pilot-inbox" data-testid="pilot-inbox-sections">
        {PILOT_INBOX_SECTIONS.map((section) => (
          <section
            key={section.id}
            className="office-pilot-inbox__section"
            data-testid={`pilot-inbox-section-${section.id}`}
          >
            <h4 className="office-pilot-inbox__title">{section.label}</h4>
            <ul className="office-pilot-inbox__list">
              {section.placeholders.map((item) => (
                <li key={item} className="office-pilot-inbox__item">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
