import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import { resolvePublicLegalHref } from '@embed-engine/platform-access';

import { usePilotWorkspaceContext } from '../../../office/PilotWorkspaceContext';
import {
  COMMERCIAL_PILOT_PROGRAM_PACKAGES,
  formatCommercialPilotPriceCzk,
  resolveCommercialPilotProgramId,
  type CommercialPilotProgramPackage,
} from '../../../office/commercialPilotProgramCatalog';
import {
  getCommercialJourneySelectedProgramId,
  subscribeCommercialJourneySelection,
} from '../../../office/commercialJourneySelection';
import {
  buildCommercialOrderPartnerDetails,
  type CommercialOrderPartnerDetails,
} from '../../../office/commercialOrderPartnerDetails';
import type { PilotWorkspaceCase } from '../../../office/pilotWorkspaceModel';

/** Canonical public contract documents; transactional documents stay individual. */
const CONTRACT_DOCS = Object.freeze([
  {
    id: 'terms',
    label: 'Všeobecné obchodní podmínky',
    fileName: '01–obchodni-podminky.pdf',
  },
  {
    id: 'framework',
    label: 'Rámcová smlouva',
    fileName: '02_ramcova-smlouva.pdf',
  },
  {
    id: 'implementation',
    label: 'Implementační standard',
    fileName: '03_implementacni-standard.pdf',
  },
  { id: 'dpa', label: 'GDPR', fileName: '04_dpa.pdf' },
] as const);

type CompleteOrderScreenProps = {
  readonly activeCase: PilotWorkspaceCase;
};

/**
 * PT-CJ-03 — Dokončit objednávku (Apple Easy).
 * One screen · one checkbox · one CTA. Visual order confirmation only.
 */
