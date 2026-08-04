import type { ReactNode } from 'react';

import {
  PILOT_PARTNER_ENVIRONMENT_LABELS,
  PILOT_WORKSPACE_CASE_STATUS_LABELS,
  type PilotWorkspaceCase,
} from '../../../office/pilotWorkspaceModel';
import { ProjectDocumentViewer } from './ProjectDocumentViewer';
import { ProjectOfficeTasks } from './ProjectOfficeTasks';
import { resolveCaseWithWorkflowSync } from '../../../office/commercialWorkflowSync';

type PilotTerminalDetailProps = {
  readonly activeCase: PilotWorkspaceCase | null;
};

/**
 * CAP-OP-02 / PT-15 / PT-16 — Detail + documents + Office Tasks.
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

  const projected = resolveCaseWithWorkflowSync(activeCase);

  return (
    <div
      className="office-pilot-terminal__view"
      data-testid="pilot-terminal-detail"
    >
      <header className="office-pilot-terminal__view-head">
        <h3 className="office-pilot-ws__panel-title">Detail</h3>
        <p className="office-pilot-ws__panel-body">{projected.label}</p>
      </header>

      <dl
        className="office-pilot-detail"
        data-testid="pilot-detail-sections"
      >
        <DetailBlock title="Firma" testId="pilot-detail-firma">
          <p>{projected.companyName}</p>
          <p className="office-pilot-detail__meta">{projected.partnerName}</p>
        </DetailBlock>

        <DetailBlock title="Kontakty" testId="pilot-detail-kontakty">
          {projected.contacts.length === 0 ? (
            <p className="office-pilot-detail__meta">Bez kontaktů</p>
          ) : (
            <ul className="office-pilot-detail__contacts">
              {projected.contacts.map((contact) => (
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
          <p>{projected.packageName}</p>
        </DetailBlock>

        <DetailBlock title="Licence" testId="pilot-detail-licence">
          <p>{projected.licenseLabel}</p>
        </DetailBlock>

        <DetailBlock title="Stav" testId="pilot-detail-stav">
          <p>{PILOT_WORKSPACE_CASE_STATUS_LABELS[projected.status]}</p>
        </DetailBlock>

        <DetailBlock
          title="Partner Environment"
          testId="pilot-detail-partner-environment"
        >
          <p>{projected.partnerEnvironment.label}</p>
          <p className="office-pilot-detail__meta">
            {PILOT_PARTNER_ENVIRONMENT_LABELS[projected.partnerEnvironment.state]}
          </p>
        </DetailBlock>
      </dl>

      <ProjectOfficeTasks projectId={projected.id} />

      <ProjectDocumentViewer
        projectId={projected.id}
        contactEmail={projected.contacts[0]?.email ?? null}
      />
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
