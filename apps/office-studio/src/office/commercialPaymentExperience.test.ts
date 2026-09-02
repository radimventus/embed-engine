/**
 * PT-CJ-04 — Payment Experience (proforma + SPD QR).
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  buildCommercialProformaForCase,
  buildSpdQrPayload,
  COMMERCIAL_PAYMENT_ACCOUNT,
  renderCommercialProformaPdf,
} from './commercialPaymentExperience';
import { setCommercialJourneySelectedProgramId } from './commercialJourneySelection';
import { getPilotWorkspaceCase } from './pilotWorkspaceModel';

const root = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(join(root, '..', relative), 'utf8');
}

describe('PT-CJ-04 Payment Experience', () => {
  it('builds proforma and SPD QR from selected program', () => {
    setCommercialJourneySelectedProgramId('pilot-plus');
    const activeCase = getPilotWorkspaceCase('villa-168');
    assert.ok(activeCase);
    const proforma = buildCommercialProformaForCase(activeCase);
    assert.ok(proforma);
    assert.equal(proforma.packageName, 'Pilot TIP');
    assert.equal(proforma.amountCzk, 19_970);
    assert.equal(proforma.iban, COMMERCIAL_PAYMENT_ACCOUNT.iban);
    assert.match(proforma.qrPayload, /^SPD\*1\.0\*/);
    assert.match(proforma.qrPayload, new RegExp(proforma.variableSymbol));
    assert.match(proforma.qrPayload, /AM:19970\.00/);
    assert.equal(proforma.accountNumber, '3452548011/3030');
    assert.equal(proforma.iban, 'CZ3530300000003452548011');

    const pdf = renderCommercialProformaPdf(proforma);
    assert.ok(pdf.byteLength > 100);
    assert.equal(String.fromCharCode(pdf[0]!, pdf[1]!, pdf[2]!, pdf[3]!), '%PDF');

    const pdfText = Buffer.from(pdf).toString('latin1');
    assert.match(pdfText, / re f/);
    assert.match(pdfText, /3452548011\/3030/);
    assert.match(pdfText, /CZ3530300000003452548011/);

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
