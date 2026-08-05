/**
 * PT-CJ-02 — Pilot Program + Lean Commercial Journey.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  COMMERCIAL_JOURNEY_STEP_DEFS,
} from './commercialJourneyModel';
import {
  COMMERCIAL_PILOT_PROGRAM_PACKAGES,
  formatCommercialPilotPriceCzk,
  resolveCommercialPilotProgramId,
} from './commercialPilotProgramCatalog';

const root = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(join(root, '..', relative), 'utf8');
}

describe('PT-CJ-02 Pilot Program + lean journey', () => {
  it('keeps lean five-step partner path', () => {
    assert.deepEqual(
      COMMERCIAL_JOURNEY_STEP_DEFS.map((step) => step.id),
      [
        'welcome',
        'pilot_program',
        'complete_order',
        'payment',
        'conis_studio',
      ],
    );
    assert.deepEqual(
      COMMERCIAL_JOURNEY_STEP_DEFS.map((step) => step.label),
      [
        'Vítejte',
        'Pilotní program',
        'Dokončit objednávku',
        'Platba',
        'CONIS Studio',
      ],
    );
  });

  it('mirrors PDF catalog: Pilot · Pilot Plus · Pilot Max', () => {
    assert.deepEqual(
      COMMERCIAL_PILOT_PROGRAM_PACKAGES.map((pkg) => pkg.name),
      ['Pilot', 'Pilot Plus', 'Pilot Max'],
    );
    assert.deepEqual(
      COMMERCIAL_PILOT_PROGRAM_PACKAGES.map((pkg) => pkg.priceCzk),
      [4_970, 14_970, 29_970],
    );
    assert.equal(
      COMMERCIAL_PILOT_PROGRAM_PACKAGES.find((pkg) => pkg.recommended)?.id,
      'pilot-plus',
    );
    assert.equal(
      COMMERCIAL_PILOT_PROGRAM_PACKAGES.find((pkg) => pkg.priceAnchor)?.id,
      'pilot-max',
    );
    assert.match(formatCommercialPilotPriceCzk(14_970), /14.?970/);
    assert.equal(resolveCommercialPilotProgramId('Starter'), 'pilot-plus');
  });

  it('wires production screens for the lean purchase path', () => {
    const journey = read(
      'features/pilot-workspace/terminal/CommercialJourneyScreen.tsx',
    );
    const pilot = read(
      'features/pilot-workspace/terminal/PilotProgramScreen.tsx',
    );
    const order = read(
      'features/pilot-workspace/terminal/CompleteOrderScreen.tsx',
    );
    const payment = read(
      'features/pilot-workspace/terminal/PaymentScreen.tsx',
    );
    const studio = read(
      'features/pilot-workspace/terminal/ConisStudioScreen.tsx',
    );
    const catalog = read('office/commercialPilotProgramCatalog.ts');
    const css = read('index.css');

    assert.match(journey, /CompleteOrderScreen|PaymentScreen|ConisStudioScreen/);
    assert.match(pilot, /navigateWorkflowStep\('complete_order'\)/);
    assert.match(order, /Potvrdit objednávku/);
    assert.match(order, /Smluvní dokumenty/);
    assert.match(order, /cj-order-docs-accepted/);
    assert.match(order, /Upravit údaje/);
    assert.match(order, /Navazující tarif/);
    assert.doesNotMatch(order, /cj-order-check-vop/);
    assert.match(payment, /Potvrdit provedení QR platby/);
    assert.match(payment, /cj-qr-code/);
    assert.match(payment, /cj-proforma/);
    assert.match(payment, /QRCode\.toDataURL|openCommercialProformaPdf/);
    assert.match(studio, /Děkujeme\. Platba byla oznámena/);
    assert.match(studio, /Vítejte v CONIS Studio/);
    assert.match(studio, /Podklady můžete nahrát/);
    assert.match(studio, /Otevřít CONIS Studio/);
    assert.match(journey, /office-cj-pilot__continue/);
    assert.doesNotMatch(journey, /office_handoff|pilot_confirmed/);
    assert.doesNotMatch(catalog, /Starter|Studio Partner/);
    assert.match(css, /office-cj-pilot-card--recommended/);
    assert.match(css, /office-cj-payment__qr/);
    assert.match(css, /office-cj-enter/);
    assert.match(css, /--cj-pilot-navy/);
  });
});