export function CompleteOrderScreen({ activeCase }: CompleteOrderScreenProps) {
  const {
    navigateCommercialJourneyStep,
    partnerAuthorityReady,
    partnerAuthorityRevision,
  } = usePilotWorkspaceContext();
  const selectedId = useSyncExternalStore(
    subscribeCommercialJourneySelection,
    getCommercialJourneySelectedProgramId,
    getCommercialJourneySelectedProgramId,
  );
  const program = resolveSelectedProgram(activeCase, selectedId);

  const initialDetails = useMemo(
    () =>
      partnerAuthorityReady
        ? buildCommercialOrderPartnerDetails(activeCase)
        : null,
    [activeCase, partnerAuthorityReady, partnerAuthorityRevision],
  );
  const [details, setDetails] =
    useState<CommercialOrderPartnerDetails | null>(initialDetails);
  const [editing, setEditing] = useState(false);
  const [docsAccepted, setDocsAccepted] = useState(false);

  useEffect(() => {
    if (!partnerAuthorityReady) {
      setDetails(null);
      return;
    }

    setDetails(buildCommercialOrderPartnerDetails(activeCase));
    setEditing(false);
    setDocsAccepted(false);
  }, [
    activeCase.id,
    partnerAuthorityReady,
    partnerAuthorityRevision,
  ]);

  if (!partnerAuthorityReady || details === null) {
    return (
      <div
        className="office-cj-screen office-cj-screen--complete-order"
        data-testid="commercial-journey-screen"
        data-cj-step="complete_order"
        data-cj-customer-authority="loading"
      >
        <p className="office-cj-pilot__hint">
          Načítám firemní údaje…
        </p>
      </div>
    );
  }

  const canConfirm = program !== null && docsAccepted;

  return (
    <div
      className="office-cj-screen office-cj-screen--complete-order"
      data-testid="commercial-journey-screen"
      data-cj-step="complete_order"
      data-cj-complete-order="true"
    >
      <header className="office-cj-order__head">
        <p className="office-cj-pilot__eyebrow">Objednávka</p>
        <h2 className="office-cj-pilot__title" data-testid="cj-order-title">
          Dokončit objednávku
        </h2>
      </header>

      <section className="office-cj-order__panel" data-testid="cj-order-partner">
        <div className="office-cj-order__panel-bar">
          <h3 className="office-cj-order__section-title">Údaje partnera</h3>
          <button
            type="button"
            className="office-cj-order__edit"
            data-testid="cj-order-edit-toggle"
            onClick={() => setEditing((value) => !value)}
          >
            {editing ? 'Hotovo' : 'Upravit údaje'}
          </button>
        </div>

        {editing ? (
          <div className="office-cj-order__form" data-testid="cj-order-edit-form">
            <OrderField
              id="company"
              label="Společnost"
              value={details.companyName}
              onChange={(companyName) =>
                setDetails((current) =>
                  current === null ? current : { ...current, companyName },
                )
              }
            />
            <div className="office-cj-order__form-row">
              <OrderField
                id="ico"
                label="IČ"
                value={details.ico}
                onChange={(ico) => setDetails((current) =>
                  current === null ? current : { ...current, ico },
                )}
              />
              <OrderField
                id="dic"
                label="DIČ"
                value={details.dic}
                onChange={(dic) => setDetails((current) =>
                  current === null ? current : { ...current, dic },
                )}
              />
            </div>
            <OrderField
              id="contact"
              label="Kontaktní osoba"
              value={details.contactName}
              onChange={(contactName) =>
                setDetails((current) =>
                  current === null ? current : { ...current, contactName },
                )
              }
            />
            <div className="office-cj-order__form-row">
              <OrderField
                id="email"
                label="E-mail"
                type="email"
                value={details.email}
                onChange={(email) =>
                  setDetails((current) =>
                    current === null ? current : { ...current, email },
                  )
                }
              />
              <OrderField
                id="phone"
                label="Telefon"
                type="tel"
                value={details.phone}
                onChange={(phone) =>
                  setDetails((current) =>
                    current === null ? current : { ...current, phone },
                  )
                }
              />
            </div>
            <OrderField
              id="address"
              label="Adresa"
              value={details.address}
              onChange={(address) =>
                setDetails((current) =>
                  current === null ? current : { ...current, address },
                )
              }
            />
          </div>
        ) : (
          <dl className="office-cj-summary" data-testid="cj-order-partner-summary">
            <div>
              <dt>Společnost</dt>
              <dd>{details.companyName}</dd>
            </div>
            <div>
              <dt>IČ</dt>
              <dd>{details.ico || '—'}</dd>
            </div>
            <div>
              <dt>DIČ</dt>
              <dd>{details.dic || '—'}</dd>
            </div>
            <div>
              <dt>Kontaktní osoba</dt>
              <dd>{details.contactName}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{details.email || '—'}</dd>
            </div>
            <div>
              <dt>Telefon</dt>
              <dd>{details.phone || '—'}</dd>
            </div>
            <div>
              <dt>Adresa</dt>
              <dd>{details.address || '—'}</dd>
            </div>
          </dl>
        )}
      </section>

      <section className="office-cj-order__panel" data-testid="cj-order-program">
        <h3 className="office-cj-order__section-title">Vybraný program</h3>
        {program === null ? (
          <p className="office-cj-pilot__hint">Vyberte pilotní program.</p>
        ) : (
          <dl className="office-cj-summary">
            <div>
              <dt>Program</dt>
              <dd data-testid="cj-order-program-name">{program.name}</dd>
            </div>
            <div>
              <dt>Cena</dt>
              <dd data-testid="cj-order-program-price">
                {formatCommercialPilotPriceCzk(program.priceCzk)}
              </dd>
            </div>
            <div>
              <dt>Navazující tarif</dt>
              <dd data-testid="cj-order-follow-on">{program.followOnTariff}</dd>
            </div>
          </dl>
        )}
      </section>

      <section className="office-cj-order__panel" data-testid="cj-order-docs">
        <h3 className="office-cj-order__section-title">Smluvní dokumenty</h3>
        <label className="office-cj-order__check">
          <input
            type="checkbox"
            checked={docsAccepted}
            onChange={(event) => setDocsAccepted(event.target.checked)}
            data-testid="cj-order-docs-accepted"
          />
          <span>Potvrzuji, že jsem se seznámil se smluvními dokumenty.</span>
        </label>
        <ul className="office-cj-order__doc-links" data-testid="cj-order-doc-links">
          {CONTRACT_DOCS.map((doc) => (
            <li key={doc.id}>
              <a
                href={resolvePublicLegalHref(doc.fileName)}
                target="_blank"
                rel="noreferrer"
                data-testid={`cj-order-doc-${doc.id}`}
              >
                {doc.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        className="office-cj-pilot__continue"
        data-testid="cj-order-confirm"
        disabled={!canConfirm}
        onClick={() => navigateCommercialJourneyStep('payment')}
      >
        Potvrdit objednávku
      </button>
    </div>
  );
}

function OrderField({
  id,
  label,
  value,
  onChange,
  type = 'text',
}: {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly type?: 'text' | 'email' | 'tel';
}) {
  return (
    <label className="office-cj-order__field" htmlFor={`cj-order-${id}`}>
      <span>{label}</span>
      <input
        id={`cj-order-${id}`}
        data-testid={`cj-order-field-${id}`}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function resolveSelectedProgram(
  activeCase: PilotWorkspaceCase,
  selectedId: ReturnType<typeof getCommercialJourneySelectedProgramId>,
): CommercialPilotProgramPackage | null {
  if (selectedId !== null) {
    return (
      COMMERCIAL_PILOT_PROGRAM_PACKAGES.find((pkg) => pkg.id === selectedId) ??
      null
    );
  }
  const fromCase = resolveCommercialPilotProgramId(activeCase.packageName);
  if (fromCase === null) return null;
  return (
    COMMERCIAL_PILOT_PROGRAM_PACKAGES.find((pkg) => pkg.id === fromCase) ?? null
  );
}
