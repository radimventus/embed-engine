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

  it('mirrors PDF catalog: Pilot · Pilot TIP · Pilot Max', () => {
    assert.deepEqual(
      COMMERCIAL_PILOT_PROGRAM_PACKAGES.map((pkg) => pkg.name),
      ['Pilot', 'Pilot TIP', 'Pilot Max'],
    );
    assert.deepEqual(
      COMMERCIAL_PILOT_PROGRAM_PACKAGES.map((pkg) => pkg.priceCzk),
      [9_970, 19_970, 59_970],
    );
    assert.equal(
      COMMERCIAL_PILOT_PROGRAM_PACKAGES.find((pkg) => pkg.recommended)?.id,
      'pilot-plus',
    );
    assert.equal(
      COMMERCIAL_PILOT_PROGRAM_PACKAGES.find((pkg) => pkg.priceAnchor)?.id,
      'pilot-max',
    );
    assert.match(formatCommercialPilotPriceCzk(19_970), /19.?970/);
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
    assert.match(pilot, /navigateCommercialJourneyStep\('complete_order'\)/);

    const packageGrid = pilot.indexOf('data-testid="cj-pilot-packages"');
    const promise = pilot.indexOf(
      'office-cj-pilot-decision__promise',
      packageGrid,
    );
    const summary = pilot.indexOf(
      'data-testid="cj-pilot-summary"',
      promise,
    );
    const finalSchema = pilot.indexOf('<PilotDecisionBridge />', summary);

    assert.ok(packageGrid >= 0);
    assert.ok(packageGrid < promise);
    assert.ok(promise < summary);
    assert.ok(summary < finalSchema);
    assert.match(
      pilot,
      /COMMERCIAL_PILOT_PROGRAM_PACKAGES\.find\(\(pkg\) => pkg\.recommended\)\?\.id/,
    );
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
    assert.match(studio, /Po ověření platby vám pošleme instrukce k podkladům/);
    assert.match(studio, /Otevřít CONIS Studio/);
    assert.match(journey, /office-cj-pilot__continue/);
    assert.doesNotMatch(journey, /office_handoff|pilot_confirmed/);
    assert.doesNotMatch(
      COMMERCIAL_PILOT_PROGRAM_PACKAGES.map((pkg) => pkg.name).join('|'),
      /Starter|Studio Partner/,
    );
    assert.match(css, /office-cj-pilot-card--recommended/);
    assert.match(css, /office-cj-payment__qr/);
    assert.match(css, /office-cj-enter/);
    assert.match(css, /--cj-pilot-navy/);
  });
});
