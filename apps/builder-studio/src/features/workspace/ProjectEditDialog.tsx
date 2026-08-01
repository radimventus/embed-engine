import { useEffect, useState } from 'react';

import {
  PlatformDialog,
  PlatformField,
} from '@embed-engine/platform-shell';

import type { UpdateWorkspaceProjectInput } from './useWorkspaceController';
import type {
  WorkspaceCompany,
  WorkspaceProject,
  WorkspaceProjectStatus,
} from './workspaceRegistry';

type ProjectEditDialogProps = {
  readonly open: boolean;
  readonly project: WorkspaceProject | null;
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
 */
export function ProjectEditDialog({
  open,
  project,
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

  useEffect(() => {
    if (!open || project === null) return;
    setName(project.name);
    setCompanyId(project.companyId);
    setDescription(project.description);
    setStatus(project.status);
    setSlug(project.slug);
    setMetadata(project.metadata);
  }, [open, project]);

  return (
    <PlatformDialog
      open={open && project !== null}
      title="Upravit projekt"
      description="Pouze metadata projektu — obsah se upravuje v produktových modulech."
      primaryLabel="Uložit změny"
      secondaryLabel="Zrušit"
      asForm
      onClose={onClose}
      onPrimary={() => {
        onSubmit({
          name,
          companyId,
          description,
          status,
          slug,
          metadata,
        });
      }}
    >
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
      <PlatformField label="Metadata">
        <textarea
          value={metadata}
          onChange={(event) => setMetadata(event.target.value)}
          rows={3}
          placeholder="Poznámky, tagy, interní informace"
        />
      </PlatformField>
    </PlatformDialog>
  );
}
