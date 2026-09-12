import { getCanonicalProject, type PlatformCanonicalProject } from '@embed-engine/platform-access';
import { saveCanonicalProjectMetadata } from './saveCanonicalProjectMetadata';
import { useEffect, useState } from 'react';

import {
  PlatformDialog,
  PlatformField,
} from '@embed-engine/platform-shell';

import { parseProjectPrivacyUrlInput } from './projectPrivacyUrl';
import {
  requestProjectConfig,
  saveProjectConfig,
} from './requestProjectConfig';

import type {
  WorkspaceCompany,
} from './workspaceRegistry';

type ProjectEditDialogProps = {
  readonly open: boolean;
  readonly canonicalProjectId: string | null;
  readonly canonicalProjectName: string | null;
  readonly companies: readonly WorkspaceCompany[];
  readonly onClose: () => void;
  readonly onSubmit: () => void;
};

const STATUS_OPTIONS: readonly {
  readonly id: NonNullable<PlatformCanonicalProject['status']>;
  readonly label: string;
}[] = [
  { id: 'draft', label: 'Koncept' },
  { id: 'ready', label: 'Připraveno' },
  { id: 'published', label: 'Publikováno' },
  { id: 'archived', label: 'Archivovat' },
];

/**
 * VR-FIX-03 — Upravit projekt (unified dialog + form grammar).
 * Privacy URL is Canonical Project configuration, persisted via Platform API.
 */
export function ProjectEditDialog({
  open,
  canonicalProjectId,
  canonicalProjectName,
  companies,
  onClose,
  onSubmit,
}: ProjectEditDialogProps) {
  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<NonNullable<PlatformCanonicalProject['status']>>('draft');
  const [metadata, setMetadata] = useState('');
  const [privacyUrl, setPrivacyUrl] = useState('');
  const [privacyError, setPrivacyError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [privacyChanged, setPrivacyChanged] = useState(false);

  useEffect(() => {
    if (!open) return;
    const projection = canonicalProjectId ? getCanonicalProject(canonicalProjectId) : null;
    const canonical = projection?.project;
    if (canonical !== undefined) {
      setName(canonical.name);
      setCompanyId(projection!.partner.companyId);
      setDescription(canonical.description);
      setStatus(canonical.status ?? 'draft');
      setMetadata(canonical.metadata ?? '');
    }
    setPrivacyUrl('');
    setConfigLoaded(false);
    setPrivacyChanged(false);
    setPrivacyError(null);
    setSaving(false);
    const projectId = canonicalProjectId ?? '';
    if (projectId.length === 0) return;
    const controller = new AbortController();
    void requestProjectConfig(projectId, controller.signal)
      .then((config) => {
        if (controller.signal.aborted) return;
        setPrivacyUrl(config.privacyUrl ?? '');
        setConfigLoaded(true);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setPrivacyError('Zásady se nepodařilo načíst. Název a stav projektu můžete uložit; zásady zůstanou beze změny.');
      });
    return () => {
      controller.abort();
    };
  }, [open, canonicalProjectId]);

  const canOpen =
    open &&
    canonicalProjectId !== null && canonicalProjectId.length > 0;

  return (
    <PlatformDialog
      open={canOpen}
      title="Upravit projekt"
      description="Název a stav projektu. Obsah jednotlivých domů se upravuje samostatně."
      primaryLabel={saving ? 'Ukládám…' : 'Uložit změny'}
      secondaryLabel="Zrušit"
      asForm
      busy={saving}
      onClose={onClose}
      onPrimary={() => {
        if (saving) return;
        const projectId = canonicalProjectId ?? '';
        const parsed = parseProjectPrivacyUrlInput(privacyUrl);
        if (privacyChanged && !parsed.ok) {
          setPrivacyError(parsed.error);
          return;
        }
        if (projectId.length === 0) {
          setPrivacyError('Projekt pro uložení zásad není k dispozici.');
          return;
        }
        setPrivacyError(null);
        setSaving(true);
        void (privacyChanged && parsed.ok
          ? saveProjectConfig({projectId, privacyUrl: parsed.privacyUrl})
          : Promise.resolve())
          .then(() => saveCanonicalProjectMetadata(projectId, {name, description, status, metadata}))
          .then(() => {
            onSubmit();
            setSaving(false);
            onClose();
          })
          .catch((error: unknown) => {
            setSaving(false);
            setPrivacyError(
              error instanceof Error
                ? error.message
                : 'Zásady ochrany osobních údajů se nepodařilo uložit.',
            );
          });
      }}
    >
      {canonicalProjectName !== null && canonicalProjectName.length > 0 ? (
        <p className="text-sm text-builder-ink/70" data-testid="project-privacy-identity">
          {canonicalProjectName}
        </p>
      ) : null}
      {canonicalProjectId !== null ? (
        <>
          <PlatformField label="Název">
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </PlatformField>
          <PlatformField label="Firma">
            <select
              value={companyId}
              disabled
              onChange={(event) => setCompanyId(event.target.value)}
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </PlatformField>
          <PlatformField label="Popis">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </PlatformField>
          <PlatformField label="Stav">
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as NonNullable<PlatformCanonicalProject['status']>)
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </PlatformField>

        </>
      ) : null}
      <PlatformField
        label="Zásady ochrany osobních údajů"
        helper="Odkaz se zobrazí návštěvníkům u formulářů pro odeslání poptávky v tomto projektu."
      >
        <input
          type="url"
          disabled={!configLoaded || saving}
          value={privacyUrl}
          placeholder="https://"
          data-testid="project-privacy-url"
          onChange={(event) => {
            setPrivacyChanged(true);
            setPrivacyUrl(event.target.value);
            setPrivacyError(null);
          }}
        />
      </PlatformField>
      {privacyError !== null ? (
        <p className="text-sm text-builder-draft" role="alert" data-testid="project-privacy-error">
          {privacyError}
        </p>
      ) : null}
      {canonicalProjectId !== null ? (
        <PlatformField label="Metadata">
          <textarea
            value={metadata}
            onChange={(event) => setMetadata(event.target.value)}
            rows={3}
            placeholder="Poznámky, tagy, interní informace"
          />
        </PlatformField>
      ) : null}
    </PlatformDialog>
  );
}
