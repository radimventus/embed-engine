import { useEffect, useRef, useState } from 'react';

import {
  PlatformDialog,
  PlatformField,
} from '@embed-engine/platform-shell';

import type { CreateWorkspaceObjectInput } from './workspaceRegistry';

type ObjectCreateDialogProps = {
  readonly open: boolean;
  readonly busy: boolean;
  readonly projectLabel: string | null;
  readonly onClose: () => void;
  readonly onSubmit: (input: CreateWorkspaceObjectInput) => void;
};

/**
 * PR-023 — Nový objekt (stejná dialogová gramatika jako Nový projekt).
 */
export function ObjectCreateDialog({
  open,
  busy,
  projectLabel,
  onClose,
  onSubmit,
}: ObjectCreateDialogProps) {
  const [name, setName] = useState('');
  const [internalId, setInternalId] = useState('');
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName('');
    setInternalId('');
  }, [open]);

  return (
    <PlatformDialog
      open={open}
      title="Nový objekt"
      description={
        projectLabel !== null
          ? `Založí nový objekt (dům) v projektu „${projectLabel}“.`
          : 'Založí nový objekt (dům) v aktivním projektu.'
      }
      primaryLabel={busy ? 'Zakládám…' : 'Založit objekt'}
      secondaryLabel="Zrušit"
      busy={busy}
      asForm
      onClose={onClose}
      onPrimary={() => {
        onSubmit({
          name,
          internalId: internalId.trim().length > 0 ? internalId : undefined,
        });
      }}
    >
      <PlatformField label="Název objektu">
        <input
          ref={firstFieldRef}
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="např. Villa 168 B"
        />
      </PlatformField>

      <PlatformField
        label="Interní identifikátor"
        helper="Volitelné. Pokud nevyplníte, vygeneruje se z názvu."
      >
        <input
          value={internalId}
          onChange={(event) => setInternalId(event.target.value)}
          placeholder="např. villa-168-b"
        />
      </PlatformField>
    </PlatformDialog>
  );
}
