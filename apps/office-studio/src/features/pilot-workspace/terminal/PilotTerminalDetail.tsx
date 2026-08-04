import type { ReactNode } from 'react';

import {
  PILOT_PARTNER_ENVIRONMENT_LABELS,
  PILOT_WORKSPACE_CASE_STATUS_LABELS,
  type PilotWorkspaceCase,
} from '../../../office/pilotWorkspaceModel';

type PilotTerminalDetailProps = {
  readonly activeCase: PilotWorkspaceCase | null;
};

/**
 * CAP-OP-02 — Detail obchodního případu.
 * Firma · Kontakty · Balíček · Licence · Stav · Partner Environment.
 */
export function PilotTerminalDetail({ activeCase }: PilotTerminalDetailProps) {
  if (activeCase === null) {
    return (
      <div
        className="office-pilot-terminal__view"
        data-testid="pilot-terminal-detail"
      >
        <p className="office-pilot-ws__panel-body">
          Vyberte projekt.
        </p>
      </div>
    );
  }

  return (
    <div
      className="office-pilot-terminal__view"
      data-testid="pilot-terminal-detail"
    >
      <header className="office-pilot-terminal__view-head">
        <h3 className="office-pilot-ws__panel-title">Detail</h3>
        <p className="office-pilot-ws__panel-body">{activeCase.label}</p>
      </header>

      <dl
        className="office-pilot-detail"
        data-testid="pilot-detail-sections"
      >
        <DetailBlock title="Firma" testId="pilot-detail-firma">
          <p>{activeCase.companyName}</p>
          <p className="office-pilot-detail__meta">{activeCase.partnerName}</p>
        </DetailBlock>

        <DetailBlock title="Kontakty" testId="pilot-detail-kontakty">
          {activeCase.contacts.length === 0 ? (
            <p className="office-pilot-detail__meta">Bez kontaktů</p>
          ) : (
            <ul className="office-pilot-detail__contacts">
              {activeCase.contacts.map((contact) => (
                <li key={contact.email}>
                  <strong>{contact.name}</strong>
                  <span>{contact.role}</span>
                  <span>{contact.email}</span>
                </li>
              ))}
            </ul>
          )}
        </DetailBlock>

        <DetailBlock title="Balíček" testId="pilot-detail-balicek">
          <p>{activeCase.packageName}</p>
        </DetailBlock>

        <DetailBlock title="Licence" testId="pilot-detail-licence">
          <p>{activeCase.licenseLabel}</p>
        </DetailBlock>

        <DetailBlock title="Stav" testId="pilot-detail-stav">
          <p>{PILOT_WORKSPACE_CASE_STATUS_LABELS[activeCase.status]}</p>
        </DetailBlock>

        <DetailBlock
          title="Partner Environment"
          testId="pilot-detail-partner-environment"
        >
          <p>{activeCase.partnerEnvironment.label}</p>
          <p className="office-pilot-detail__meta">
            {PILOT_PARTNER_ENVIRONMENT_LABELS[activeCase.partnerEnvironment.state]}
          </p>
        </DetailBlock>
      </dl>
    </div>
  );
}

function DetailBlock({
  title,
  testId,
  children,
}: {
  readonly title: string;
  readonly testId: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="office-pilot-detail__block" data-testid={testId}>
      <dt>{title}</dt>
      <dd>{children}</dd>
    </div>
  );
}
