/**
 * PT-CJ-00 — Pilot Delivery: PDF · invitation · SMTP · login.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  clearPlatformSession,
  login,
  resetCompanyRegistryExtras,
  resetInviteStore,
  resetPartnerBrandingStore,
  resetPartnerWelcomeStore,
  resetPilotWorkspaceStore,
  resetUserRegistry,
  resolveCloudLandingHref,
} from '@embed-engine/platform-access';

import {
  createPilotMailSession,
  resetConversationMailStore,
} from '../mail/index.ts';
import { projectTimelineFromConversation } from './pilotConversationTimeline.ts';
import {
  listPartnerTimeline,
  resetOfficeEventCatalogForTests,
} from './officeEventCatalog.ts';
import {
  getPartner,
  resetPartnerRegistryForTests,
} from './officePartnerRegistry.ts';
import { resetOperationsRegistryForTests } from './officeOperationsRegistry.ts';
import { preparePilotForPartner } from './preparePilotProvisioning.ts';
import {
  buildPilotDeliveryPreview,
  buildPilotInvitationEmailBody,
  deliverPilotOffer,
  generatePersonalizedPilotOfferPdf,
  resetPilotDeliveryStoreForTests,
  verifyPartnerStudioLogin,
  verifyPilotDeliveryReadiness,
} from './officePilotDeliveryRegistry.ts';
import {
  OFFICE_REFERENCE_WEBSITE_URL,
  PILOT_DELIVERY_PASSWORD,
} from './officeReferencePartner.ts';
import { getConversationMailStore } from '../mail/conversationMailStore.ts';

describe('PT-CJ-00 Pilot Delivery', () => {
  function resetAll() {
    resetPartnerRegistryForTests();
    resetOfficeEventCatalogForTests();
    resetOperationsRegistryForTests();
    resetCompanyRegistryExtras();
    resetInviteStore();
    resetPartnerBrandingStore();
    resetPartnerWelcomeStore();
    resetPilotWorkspaceStore();
    resetPilotDeliveryStoreForTests();
    resetUserRegistry();
    resetConversationMailStore();
    clearPlatformSession();
  }

  it('verifies partner · project · logo · Hero · account · password', () => {
    resetAll();
    const prepared = preparePilotForPartner('p-dse');
    assert.ok(prepared !== null);

    const readiness = verifyPilotDeliveryReadiness('p-dse');
    assert.equal(readiness.ready, true);
    assert.equal(readiness.partner, true);
    assert.equal(readiness.project, true);
    assert.equal(readiness.logo, true);
    assert.equal(readiness.hero, true);
    assert.equal(readiness.website, true);
    assert.equal(readiness.account, true);
    assert.equal(readiness.password, true);
    assert.equal(prepared!.branding.websiteUrl, OFFICE_REFERENCE_WEBSITE_URL);
    assert.equal(prepared!.invite.status, 'activated');
  });

  it('personalizes PDF with Hero and partner website', async () => {
    resetAll();
    preparePilotForPartner('p-dse');
    const artifact = await generatePersonalizedPilotOfferPdf('p-dse');
    assert.ok(artifact !== null);
    assert.equal(artifact!.type, 'pilot_offer');
    assert.equal(artifact!.context.heroLabel?.includes('Hero'), true);
    assert.equal(artifact!.context.websiteUrl, OFFICE_REFERENCE_WEBSITE_URL);
    assert.ok(artifact!.attachment.byteLength > 0);
  });

  it('builds invitation email with login · password · Studio link', () => {
    const href = resolveCloudLandingHref();
    const body = buildPilotInvitationEmailBody({
      loginEmail: 'partner@domysenergii.cz',
      password: PILOT_DELIVERY_PASSWORD,
      studioLoginHref: href,
    });
    assert.match(body, /děkuji za dnešní schůzku/i);
    assert.match(body, /Login: partner@domysenergii\.cz/);
    assert.match(body, new RegExp(`Heslo: ${PILOT_DELIVERY_PASSWORD}`));
    assert.match(body, /Přihlásit se do CONIS Studio/);
    assert.match(body, /Vše je připravené\. Zbývá už jen vybrat pilotní program/);
    assert.ok(body.includes(href));
  });

  it('delivers offer via SMTP into Conversation and Timeline', async () => {
    resetAll();
    preparePilotForPartner('p-dse');
    const session = createPilotMailSession();
    const result = await deliverPilotOffer('p-dse', session);
    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(result.artifact.type, 'pilot_offer');
    assert.match(result.delivery.package.pdf.href, /document-runtime/);

    const store = getConversationMailStore();
    assert.ok(
      store.messages.some(
        (item) =>
          item.toEmail === 'partner@domysenergii.cz' &&
          item.subject.includes('Nabídka pilotního programu'),
      ),
    );
    assert.ok(
      store.messages.some(
        (item) => (item.attachments?.length ?? 0) > 0,
      ),
    );

    const projectId =
      result.delivery.preview.projectName.length > 0
        ? 'project-domy-s-energi-01'
        : 'p-dse';
    const timeline = projectTimelineFromConversation(projectId);
    assert.ok(
      timeline.some((event) => event.kind === 'email.sent') ||
        timeline.some((event) => event.kind === 'document.sent'),
    );

    const kinds = listPartnerTimeline('p-dse', 50).map((event) => event.kind);
    assert.ok(kinds.includes('pilot.prepared'));
    assert.ok(kinds.includes('pilot.delivered'));
    assert.match(getPartner('p-dse')?.nextStep ?? '', /Nabídka odeslána/i);
  });

  it('lets the partner log into CONIS Studio without help', () => {
    resetAll();
    preparePilotForPartner('p-dse');
    assert.equal(verifyPartnerStudioLogin('p-dse'), true);

    const preview = buildPilotDeliveryPreview('p-dse');
    assert.ok(preview !== null);
    assert.equal(preview!.loginPassword, PILOT_DELIVERY_PASSWORD);
    assert.equal(preview!.activationStatus, 'activated');
    assert.equal(preview!.studioLoginHref, resolveCloudLandingHref());
    assert.doesNotMatch(preview!.studioLoginHref, /invite=/);

    const auth = login({
      email: preview!.loginEmail,
      password: PILOT_DELIVERY_PASSWORD,
      rememberMe: false,
    });
    assert.equal(auth.ok, true);
  });
});
