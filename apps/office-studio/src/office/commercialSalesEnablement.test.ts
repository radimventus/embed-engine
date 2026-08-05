/**
 * PT-COM-02 — Remove P0 Sales Barriers (S-002 · S-001 · S-003 · S-007 SOP).
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(root, '../../../..');

function read(relative: string): string {
  return readFileSync(join(root, '..', relative), 'utf8');
}

function readRepo(relative: string): string {
  return readFileSync(join(repoRoot, relative), 'utf8');
}

describe('PT-COM-02 Remove P0 Sales Barriers', () => {
  it('closes S-002 · S-001 · S-003 and verifies S-007 finance SOP', () => {
    const partners = read(
      'features/partners/PartnersWorkspacePage.tsx',
    );
    const relay = read('mail/createOfferDeliveryMailSession.ts');
    const vite = read('../vite.config.ts');
    const delivery = read('office/pilotOfferDelivery.ts');
    const landing = readRepo(
      'packages/platform-access/src/react/PlatformLanding.tsx',
    );
    const cloud = readRepo(
      'packages/platform-access/src/cloud/cloudConfig.ts',
    );
    const offer = readRepo(
      'apps/offer-experience/src/offer/offerRegistry.ts',
    );
    const paymentApp = readRepo(
      'apps/offer-experience/src/OfferExperienceApp.tsx',
    );
    const s001 = readRepo(
      'docs/platform/office/improvement-log/S-001-durable-partner-identity.md',
    );
    const s002 = readRepo(
      'docs/platform/office/improvement-log/S-002-live-smtp-offer-delivery.md',
    );
    const s003 = readRepo(
      'docs/platform/office/improvement-log/S-003-personalized-offer-entry.md',
    );
    const s007 = readRepo(
      'docs/platform/office/improvement-log/S-007-payment-finance-sop.md',
    );

    assert.match(partners, /createOfferDeliveryMailSession/);
    assert.doesNotMatch(partners, /createPilotMailSession\(\)/);
    assert.match(relay, /\/api\/pilot-mail\/send/);
    assert.match(vite, /pilotMailRelayPlugin/);
    assert.match(delivery, /encodePilotProvisionSnapshot|buildPilotProvisionSnapshot/);
    assert.match(delivery, /resolvePilotEntryHref/);
    assert.match(delivery, /offerHref/);
    assert.match(landing, /offerSlugFromCompanyId/);
    assert.match(landing, /resolvePilotOfferHref\(offerSlug\)/);
    assert.match(cloud, /resolvePilotEntryHref/);
    assert.match(cloud, /offerSlug\?:/);
    assert.match(offer, /synthesizePublicOffer/);
    assert.match(paymentApp, /confirmPaymentReceived/);
    assert.match(s001, /Closed|PASS|Fixed/i);
    assert.match(s002, /Closed|PASS|Fixed/i);
    assert.match(s003, /Closed|PASS|Fixed/i);
    assert.match(s007, /Verified|SOP/i);
    assert.match(s007, /bank statement|výpis/i);
    assert.match(s007, /not bank settlement|není bankovní/i);
  });
});
