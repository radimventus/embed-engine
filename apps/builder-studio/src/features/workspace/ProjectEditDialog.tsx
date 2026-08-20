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
import type { UpdateWorkspaceProjectInput } from './useWorkspaceController';
import type {
  WorkspaceCompany,
  WorkspaceProject,
  WorkspaceProjectStatus,
} from './workspaceRegistry';

type ProjectEditDialogProps = {
  readonly open: boolean;
  readonly project: WorkspaceProject | null;
  readonly canonicalProjectId: string | null;
  readonly canonicalProjectName: string | null;
  readonly companies: readonly WorkspaceCompany[];
  readonly onClose: () => void;
  readonly onSubmit: (input: UpdateWorkspaceProjectInput) => void;
};

const STATUS_OPTIONS: readonly {
  readonly id: WorkspaceProjectStatus;
  readonly label: string;
}[] = [
  { id: 'draft', label: 'Koncept' },
  { id: 'ready', label: 'Připraveno' },
  { id: 'published', label: 'Publikováno' },
];

/**
 * VR-FIX-03 — Upravit projekt (unified dialog + form grammar).
 * Privacy URL is Canonical Project configuration, persisted via Platform API.
 */
export function ProjectEditDialog({
  open,
  project,
  canonicalProjectId,
  canonicalProjectName,
  companies,
  onClose,
  onSubmit,
}: ProjectEditDialogProps) {
  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<WorkspaceProjectStatus>('draft');
  const [slug, setSlug] = useState('');
  const [metadata, setMetadata] = useState('');
  const [privacyUrl, setPrivacyUrl] = useState('');
  const [privacyError, setPrivacyError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (project !== null) {
      setName(project.name);
      setCompanyId(project.companyId);
      setDescription(project.description);
      setStatus(project.status);
      setSlug(project.slug);
      setMetadata(project.metadata);
    }
    setPrivacyUrl('');
    setPrivacyError(null);
    setSaving(false);
    const projectId = canonicalProjectId ?? project?.folderId ?? '';
    if (projectId.length === 0) return;
    const controller = new AbortController();
    void requestProjectConfig(projectId, controller.signal)
      .then((config) => {
        if (controller.signal.aborted) return;
        setPrivacyUrl(config.privacyUrl ?? '');
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setPrivacyError('Aktuální zásady ochrany osobních údajů se nepodařilo načíst.');
      });
    return () => {
      controller.abort();
    };
  }, [open, project, canonicalProjectId]);

  const canOpen =
    open &&
    (project !== null ||
      (canonicalProjectId !== null && canonicalProjectId.length > 0));

  return (
    <PlatformDialog
      open={canOpen}
      title="Upravit projekt"
      description="Pouze metadata projektu — obsah se upravuje v produktových modulech."
      primaryLabel={saving ? 'Ukládám…' : 'Uložit změny'}
      secondaryLabel="Zrušit"
      asForm
      busy={saving}
      onClose={onClose}
      onPrimary={() => {
        if (saving) return;
        const projectId = canonicalProjectId ?? project?.folderId ?? '';
        const parsed = parseProjectPrivacyUrlInput(privacyUrl);
        if (!parsed.ok) {
          setPrivacyError(parsed.error);
          return;
        }
        if (projectId.length === 0) {
          setPrivacyError('Projekt pro uložení zásad není k dispozici.');
          return;
        }
        setPrivacyError(null);
        setSaving(true);
        void saveProjectConfig({
          projectId,
          privacyUrl: parsed.privacyUrl,
        })
          .then(() => {
            if (project !== null) {
              onSubmit({
                name,
                companyId,
                description,
                status,
                slug,
                metadata,
              });
            }
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
      {project !== null ? (
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
                setStatus(event.target.value as WorkspaceProjectStatus)
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </PlatformField>
          <PlatformField label="Slug" helper="URL identifikátor projektu.">
            <input
              required
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
          </PlatformField>
        </>
      ) : null}
      <PlatformField
        label="Zásady ochrany osobních údajů"
        helper="Odkaz se zobrazí návštěvníkům u formulářů pro odeslání poptávky v tomto projektu."
      >
        <input
          type="url"
          value={privacyUrl}
          placeholder="https://"
          data-testid="project-privacy-url"
          onChange={(event) => {
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
      {project !== null ? (
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
