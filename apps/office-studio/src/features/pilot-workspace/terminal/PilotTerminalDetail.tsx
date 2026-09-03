import {
  canonicalCompanyIdForOfficePartner,
  platformApiOrigin,
} from '@embed-engine/platform-access';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  PILOT_PARTNER_ENVIRONMENT_LABELS,
  PILOT_WORKSPACE_CASE_STATUS_LABELS,
  type PilotWorkspaceCase,
} from '../../../office/pilotWorkspaceModel';
import { PartnerFormDialog } from '../../partners/PartnerFormDialog';
import {
  draftFromPartner,
  hydrateOfficePartnersFromServer,
  listPartners,
  persistUpdatedPartner,
} from '../../../office/officePartnerRegistry';
import type {
  OfficePartner,
  OfficePartnerDraft,
} from '../../../office/officePartnerModel';
import { ProjectDocumentViewer } from './ProjectDocumentViewer';
import { ProjectOfficeTasks } from './ProjectOfficeTasks';
import { resolveCaseWithWorkflowSync } from '../../../office/commercialWorkflowSync';

type PilotTerminalDetailProps = {
  readonly activeCase: PilotWorkspaceCase | null;
};

/**
 * CAP-OP-02 / PT-15 / PT-16 — Detail + documents + Office Tasks.
 */
function projectLogoEndpoint(projectId: string): string {
  return `${platformApiOrigin().replace(/\/$/, '')}/public/projects/${encodeURIComponent(projectId)}/logo`;
}

