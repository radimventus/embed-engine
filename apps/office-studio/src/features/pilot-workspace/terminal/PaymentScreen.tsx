import { useMemo } from 'react';
import { useSyncExternalStore } from 'react';

import { usePilotWorkspaceContext } from '../../../office/PilotWorkspaceContext';
import {
  COMMERCIAL_PILOT_PROGRAM_PACKAGES,
  formatCommercialPilotPriceCzk,
  resolveCommercialPilotProgramId,
} from '../../../office/commercialPilotProgramCatalog';
import {
  getCommercialJourneySelectedProgramId,
  subscribeCommercialJourneySelection,
} from '../../../office/commercialJourneySelection';
import type { PilotWorkspaceCase } from '../../../office/pilotWorkspaceModel';

/** Preview settlement account — same commercial account as Offer Experience. */
const PAYMENT_ACCOUNT = Object.freeze({
  accountNumber: '2303345128/2010',
  iban: 'CZ1520100000002303345128',
  bankName: 'Fio banka',
});

type PaymentScreenProps = {
  readonly activeCase: PilotWorkspaceCase;
};

/**
 * PT-CJ-02 — Platba (proforma + QR preview).
 * Visual only — no payment gateway · no SMTP · no BA.
 */
export function PaymentScreen({ activeCase }: PaymentScreenProps) {
  const { navigateWorkflowStep } = usePilotWorkspaceContext();
  const selectedId = useSyncExternalStore(
    subscribeCommercialJourneySelection,
    getCommercialJourneySelectedProgramId,
    getCommercialJourneySelectedProgramId,
  );

  const program = useMemo(() => {
    const id =
      selectedId ?? resolveCommercialPilotProgramId(activeCase.packageName);
    if (id === null) return null;
    return COMMERCIAL_PILOT_PROGRAM_PACKAGES.find((pkg) => pkg.id === id) ?? null;
  }, [activeCase.packageName, selectedId]);

  const amountCzk = program?.priceCzk ?? 14_970;
  const variableSymbol = variableSymbolFromCaseId(activeCase.id);
  const proformaNumber = `PF-2026-${variableSymbol.slice(-8).padStart(8, '0')}`;
  const qrCells = useMemo(
    () => buildPreviewQrCells(`${PAYMENT_ACCOUNT.iban}:${variableSymbol}:${amountCzk}`),
    [amountCzk, variableSymbol],
  );

  return (
    <div
      className="office-cj-screen office-cj-screen--payment"
      data-testid="commercial-journey-screen"
      data-cj-step="payment"
    >
      <header className="office-cj-order__head">
        <p className="office-cj-pilot__eyebrow">Platba</p>
        <h2 className="office-cj-pilot__title">Proforma a QR platba</h2>
        <p className="office-cj-pilot__lead">
          Úhrada {program?.name ?? 'pilotního programu'} pro{' '}
          {activeCase.companyName}.
        </p>
      </header>

      <section className="office-cj-payment__proforma" data-testid="cj-proforma">
        <h3 className="office-cj-order__section-title">Proforma faktura</h3>
        <dl className="office-cj-summary">
          <div>
            <dt>Číslo</dt>
            <dd data-testid="cj-proforma-number">{proformaNumber}</dd>
          </div>
          <div>
            <dt>Partner</dt>
            <dd>{activeCase.partnerName}</dd>
          </div>
          <div>
            <dt>Program</dt>
            <dd>{program?.name ?? activeCase.packageName}</dd>
          </div>
          <div>
            <dt>Částka</dt>
            <dd>{formatCommercialPilotPriceCzk(amountCzk)}</dd>
          </div>
          <div>
            <dt>Splatnost</dt>
            <dd>14 dní</dd>
          </div>
        </dl>
      </section>

      <section className="office-cj-payment__qr-panel" data-testid="cj-qr-panel">
        <div
          className="office-cj-payment__qr"
          data-testid="cj-qr-code"
          role="img"
          aria-label="QR kód pro platbu"
        >
          {qrCells.map((filled, index) => (
            <span
              key={index}
              className={
                filled
                  ? 'office-cj-payment__qr-cell office-cj-payment__qr-cell--on'
                  : 'office-cj-payment__qr-cell'
              }
            />
          ))}
        </div>
        <dl className="office-cj-summary office-cj-summary--compact">
          <div>
            <dt>Účet</dt>
            <dd>{PAYMENT_ACCOUNT.accountNumber}</dd>
          </div>
          <div>
            <dt>Banka</dt>
            <dd>{PAYMENT_ACCOUNT.bankName}</dd>
          </div>
          <div>
            <dt>VS</dt>
            <dd>{variableSymbol}</dd>
          </div>
          <div>
            <dt>Částka</dt>
            <dd>{formatCommercialPilotPriceCzk(amountCzk)}</dd>
          </div>
        </dl>
      </section>

      <button
        type="button"
        className="office-cj-pilot__continue"
        data-testid="cj-payment-confirm-qr"
        onClick={() => navigateWorkflowStep('conis_studio')}
      >
        Potvrdit provedení QR platby
      </button>
    </div>
  );
}

function variableSymbolFromCaseId(caseId: string): string {
  const digits = caseId.replace(/\D/g, '');
  if (digits.length >= 6) return digits.slice(-10);
  return caseId.replace(/[^0-9A-Z]/gi, '').slice(-10).padStart(6, '0');
}

/** Deterministic visual QR grid for product preview (not a bank SPD encoder). */
function buildPreviewQrCells(seed: string): readonly boolean[] {
  const size = 21;
  const cells: boolean[] = [];
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const finder =
        (x < 7 && y < 7) ||
        (x >= size - 7 && y < 7) ||
        (x < 7 && y >= size - 7);
      if (finder) {
        const ring = x === 0 || y === 0 || x === 6 || y === 6 ||
          (x >= size - 7 && (x === size - 1 || y === 0 || x === size - 7 || y === 6)) ||
          (y >= size - 7 && (y === size - 1 || x === 0 || y === size - 7 || x === 6));
        const core =
          (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
          (x >= size - 5 && x <= size - 3 && y >= 2 && y <= 4) ||
          (x >= 2 && x <= 4 && y >= size - 5 && y <= size - 3);
        cells.push(ring || core);
        continue;
      }
      hash = Math.imul(hash ^ (x * 31 + y), 16777619);
      cells.push((hash & 1) === 1);
    }
  }
  return cells;
}
