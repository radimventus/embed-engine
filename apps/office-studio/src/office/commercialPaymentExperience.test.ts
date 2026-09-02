/**
 * PT-CJ-04 — Payment Experience (proforma + SPD QR).
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  buildCommercialProforma,
  buildSpdQrPayload,
  COMMERCIAL_PAYMENT_ACCOUNT,
  renderCommercialProformaPdf,
} from './commercialPaymentExperience';
import { COMMERCIAL_PILOT_PROGRAM_PACKAGES } from './commercialPilotProgramCatalog';
import { getPilotWorkspaceCase } from './pilotWorkspaceModel';

const root = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(join(root, '..', relative), 'utf8');
}

describe('PT-CJ-04 Payment Experience', () => {
  it('builds proforma and SPD QR from selected program', async () => {
    const activeCase = getPilotWorkspaceCase('villa-168');
    assert.ok(activeCase);
    const proforma = buildCommercialProforma({
      activeCase: {
        ...activeCase,
        billingNumber: '26010',
      },
      program: COMMERCIAL_PILOT_PROGRAM_PACKAGES.find(
        (pkg) => pkg.id === 'pilot-plus',
      )!,
      details: {
        companyName: 'Test Partner s.r.o.',
        registrationNumber: '12345678',
        address: 'Testovací 1, 110 00 Praha',
        contactName: 'Test Partner',
        contactEmail: 'test@example.com',
        contactPhone: '+420 700 000 000',
      },
      issuedAt: '2026-09-02T10:00:00.000Z',
    });
    assert.ok(proforma);
    assert.equal(proforma.packageName, 'Pilot TIP');
    assert.equal(proforma.amountCzk, 19_970);
    assert.equal(proforma.iban, COMMERCIAL_PAYMENT_ACCOUNT.iban);
    assert.match(proforma.qrPayload, /^SPD\*1\.0\*/);
    assert.match(proforma.qrPayload, new RegExp(proforma.variableSymbol));

    assert.match(
      proforma.variableSymbol,
      /^\d{1,10}$/,
    );
    assert.match(proforma.qrPayload, /AM:19970\.00/);
    assert.equal(proforma.accountNumber, '3452548011/3030');
    assert.equal(proforma.iban, 'CZ3530300000003452548011');

    const pdf = await renderCommercialProformaPdf(proforma);

    assert.ok(
      pdf.byteLength > 10_000,
    );

    assert.equal(
      String.fromCharCode(
        pdf[0]!,
        pdf[1]!,
        pdf[2]!,
        pdf[3]!,
      ),
      '%PDF',
    );

    const source = read(
      'office/commercialPaymentExperience.ts',
    );

    assert.match(
      source,
      /VÝZVA K ÚHRADĚ/,
    );

    assert.match(
      source,
      /Radim Věntus/,
    );

    assert.match(
      source,
      /Stratilova 2/,
    );

    assert.match(
      source,
      /PŘEDMĚT PLNĚNÍ A CENA/,
    );

    assert.match(
      source,
      /PLATEBNÍ ÚDAJE/,
    );

    assert.match(
      source,
      /Inter-Regular\.ttf/,
    );

    assert.match(
      source,
      /Inter-SemiBold\.ttf/,
    );

    assert.doesNotMatch(
      source,
      /normalize\('NFD'\)/,
    );

    assert.doesNotMatch(
      source,
      /BaseFont \/Helvetica/,
    );

    const payload = buildSpdQrPayload({
      iban: COMMERCIAL_PAYMENT_ACCOUNT.iban,
      amountCzk: 9_970,
      variableSymbol: '123456',
      message: 'CONIS Pilot',
    });
    assert.match(payload, /ACC:CZ3530300000003452548011/);
  });

  it('wires payment screen with PDF actions and QR confirm', () => {
    const payment = read(
      'features/pilot-workspace/terminal/PaymentScreen.tsx',
    );
    const studio = read(
      'features/pilot-workspace/terminal/ConisStudioScreen.tsx',
    );
    const pkg = read('../package.json');

    assert.match(payment, /QRCode\.toDataURL/);
    assert.match(payment, /openCommercialProformaPdf/);
    assert.match(payment, /downloadCommercialProformaPdf/);
    assert.match(payment, /Potvrdit provedení QR platby/);
    assert.match(payment, /navigateCommercialJourneyStep\('conis_studio'\)/);
    assert.match(payment, /cj-proforma-open/);
    assert.match(payment, /cj-proforma-download/);
    assert.doesNotMatch(payment, /SMTP|IMAP|Business Automation|ověření.*bank/i);
    assert.match(studio, /Děkujeme\. Platba byla oznámena/);
    assert.match(studio, /Vítejte v CONIS Studio/);
    assert.match(studio, /Otevřít CONIS Studio/);
    assert.doesNotMatch(studio, /Office mezitím|handoff/i);
    assert.match(pkg, /"qrcode"/);
  });
});