export function PilotTerminalDetail({
  activeCase,
}: PilotTerminalDetailProps) {
  const projectId = activeCase?.projectId ?? activeCase?.id ?? null;
  const [logoRevision, setLogoRevision] = useState(0);
  const [logoAvailable, setLogoAvailable] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [partnerRevision, setPartnerRevision] = useState(0);
  const [editPartner, setEditPartner] = useState<OfficePartner | null>(null);
  const [partnerBusy, setPartnerBusy] = useState(false);
  const [partnerError, setPartnerError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void hydrateOfficePartnersFromServer()
      .then(() => {
        if (!cancelled) {
          setPartnerRevision((value) => value + 1);
        }
      })
      .catch(() => {
        // Existing registry snapshot remains the read fallback until save.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (projectId === null) {
      setLogoAvailable(false);
      return;
    }

    let cancelled = false;

    void fetch(projectLogoEndpoint(projectId), {
      credentials: 'include',
      method: 'GET',
    })
      .then((response) => {
        if (!cancelled) {
          setLogoAvailable(response.ok);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLogoAvailable(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, logoRevision]);

  async function uploadProjectLogo(file: File): Promise<void> {
    if (projectId === null) return;

    setLogoBusy(true);
    setLogoError(null);

    try {
      const response = await fetch(projectLogoEndpoint(projectId), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'content-type': file.type,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error('Logo projektu se nepodařilo uložit.');
      }

      setLogoAvailable(true);
      setLogoRevision((value) => value + 1);
    } catch (error) {
      setLogoError(
        error instanceof Error
          ? error.message
          : 'Logo projektu se nepodařilo uložit.',
      );
    } finally {
      setLogoBusy(false);
    }
  }

  async function removeProjectLogo(): Promise<void> {
    if (projectId === null) return;

    setLogoBusy(true);
    setLogoError(null);

    try {
      const response = await fetch(projectLogoEndpoint(projectId), {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logo projektu se nepodařilo odstranit.');
      }

      setLogoAvailable(false);
      setLogoRevision((value) => value + 1);
    } catch (error) {
      setLogoError(
        error instanceof Error
          ? error.message
          : 'Logo projektu se nepodařilo odstranit.',
      );
    } finally {
      setLogoBusy(false);
    }
  }

  const activePartner = useMemo(() => {
    void partnerRevision;

    if (activeCase === null) return null;

    return (
      listPartners().find(
        (item) =>
          item.id === activeCase.companyId ||
          canonicalCompanyIdForOfficePartner(item.id) === activeCase.companyId,
      ) ?? null
    );
  }, [activeCase, partnerRevision]);

  async function savePartnerEdit(
    draft: OfficePartnerDraft,
  ): Promise<void> {
    if (editPartner === null) return;

    setPartnerBusy(true);
    setPartnerError(null);

    try {
      await persistUpdatedPartner(editPartner.id, draft);
      setPartnerRevision((value) => value + 1);
      setEditPartner(null);
    } catch (error) {
      setPartnerError(
        error instanceof Error
          ? error.message
          : 'Partnera se nepodařilo uložit.',
      );
    } finally {
      setPartnerBusy(false);
    }
  }

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
        <div>
          <h3 className="office-pilot-ws__panel-title">Detail</h3>
          <p className="office-pilot-ws__panel-body">
            {projected.label}
          </p>
        </div>
        {activePartner !== null ? (
          <button
            type="button"
            className="platform-btn platform-btn--sm"
            data-testid="pilot-detail-edit-partner"
            onClick={() => {
              setPartnerError(null);
              setEditPartner(activePartner);
            }}
          >
            Upravit
          </button>
        ) : null}
      </header>

      <dl
        className="office-pilot-detail"
        data-testid="pilot-detail-sections"
      >
        <DetailBlock title="Firma" testId="pilot-detail-firma">
          <p>{projected.companyName}</p>
          <p className="office-pilot-detail__meta">
            {projected.partnerName}
          </p>
        </DetailBlock>

        <DetailBlock title="Kontakty" testId="pilot-detail-kontakty">
          {projected.contacts.length === 0 ? (
            <p className="office-pilot-detail__meta">
              Bez kontaktů
            </p>
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
          <p>
            {PILOT_WORKSPACE_CASE_STATUS_LABELS[projected.status]}
          </p>
        </DetailBlock>

        <DetailBlock
          title="Partner Environment"
          testId="pilot-detail-partner-environment"
        >
          <p>{projected.partnerEnvironment.label}</p>
          <p className="office-pilot-detail__meta">
            {
              PILOT_PARTNER_ENVIRONMENT_LABELS[
                projected.partnerEnvironment.state
              ]
            }
          </p>
        </DetailBlock>
      </dl>

      {projectId !== null ? (
        <section
          className="office-pilot-ws__detail-section"
          data-testid="project-branding-detail"
        >
          <h3>Logo projektu</h3>

          {logoAvailable ? (
            <img
              src={`${projectLogoEndpoint(projectId)}?v=${logoRevision}`}
              alt="Logo projektu"
              style={{
                display: 'block',
                maxWidth: 220,
                maxHeight: 72,
                objectFit: 'contain',
                objectPosition: 'left center',
                marginBottom: 12,
              }}
              data-testid="project-logo-preview"
            />
          ) : (
            <p className="office-dashboard__hint">
              Logo projektu není nastaveno.
            </p>
          )}

          <div className="office-partner-actions">
            <label className="platform-btn platform-btn--sm">
              {logoAvailable ? 'Nahradit logo' : 'Nahrát logo'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                hidden
                disabled={logoBusy}
                data-testid="project-logo-upload"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];

                  if (file !== undefined) {
                    void uploadProjectLogo(file);
                  }

                  event.currentTarget.value = '';
                }}
              />
            </label>

            {logoAvailable ? (
              <button
                type="button"
                className="platform-btn platform-btn--sm"
                disabled={logoBusy}
                data-testid="project-logo-remove"
                onClick={() => void removeProjectLogo()}
              >
                Odstranit logo
              </button>
            ) : null}
          </div>

          {logoError !== null ? (
            <p role="alert">{logoError}</p>
          ) : null}
        </section>
      ) : null}

      {editPartner !== null ? (
        <PartnerFormDialog
          key={`project-detail-edit-${editPartner.id}`}
          open
          mode="edit"
          initial={draftFromPartner(editPartner)}
          busy={partnerBusy}
          error={partnerError}
          onClose={() => {
            if (partnerBusy) return;
            setPartnerError(null);
            setEditPartner(null);
          }}
          onSubmit={(draft) => {
            void savePartnerEdit(draft);
          }}
        />
      ) : null}

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
    <div
      className="office-pilot-detail__block"
      data-testid={testId}
    >
      <dt>{title}</dt>
      <dd>{children}</dd>
    </div>
  );
}
