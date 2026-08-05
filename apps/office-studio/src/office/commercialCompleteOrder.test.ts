/**
 * PT-CJ-03 — Dokončit objednávku screen wiring.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { buildCommercialOrderPartnerDetails } from './commercialOrderPartnerDetails';
import { getPilotWorkspaceCase } from './pilotWorkspaceModel';

const root = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(join(root, '..', relative), 'utf8');
}

describe('PT-CJ-03 Dokončit objednávku', () => {
  it('seeds partner billing details for review and edit', () => {
    const activeCase = getPilotWorkspaceCase('case-dse-starter');
    assert.ok(activeCase);
    const details = buildCommercialOrderPartnerDetails(activeCase);
    assert.equal(details.companyName, activeCase.companyName);
    assert.ok(details.ico.length > 0);
    assert.match(details.dic, /^CZ/);
    assert.ok(details.contactName.length > 0);
    assert.ok(details.email.includes('@'));
    assert.ok(details.phone.length > 0);
    assert.ok(details.address.length > 0);
  });

  it('wires Apple Easy complete-order screen', () => {
    const screen = read(
      'features/pilot-workspace/terminal/CompleteOrderScreen.tsx',
    );
    const css = read('index.css');

    assert.match(screen, /Dokončit objednávku/);
    assert.match(screen, /Upravit údaje/);
    assert.match(screen, /Navazující tarif/);
    assert.match(screen, /Potvrzuji, že jsem se seznámil se smluvními dokumenty/);
    assert.match(screen, /Elektronická objednávka/);
    assert.match(screen, /Rámcová smlouva/);
    assert.match(screen, /Implementační standard/);
    assert.match(screen, /\bDPA\b/);
    assert.match(screen, /\bVOP\b/);
    assert.match(screen, /Potvrdit objednávku/);
    assert.match(screen, /navigateWorkflowStep\('payment'\)/);
    assert.match(screen, /cj-order-docs-accepted/);
    assert.doesNotMatch(screen, /cj-order-check-vop|cj-order-check-order/);
    assert.doesNotMatch(screen, /QR|proforma|SMTP|IMAP|Business Automation/i);
    assert.doesNotMatch(screen, /marketing|FAQ/i);
    assert.match(css, /office-cj-order__doc-links/);
    assert.match(css, /office-cj-order__edit/);
  });
});
