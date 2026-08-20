import { useId, useState } from 'react';

import {
  PlatformDialog,
  PlatformField,
} from '@embed-engine/platform-shell';

import {
  OFFICE_PARTNER_STATUS_ORDER,
  officePartnerStatusLabel,
  type OfficePartnerDraft,
  type OfficePartnerStatus,
} from '../../office/officePartnerModel';

type PartnerFormDialogProps = {
  readonly open: boolean;
  readonly mode: 'create' | 'edit';
  readonly initial: OfficePartnerDraft;
  readonly busy?: boolean;
  readonly error?: string | null;
  readonly onClose: () => void;
  readonly onSubmit: (draft: OfficePartnerDraft) => void;
};

/**
 * OF-02 — Create / edit partner dialog (Company + Contact cards).
 * Mount with a fresh `key` when opening so `initial` seeds cleanly.
 */
export function PartnerFormDialog({
  open,
  mode,
  initial,
  busy = false,
  error = null,
  onClose,
  onSubmit,
}: PartnerFormDialogProps) {
  const formId = useId();
  const [draft, setDraft] = useState<OfficePartnerDraft>(initial);

  const title = mode === 'create' ? 'Nový partner' : 'Upravit partnera';
  const primaryLabel = mode === 'create' ? 'Založit partnera' : 'Uložit změny';
  const nameOk = draft.name.trim().length > 0;
  const contactOk = draft.contact.name.trim().length > 0;

  return (
    <PlatformDialog
      open={open}
      title={title}
      description="Partner je hlavní entita Office Studia — firma, kontakt a status."
      primaryLabel={primaryLabel}
      primaryDisabled={!nameOk || !contactOk}
      busy={busy}
      asForm
      onClose={onClose}
      onPrimary={() => onSubmit(draft)}
    >
      <div className="office-partner-form" id={formId}>
        <PlatformField label="Název partnera" htmlFor={`${formId}-name`}>
          <input
            id={`${formId}-name`}
            value={draft.name}
            onChange={(event) =>
              setDraft({ ...draft, name: event.target.value })
            }
            required
          />
        </PlatformField>

        <PlatformField label="Status" htmlFor={`${formId}-status`}>
          <select
            id={`${formId}-status`}
            value={draft.status}
            onChange={(event) =>
              setDraft({
                ...draft,
                status: event.target.value as OfficePartnerStatus,
              })
            }
          >
            {OFFICE_PARTNER_STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {officePartnerStatusLabel(status)}
              </option>
            ))}
          </select>
        </PlatformField>

        <PlatformField label="Další krok" htmlFor={`${formId}-next`}>
          <input
            id={`${formId}-next`}
            value={draft.nextStep}
            onChange={(event) =>
              setDraft({ ...draft, nextStep: event.target.value })
            }
          />
        </PlatformField>

        <p className="office-partner-form__section">Firma</p>
        <PlatformField label="Obchodní název" htmlFor={`${formId}-legal`}>
          <input
            id={`${formId}-legal`}
            value={draft.company.legalName}
            onChange={(event) =>
              setDraft({
                ...draft,
                company: { ...draft.company, legalName: event.target.value },
              })
            }
          />
        </PlatformField>
        <div className="office-partner-form__row">
          <PlatformField label="IČO" htmlFor={`${formId}-ico`}>
            <input
              id={`${formId}-ico`}
              value={draft.company.ico}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  company: { ...draft.company, ico: event.target.value },
                })
              }
            />
          </PlatformField>
          <PlatformField label="Město" htmlFor={`${formId}-city`}>
            <input
              id={`${formId}-city`}
              value={draft.company.city}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  company: { ...draft.company, city: event.target.value },
                })
              }
            />
          </PlatformField>
        </div>
        <PlatformField label="Země" htmlFor={`${formId}-country`}>
          <input
            id={`${formId}-country`}
            value={draft.company.country}
            onChange={(event) =>
              setDraft({
                ...draft,
                company: { ...draft.company, country: event.target.value },
              })
            }
          />
        </PlatformField>

        <p className="office-partner-form__section">Kontakt</p>
        <PlatformField label="Jméno kontaktu" htmlFor={`${formId}-contact`}>
          <input
            id={`${formId}-contact`}
            value={draft.contact.name}
            onChange={(event) =>
              setDraft({
                ...draft,
                contact: { ...draft.contact, name: event.target.value },
              })
            }
            required
          />
        </PlatformField>
        <PlatformField label="E-mail" htmlFor={`${formId}-email`}>
          <input
            id={`${formId}-email`}
            type="email"
            value={draft.contact.email}
            onChange={(event) =>
              setDraft({
                ...draft,
                contact: { ...draft.contact, email: event.target.value },
              })
            }
          />
        </PlatformField>
        <div className="office-partner-form__row">
          <PlatformField label="Telefon" htmlFor={`${formId}-phone`}>
            <input
              id={`${formId}-phone`}
              value={draft.contact.phone}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  contact: { ...draft.contact, phone: event.target.value },
                })
              }
            />
          </PlatformField>
          <PlatformField label="Role" htmlFor={`${formId}-role`}>
            <input
              id={`${formId}-role`}
              value={draft.contact.role}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  contact: { ...draft.contact, role: event.target.value },
                })
              }
            />
          </PlatformField>
        </div>
        {error !== null && error.length > 0 ? (
          <p className="office-partner-form__error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </PlatformDialog>
  );
}
