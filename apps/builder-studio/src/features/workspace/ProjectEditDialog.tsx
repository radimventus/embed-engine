import {
  useEffect,
  useId,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';

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
 * EPIC-BX-01 — Upravit projekt (metadata only — no House Package fields).
 */
export function ProjectEditDialog({
  open,
  project,
  companies,
  onClose,
  onSubmit,
}: ProjectEditDialogProps) {
  const titleId = useId();
  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<WorkspaceProjectStatus>('draft');
  const [slug, setSlug] = useState('');
  const [metadata, setMetadata] = useState('');

  useEffect(() => {
    if (!open || project === null) {
      return;
    }
    setName(project.name);
    setCompanyId(project.companyId);
    setDescription(project.description);
    setStatus(project.status);
    setSlug(project.slug);
    setMetadata(project.metadata);
  }, [open, project]);

  if (!open || project === null) {
    return null;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({
      name,
      companyId,
      description,
      status,
      slug,
      metadata,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#23334C]/35 px-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-[16px] border border-builder-line bg-white p-6 shadow-[0_20px_48px_rgba(35,51,76,0.18)]"
      >
        <h2 id={titleId} className="text-xl font-semibold text-builder-ink">
          Upravit projekt
        </h2>
        <p className="mt-1 text-sm text-builder-muted">
          Pouze metadata projektu — obsah se upravuje v sekcích vlevo.
        </p>

        <div className="mt-5 space-y-4">
          <Field label="Název">
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Firma">
            <select
              value={companyId}
              onChange={(event) => setCompanyId(event.target.value)}
              className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Popis">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Stav">
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as WorkspaceProjectStatus)
              }
              className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Slug">
            <input
              required
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 font-mono text-sm"
            />
          </Field>
          <Field label="Metadata">
            <textarea
              value={metadata}
              onChange={(event) => setMetadata(event.target.value)}
              rows={3}
              className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
              placeholder="Poznámky, tagy, interní informace"
            />
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-[#DDE5EF] bg-white px-4 py-2 text-sm font-medium"
          >
            Zrušit
          </button>
          <button
            type="submit"
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2 text-sm font-medium text-white"
          >
            Uložit změny
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-builder-ink">{label}</span>
      {children}
    </label>
  );
}
