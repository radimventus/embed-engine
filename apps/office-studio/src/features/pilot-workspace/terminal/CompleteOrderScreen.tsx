import { useState, useSyncExternalStore } from 'react';

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
import type { PilotWorkspaceCase } from '../../../office/pilotWorkspaceModel';

const CONTRACT_DOCS = Object.freeze([
  { id: 'vop', label: 'Všeobecné obchodní podmínky CONIS' },
  { id: 'framework', label: 'Rámcová smlouva' },
  { id: 'dpa', label: 'Dohoda o zpracování osobních údajů (DPA)' },
  { id: 'order', label: 'Elektronická objednávka' },
] as const);

type CompleteOrderScreenProps = {
  readonly activeCase: PilotWorkspaceCase;
};

/**
 * PT-CJ-02 — Dokončit objednávku (partner production screen).
 * Visual acceptance only — no document generation · no BA.
 */
export function CompleteOrderScreen({ activeCase }: CompleteOrderScreenProps) {
  const { navigateWorkflowStep } = usePilotWorkspaceContext();
  const selectedId = useSyncExternalStore(
    subscribeCommercialJourneySelection,
    getCommercialJourneySelectedProgramId,
    getCommercialJourneySelectedProgramId,
  );
  const program = resolveSelectedProgram(activeCase, selectedId);
  const contact = activeCase.contacts[0] ?? null;

  const [acceptedVop, setAcceptedVop] = useState(false);
  const [acceptedOrder, setAcceptedOrder] = useState(false);

  const canConfirm = program !== null && acceptedVop && acceptedOrder;

  return (
    <div
      className="office-cj-screen office-cj-screen--complete-order"
      data-testid="commercial-journey-screen"
      data-cj-step="complete_order"
    >
      <header className="office-cj-order__head">
        <p className="office-cj-pilot__eyebrow">Dokončit objednávku</p>
        <h2 className="office-cj-pilot__title">Potvrzení objednávky</h2>
        <p className="office-cj-pilot__lead">
          Zkontrolujte údaje a potvrďte smluvní dokumenty.
        </p>
      </header>

      <section className="office-cj-order__panel" data-testid="cj-order-partner">
        <h3 className="office-cj-order__section-title">Údaje partnera</h3>
        <dl className="office-cj-summary">
          <div>
            <dt>Partner</dt>
            <dd>{activeCase.partnerName}</dd>
          </div>
          <div>
            <dt>Společnost</dt>
            <dd>{activeCase.companyName}</dd>
          </div>
          <div>
            <dt>Kontakt</dt>
            <dd>
              {contact === null
                ? '—'
                : `${contact.name} · ${contact.email}`}
            </dd>
          </div>
        </dl>
      </section>

      <section className="office-cj-order__panel" data-testid="cj-order-program">
        <h3 className="office-cj-order__section-title">Vybraný program</h3>
        {program === null ? (
          <p className="office-cj-pilot__hint">
            Nejprve vyberte pilotní program.
          </p>
        ) : (
          <dl className="office-cj-summary">
            <div>
              <dt>Program</dt>
              <dd>{program.name}</dd>
            </div>
            <div>
              <dt>Cena</dt>
              <dd>{formatCommercialPilotPriceCzk(program.priceCzk)}</dd>
            </div>
            <div>
              <dt>Licence</dt>
              <dd>
                {program.housesLabel} · {program.trialDays} dní
              </dd>
            </div>
          </dl>
        )}
      </section>

      <section className="office-cj-order__panel" data-testid="cj-order-docs">
        <h3 className="office-cj-order__section-title">Smluvní dokumenty</h3>
        <ul className="office-cj-order__docs">
          {CONTRACT_DOCS.map((doc) => (
            <li key={doc.id}>{doc.label}</li>
          ))}
        </ul>
        <label className="office-cj-order__check">
          <input
            type="checkbox"
            checked={acceptedVop}
            onChange={(event) => setAcceptedVop(event.target.checked)}
            data-testid="cj-order-check-vop"
          />
          <span>
            Potvrzuji VOP a Rámcovou smlouvu CONIS včetně DPA.
          </span>
        </label>
        <label className="office-cj-order__check">
          <input
            type="checkbox"
            checked={acceptedOrder}
            onChange={(event) => setAcceptedOrder(event.target.checked)}
            data-testid="cj-order-check-order"
          />
          <span>
            Souhlasím s vystavením elektronické objednávky vybraného programu.
          </span>
        </label>
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
