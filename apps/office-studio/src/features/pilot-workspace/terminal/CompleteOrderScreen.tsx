import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

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

/** Official deal pack — order matches commercial PDF / deal SSOT. */
const CONTRACT_DOCS = Object.freeze([
  {
    id: 'electronic-order',
    label: 'Elektronická objednávka',
    href: '/deal/electronic-order.html',
  },
  {
    id: 'framework',
    label: 'Rámcová smlouva',
    href: '/deal/framework-agreement.html',
  },
  {
    id: 'implementation',
    label: 'Implementační standard',
    href: '/deal/implementation-standard.html',
  },
  { id: 'dpa', label: 'DPA', href: '/deal/dpa.html' },
  { id: 'vop', label: 'VOP', href: '/deal/vop.html' },
] as const);

type CompleteOrderScreenProps = {
  readonly activeCase: PilotWorkspaceCase;
};

/**
 * PT-CJ-03 — Dokončit objednávku (Apple Easy).
 * One screen · one checkbox · one CTA. Visual order confirmation only.
 */
export function CompleteOrderScreen({ activeCase }: CompleteOrderScreenProps) {
  const { navigateWorkflowStep } = usePilotWorkspaceContext();
  const selectedId = useSyncExternalStore(
    subscribeCommercialJourneySelection,
    getCommercialJourneySelectedProgramId,
    getCommercialJourneySelectedProgramId,
  );
  const program = resolveSelectedProgram(activeCase, selectedId);

  const initialDetails = useMemo(
    () => buildCommercialOrderPartnerDetails(activeCase),
    [activeCase],
  );
  const [details, setDetails] =
    useState<CommercialOrderPartnerDetails>(initialDetails);
  const [editing, setEditing] = useState(false);
  const [docsAccepted, setDocsAccepted] = useState(false);

  useEffect(() => {
    setDetails(buildCommercialOrderPartnerDetails(activeCase));
    setEditing(false);
    setDocsAccepted(false);
  }, [activeCase.id]);

  const canConfirm = program !== null && docsAccepted;

  return (
    <div
      className="office-cj-screen office-cj-screen--complete-order"
      data-testid="commercial-journey-screen"
      data-cj-step="complete_order"
      data-cj-complete-order="true"
    >
      <header className="office-cj-order__head">
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
                setDetails((current) => ({ ...current, companyName }))
              }
            />
            <div className="office-cj-order__form-row">
              <OrderField
                id="ico"
                label="IČ"
                value={details.ico}
                onChange={(ico) => setDetails((current) => ({ ...current, ico }))}
              />
              <OrderField
                id="dic"
                label="DIČ"
                value={details.dic}
                onChange={(dic) => setDetails((current) => ({ ...current, dic }))}
              />
            </div>
            <OrderField
              id="contact"
              label="Kontaktní osoba"
              value={details.contactName}
              onChange={(contactName) =>
                setDetails((current) => ({ ...current, contactName }))
              }
            />
            <div className="office-cj-order__form-row">
              <OrderField
                id="email"
                label="E-mail"
                type="email"
                value={details.email}
                onChange={(email) =>
                  setDetails((current) => ({ ...current, email }))
                }
              />
              <OrderField
                id="phone"
                label="Telefon"
                type="tel"
                value={details.phone}
                onChange={(phone) =>
                  setDetails((current) => ({ ...current, phone }))
                }
              />
            </div>
            <OrderField
              id="address"
              label="Adresa"
              value={details.address}
              onChange={(address) =>
                setDetails((current) => ({ ...current, address }))
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
                href={doc.href}
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
        onClick={() => navigateWorkflowStep('payment')}
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
