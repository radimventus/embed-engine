import { useEffect, useRef, useState } from 'react';

import {
  PlatformDialog,
  PlatformField,
} from '@embed-engine/platform-shell';

import {
  OBJECT_TYPE_OPTIONS,
  type CreateWorkspaceProjectInput,
  type WorkspaceCompany,
} from './workspaceRegistry';

type ProjectCreateDialogProps = {
  readonly open: boolean;
  readonly companies: readonly WorkspaceCompany[];
  readonly busy: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (input: CreateWorkspaceProjectInput) => void;
};

/**
 * VR-FIX-03 — Nový projekt (unified dialog + form grammar).
 */
export function ProjectCreateDialog({
  open,
  companies,
  busy,
  onClose,
  onSubmit,
}: ProjectCreateDialogProps) {
  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? '__new__');
  const [companyName, setCompanyName] = useState('');
  const [objectType, setObjectType] = useState(
    OBJECT_TYPE_OPTIONS[0]?.id ?? 'villa',
  );
  const [description, setDescription] = useState('');
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName('');
    setCompanyId(companies[0]?.id ?? '__new__');
    setCompanyName('');
    setObjectType(OBJECT_TYPE_OPTIONS[0]?.id ?? 'villa');
    setDescription('');
  }, [open, companies]);

  return (
    <PlatformDialog
      open={open}
      title="Nový projekt"
      description="Projekt patří firmě ve Workspace. Typ objektu určí výchozí obsah."
      primaryLabel={busy ? 'Zakládám…' : 'Založit projekt'}
      secondaryLabel="Zrušit"
      busy={busy}
      asForm
      onClose={onClose}
      onPrimary={() => {
        onSubmit({
          name,
          companyId,
          companyName: companyId === '__new__' ? companyName : undefined,
          objectType,
          description,
        });
      }}
    >
      <PlatformField label="Název projektu">
        <input
          ref={firstFieldRef}
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="např. Harmony 140"
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
          <option value="__new__">＋ Nová firma…</option>
        </select>
      </PlatformField>

      {companyId === '__new__' && (
        <PlatformField label="Název nové firmy">
          <input
            required
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="např. AC Modular"
          />
        </PlatformField>
      )}

      <PlatformField label="Typ objektu">
        <select
          value={objectType}
          onChange={(event) => setObjectType(event.target.value)}
        >
          {OBJECT_TYPE_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </PlatformField>

      <PlatformField
        label="Popis"
        helper="Krátký popis pomůže týmu najít projekt ve Workspace."
      >
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          placeholder="Krátký popis projektu"
        />
      </PlatformField>
    </PlatformDialog>
  );
}
