import { useEffect, useMemo, useRef, useState } from 'react';

import {
  createCanonicalPartner,
  createPlatformAccessAuthClient,
  getDefaultCompanyRegistry,
  syncCanonicalRegistryFromAuthority,
} from '@embed-engine/platform-access';
import { PlatformDialog, PlatformField } from '@embed-engine/platform-shell';

import {
  type CreateWorkspaceProjectInput,
  type WorkspaceCompany,
} from './workspaceRegistry';

type ProjectCreateDialogProps = {
  readonly open: boolean;
  readonly companies: readonly WorkspaceCompany[];
  readonly busy: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (
    input: CreateWorkspaceProjectInput,
  ) => Promise<string | null>;
};

/**
 * CAP-PLAT-04R1 — Nový projekt creates Canonical Project only (never a House/model).
 * House/object creation is a separate DOMY operation.
 */
export function ProjectCreateDialog({
  open,
  companies,
  busy,
  onClose,
  onSubmit,
}: ProjectCreateDialogProps) {
  const [name, setName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [description, setDescription] = useState('');
  const [partnerFormOpen, setPartnerFormOpen] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerError, setPartnerError] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdCompanies, setCreatedCompanies] = useState<
    readonly WorkspaceCompany[]
  >([]);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const partnerSelectRef = useRef<HTMLSelectElement>(null);
  const companiesWithCreated = useMemo(
    () => [
      ...companies,
      ...createdCompanies.filter(
        (created) => !companies.some((company) => company.id === created.id),
      ),
    ],
    [companies, createdCompanies],
  );

  useEffect(() => {
    if (!open) return;
    setName('');
    setCompanyId('');
    setDescription('');
    setPartnerFormOpen(false);
    setPartnerName('');
    setPartnerError(null);
    setProjectError(null);
    setSubmitting(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const target = partnerFormOpen
      ? firstFieldRef.current
      : partnerSelectRef.current;
    target?.focus();
  }, [open, partnerFormOpen]);

  if (partnerFormOpen) {
    return (
      <PlatformDialog
        open={open}
        title="Nový partner"
        description="Partner bude dostupný pro tento i další projekty ve Workspace."
        primaryLabel="Přidat partnera"
        secondaryLabel="Zpět k projektu"
        primaryDisabled={partnerName.trim().length === 0}
        asForm
        onClose={onClose}
        onSecondary={() => {
          setPartnerFormOpen(false);
          setPartnerError(null);
        }}
        onPrimary={() => {
          void (async () => {
            try {
              const created = createCanonicalPartner({
                name: partnerName,
              });

              const registry = getDefaultCompanyRegistry();
              const tenant = registry.tenants.find(
                (item) => item.id === created.company.tenantId,
              );

              if (tenant === undefined) {
                throw new Error(
                  'Canonical Partner není v klientském registru kompletní.',
                );
              }

              const persisted =
                await createPlatformAccessAuthClient()
                  .persistCanonicalPartnerAuthority({
                    tenant,
                    company: created.company,
                    workspace: created.workspace,
                  });

              if (!persisted.ok) {
                throw new Error(persisted.error);
              }

              const sync =
                await syncCanonicalRegistryFromAuthority();

              if (!sync.ok) {
                throw new Error(sync.error);
              }

              const company: WorkspaceCompany = {
                id: created.companyId,
                name: created.company.name,
              };

              setCreatedCompanies((current) => [
                ...current.filter(
                  (item) => item.id !== company.id,
                ),
                company,
              ]);
              setCompanyId(company.id);
              setPartnerFormOpen(false);
              setPartnerName('');
              setPartnerError(null);
            } catch (error: unknown) {
              setPartnerError(
                error instanceof Error
                  ? error.message
                  : 'Partner se nepodařilo vytvořit.',
              );
            }
          })();
        }}
      >
        <PlatformField label="Název partnera">
          <input
            ref={firstFieldRef}
            required
            value={partnerName}
            onChange={(event) => setPartnerName(event.target.value)}
            placeholder="např. Test Partner"
          />
        </PlatformField>
        {partnerError !== null ? (
          <p role="alert" className="m-0 text-sm text-red-700">
            {partnerError}
          </p>
        ) : null}
      </PlatformDialog>
    );
  }

  return (
    <PlatformDialog
      open={open}
      title="Nový projekt"
      description="Založí nový Projekt (skupina / program / portfolio). Domovy přidáte samostatně v DOMY."
      primaryLabel={busy || submitting ? 'Zakládám…' : 'Založit projekt'}
      secondaryLabel="Zrušit"
      busy={busy || submitting}
      asForm
      onClose={onClose}
      onPrimary={() => {
        if (companyId.length === 0 || submitting) return;
        setSubmitting(true);
        setProjectError(null);
        void onSubmit({
          name,
          companyId,
          description,
        })
          .then((error) => {
            if (error !== null) {
              setProjectError(error);
            }
          })
          .catch(() => {
            setProjectError('Nepodařilo se založit projekt.');
          })
          .finally(() => {
            setSubmitting(false);
          });
      }}
    >
      <PlatformField label="Partner">
        <select
          ref={partnerSelectRef}
          required
          value={companyId}
          onChange={(event) => setCompanyId(event.target.value)}
        >
          <option value="" disabled>
            Vyberte partnera…
          </option>
          {companiesWithCreated.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </PlatformField>
      <button
        type="button"
        className="platform-btn platform-btn--sm"
        style={{ alignSelf: 'flex-start', marginTop: -2 }}
        onClick={() => {
          setPartnerFormOpen(true);
          setPartnerName('');
          setPartnerError(null);
        }}
      >
        + Nový partner
      </button>

      <PlatformField label="Název projektu">
        <input
          ref={firstFieldRef}
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="např. AC Modular"
        />
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
      {projectError !== null ? (
        <p role="alert" className="m-0 text-sm text-red-700">
          {projectError}
        </p>
      ) : null}
    </PlatformDialog>
  );
}
