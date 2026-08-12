/**
 * PT-CJ-00 — Pilot Delivery: personalized PDF + invitation email + SMTP.
 * After the sales meeting the merchant one-clicks „Odeslat nabídku“.
 */

import {
  createDocumentRuntime,
  type DocumentArtifact,
} from '@embed-engine/document-runtime';
import {
  CONIS_SAMPLE_PROJECT_LABEL,
  buildPilotProvisionSnapshot,
  encodePilotProvisionSnapshot,
  getPartnerBranding,
  listInvites,
  login,
  markInviteSent,
  offerSlugFromCompanyId,
  resolvePilotEntryHref,
  resolvePilotOfferHref,
  resolveInviteLifecycle,
  verifyUserPassword,
  type PilotInvite,
} from '@embed-engine/platform-access';

import { DEFAULT_PILOT_MAILBOX_ID } from '../mail';
import type { PilotMailTransportSession } from '../mail/mailTransportService';
import { appendOfficeEvent } from './officeEventCatalog';
import { syncCommercialFollowUpTimeline } from './officeCommercialFollowUpRegistry';
import {
  buildOfficePartnerEnvironment,
} from './officePartnerEnvironment';
import { getPartner, updatePartner, draftFromPartner } from './officePartnerRegistry';
import { preparePilotForPartner } from './preparePilotProvisioning';
import {
  PILOT_DELIVERY_PASSWORD,
  OFFICE_REFERENCE_PROJECT_LABEL,
} from './officeReferencePartner';
import {
  PILOT_DELIVERY_STUDIOS,
  type PilotActivationStatus,
  type PilotDeliveryInviteSnapshot,
  type PilotDeliveryPdfAttachment,
  type PilotDeliveryPreview,
  type PilotDeliveryRecord,
} from './officePilotDeliveryModel';
import {
  getPilotDelivery,
  listPilotDeliveries,
  resetPilotDeliveryStoreForTests,
  savePilotDeliveryRecord,
} from './officePilotDeliveryStore';

export {
  getPilotDelivery,
  listPilotDeliveries,
  resetPilotDeliveryStoreForTests,
};

export type PilotDeliveryReadiness = {
  readonly ready: boolean;
  readonly partner: boolean;
  readonly project: boolean;
  readonly logo: boolean;
  readonly hero: boolean;
  readonly website: boolean;
  readonly account: boolean;
  readonly password: boolean;
  readonly email: string;
  readonly missing: readonly string[];
};

export type PilotOfferDeliveryResult =
  | {
      readonly ok: true;
      readonly delivery: PilotDeliveryRecord;
      readonly artifact: DocumentArtifact;
      readonly messageId: string;
    }
  | { readonly ok: false; readonly error: string };

export type OfferWriteCapabilityIssuer = (scope: {
  readonly offerSlug: string;
  readonly companyId: string;
  readonly partnerId: string;
}) => Promise<{ readonly token: string }>;

async function issueOfferWriteCapability(scope: {
  readonly offerSlug: string;
  readonly companyId: string;
  readonly partnerId: string;
}): Promise<{ readonly token: string }> {
  const origin =
    (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
      ?.VITE_PLATFORM_API_ORIGIN ?? 'http://127.0.0.1:4310';
  const response = await fetch(`${origin.replace(/\/$/, '')}/local-pilot/offer-write-capabilities`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(scope),
  });
  if (!response.ok) throw new Error('Offer write capability se nepodařilo vystavit.');
  return response.json() as Promise<{ readonly token: string }>;
}

function nowIso(): string {
  return new Date().toISOString();
}

function findInviteForEmail(email: string): PilotInvite | null {
  const normalized = email.trim().toLowerCase();
  if (normalized.length === 0) return null;
  const invites = listInvites().filter((item) => item.email === normalized);
  if (invites.length === 0) return null;
  return (
    invites.find((item) => item.status === 'activated') ??
    invites.find((item) => item.status === 'pending') ??
    invites[0] ??
    null
  );
}

function toActivationStatus(invite: PilotInvite | null): PilotActivationStatus {
  if (invite === null) return 'missing';
  const lifecycle = resolveInviteLifecycle(invite);
  if (lifecycle === 'activated') return 'activated';
  if (lifecycle === 'expired') return 'expired';
  if (lifecycle === 'revoked') return 'revoked';
  if (lifecycle === 'pending') return 'awaiting_activation';
  return 'missing';
}

function toInviteSnapshot(invite: PilotInvite): PilotDeliveryInviteSnapshot {
  return {
    token: invite.token,
    status: resolveInviteLifecycle(invite),
    expiresAt: invite.expiresAt,
    sendCount: invite.sendCount,
    activationStatus: toActivationStatus(invite),
  };
}

/**
 * PT-CJ-00 invitation body — exact commercial copy.
 */
export function buildPilotInvitationEmailBody(input: {
  readonly loginEmail: string;
  readonly password: string;
  readonly studioLoginHref: string;
  readonly offerHref?: string;
}): string {
  const lines = [
    'Dobrý den,',
    '',
    'děkuji za dnešní schůzku.',
    '',
    'V příloze naleznete nabídku pilotního programu CONIS.',
    '',
    'Současně jsme pro Vás připravili CONIS Studio s logem Vaší společnosti, ukázkovým projektem a předvyplněnými údaji Vaší firmy.',
    '',
    'Přihlášení:',
    '',
    `Login: ${input.loginEmail}`,
    `Heslo: ${input.password}`,
    '',
    `Přihlásit se do CONIS Studio: ${input.studioLoginHref}`,
  ];
  if (input.offerHref !== undefined && input.offerHref.length > 0) {
    lines.push('', `Vybrat pilotní program: ${input.offerHref}`);
  }
  lines.push(
    '',
    'Po přihlášení si můžete celé prostředí projít.',
    '',
    'Vše je připravené. Zbývá už jen vybrat pilotní program.',
  );
  return lines.join('\n');
}

export function verifyPilotDeliveryReadiness(
  partnerId: string,
): PilotDeliveryReadiness {
  const partner = getPartner(partnerId);
  const email = partner?.contact.email.trim().toLowerCase() ?? '';
  const env = buildOfficePartnerEnvironment(partnerId);
  const branding =
    env.companyId !== null ? getPartnerBranding(env.companyId) : null;
  const invite = email.length > 0 ? findInviteForEmail(email) : null;
  const accountOk =
    invite !== null &&
    resolveInviteLifecycle(invite) === 'activated' &&
    verifyUserPassword(email, PILOT_DELIVERY_PASSWORD) !== null;
  const passwordOk =
    email.length > 0 &&
    verifyUserPassword(email, PILOT_DELIVERY_PASSWORD) !== null;

  const checks = {
    partner: partner !== null,
    project:
      env.ready &&
      (env.environment?.projectLabel?.length ?? 0) > 0,
    logo: (branding?.logoLabel.trim().length ?? 0) > 0,
    hero: (branding?.heroLabel.trim().length ?? 0) > 0,
    website: (branding?.websiteUrl.trim().length ?? 0) > 0,
    account: accountOk,
    password: passwordOk,
  };

  const missing: string[] = [];
  if (!checks.partner) missing.push('partner');
  if (!checks.project) missing.push('projekt');
  if (!checks.logo) missing.push('logo');
  if (!checks.hero) missing.push('Hero');
  if (!checks.website) missing.push('web');
  if (!checks.account) missing.push('účet');
  if (!checks.password) missing.push('heslo');

  return {
    ready: missing.length === 0 && email.length > 0,
    ...checks,
    email,
    missing,
  };
}

function buildPdfAttachmentFromArtifact(
  artifact: DocumentArtifact,
): PilotDeliveryPdfAttachment {
  return {
    id: artifact.id,
    name: artifact.attachment.fileName.endsWith('.pdf')
      ? `${artifact.label}.pdf`
      : artifact.attachment.fileName,
    href: `document-runtime://${artifact.id}`,
    attached: true,
    ready: true,
  };
}

/**
 * Build Delivery Preview for the partner (requires contact e-mail).
 * Ensures pilot provisioning when invite is missing.
 */
export function buildPilotDeliveryPreview(
  partnerId: string,
): PilotDeliveryPreview | null {
  const partner = getPartner(partnerId);
  if (partner === null) return null;
  const email = partner.contact.email.trim();
  if (email.length === 0) return null;

  const prepared = preparePilotForPartner(partnerId);
  if (prepared === null) return null;
  const invite = prepared.invite;

  const branding = prepared.branding;
  const inviteSnapshot = toInviteSnapshot(invite);
  const activationStatus = toActivationStatus(invite);
  const offerSlug = offerSlugFromCompanyId(prepared.provision.company.id);
  const offerHref = resolvePilotOfferHref(offerSlug);

  const snapshot = buildPilotProvisionSnapshot({
    email: email.toLowerCase(),
    password: PILOT_DELIVERY_PASSWORD,
    displayName: invite.displayName,
    userId: `user-invite-${invite.id}`,
    roles: invite.roles,
    tenant: prepared.provision.tenant,
    company: prepared.provision.company,
    workspace: prepared.provision.workspace,
    project: prepared.provision.project,
    houses: prepared.provision.houses,
    branding: {
      firmName: branding.firmName,
      logoLabel: branding.logoLabel,
      heroLabel: branding.heroLabel,
      websiteUrl: branding.websiteUrl,
    },
  });
  const studioLoginHref = resolvePilotEntryHref(
    encodePilotProvisionSnapshot(snapshot),
  );

  return {
    partnerId: partner.id,
    partnerName: partner.name,
    email,
    projectName:
      prepared.pilotWorkspace.sampleProjectLabel ??
      CONIS_SAMPLE_PROJECT_LABEL ??
      OFFICE_REFERENCE_PROJECT_LABEL,
    accessibleStudios: PILOT_DELIVERY_STUDIOS,
    invite: inviteSnapshot,
    activationStatus,
    workspaceHref: studioLoginHref,
    studioLoginHref,
    loginEmail: email,
    loginPassword: PILOT_DELIVERY_PASSWORD,
    heroLabel: branding.heroLabel ?? '',
    websiteUrl: branding.websiteUrl ?? '',
    offerHref,
    pdf: {
      id: `pdf-${partnerId}-pilot-offer`,
      name: `Nabídka pilotního programu · ${partner.name}.pdf`,
      href: `document-runtime://pilot-offer/${partnerId}`,
      attached: true,
      ready: true,
    },
  };
}

export async function generatePersonalizedPilotOfferPdf(
  partnerId: string,
): Promise<DocumentArtifact | null> {
  const preview = buildPilotDeliveryPreview(partnerId);
  if (preview === null) return null;
  const env = buildOfficePartnerEnvironment(partnerId);
  const projectId =
    env.environment?.projectId ?? `project-${partnerId}`;
  const partner = getPartner(partnerId);
  if (partner === null) return null;

  const runtime = createDocumentRuntime();
  return runtime.generate({
    type: 'pilot_offer',
    context: {
      projectId,
      partnerName: partner.name,
      companyName: partner.company.legalName || partner.name,
      packageName: 'Pilot',
      orderId: null,
      proformaNumber: null,
      amountCzk: null,
      issuedAt: nowIso(),
      dueDate: null,
      contactEmail: preview.email,
      heroLabel: preview.heroLabel,
      websiteUrl: preview.websiteUrl,
    },
    businessEventKind: 'PilotOfferDelivery',
  });
}

/**
 * PT-CJ-00 — one-click „Odeslat nabídku“.
 * PDF → SMTP → Conversation → Timeline. Partner can log in without help.
 */
export async function deliverPilotOffer(
  partnerId: string,
  mailSession: PilotMailTransportSession,
  capabilityIssuer: OfferWriteCapabilityIssuer = issueOfferWriteCapability,
): Promise<PilotOfferDeliveryResult> {
  const readiness = verifyPilotDeliveryReadiness(partnerId);
  if (!readiness.ready) {
    const prepared = preparePilotForPartner(partnerId);
    if (prepared === null) {
      return {
        ok: false,
        error: `Pilot nelze odeslat — chybí: ${readiness.missing.join(', ') || 'partner / e-mail'}.`,
      };
    }
  }

  const finalReadiness = verifyPilotDeliveryReadiness(partnerId);
  if (!finalReadiness.ready) {
    return {
      ok: false,
      error: `Pilot nelze odeslat — chybí: ${finalReadiness.missing.join(', ')}.`,
    };
  }

  const preview = buildPilotDeliveryPreview(partnerId);
  if (preview === null || preview.invite === null) {
    return {
      ok: false,
      error: 'Pilot nelze odeslat — pozvánka není připravena.',
    };
  }

  const artifact = await generatePersonalizedPilotOfferPdf(partnerId);
  if (artifact === null) {
    return { ok: false, error: 'Nelze vytvořit personalizované PDF.' };
  }

  const preparedAt = nowIso();
  appendOfficeEvent({
    kind: 'pilot.prepared',
    label: 'PilotPrepared',
    detail: `${preview.partnerName} · ${artifact.label} · ${preview.projectName}`,
    partnerId,
  });

  const env = buildOfficePartnerEnvironment(partnerId);
  const caseId = env.environment?.projectId ?? partnerId;
  let offerHref: string;
  try {
    const capability = await capabilityIssuer({
      offerSlug: offerSlugFromCompanyId(env.companyId ?? `company-${partnerId}`),
      companyId: env.companyId ?? `company-${partnerId}`,
      partnerId,
    });
    offerHref = resolvePilotOfferHref(
      offerSlugFromCompanyId(env.companyId ?? `company-${partnerId}`),
      capability.token,
    );
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Offer write capability se nepodařilo vystavit.',
    };
  }
  const body = buildPilotInvitationEmailBody({
    loginEmail: preview.loginEmail,
    password: preview.loginPassword,
    studioLoginHref: preview.studioLoginHref,
    offerHref,
  });

  let message;
  try {
    message = await mailSession.sendSystemMail({
      mailboxId: DEFAULT_PILOT_MAILBOX_ID,
      toEmail: preview.email,
      subject: `Nabídka pilotního programu CONIS · ${preview.partnerName}`,
      body,
      caseId,
      origin: 'OFFICE',
      threadId: `<pilot-offer-${partnerId}@conis.cz>`,
      attachments: [
        {
          fileName: artifact.attachment.fileName,
          mimeType: 'application/pdf',
          bytesBase64: artifact.attachment.bytesBase64,
          documentId: artifact.id,
        },
      ],
    });
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `SMTP selhalo: ${error.message}`
          : 'SMTP selhalo.',
    };
  }

  const pdf = buildPdfAttachmentFromArtifact(artifact);
  const deliveredAt = nowIso();
  const delivery: PilotDeliveryRecord = {
    id: `delivery-${partnerId}-${Date.now()}`,
    partnerId,
    preparedAt,
    deliveredAt,
    preview: {
      ...preview,
      pdf,
    },
    package: {
      pdf,
      workspaceHref: preview.studioLoginHref,
      invite: preview.invite,
      activationStatus: preview.activationStatus,
    },
  };

  savePilotDeliveryRecord(delivery);

  appendOfficeEvent({
    kind: 'pilot.delivered',
    label: 'PilotDelivered',
    detail: `${preview.email} · ${preview.studioLoginHref} · SMTP ${message.id} · aktivace ${preview.activationStatus}`,
    partnerId,
  });

  const partner = getPartner(partnerId);
  if (partner !== null) {
    const draft = draftFromPartner(partner);
    updatePartner(partnerId, {
      ...draft,
      status: 'offer',
      nextStep: 'Nabídka odeslána — partner se přihlásí do CONIS Studio',
    });
  }

  const inviteForSend = findInviteForEmail(preview.email);
  if (inviteForSend !== null) {
    markInviteSent(inviteForSend.id);
  }

  syncCommercialFollowUpTimeline(partnerId);

  return {
    ok: true,
    delivery,
    artifact,
    messageId: message.id,
  };
}

/**
 * Sync wrapper kept for PE-07 tests — prefers production mail path when session provided.
 * Without session, stamps local delivery only (legacy).
 */
export function deliverPilot(
  partnerId: string,
):
  | { readonly ok: true; readonly delivery: PilotDeliveryRecord }
  | { readonly ok: false; readonly error: string } {
  const preview = buildPilotDeliveryPreview(partnerId);
  if (preview === null) {
    return {
      ok: false,
      error: 'Pilot nelze odeslat — chybí partner nebo kontaktní e-mail.',
    };
  }
  if (preview.invite === null) {
    return {
      ok: false,
      error: 'Pilot nelze odeslat — pozvánka není připravena.',
    };
  }

  const preparedAt = nowIso();
  appendOfficeEvent({
    kind: 'pilot.prepared',
    label: 'PilotPrepared',
    detail: `${preview.partnerName} · ${preview.pdf.name} · ${preview.projectName}`,
    partnerId,
  });

  const deliveredAt = nowIso();
  const delivery: PilotDeliveryRecord = {
    id: `delivery-${partnerId}-${Date.now()}`,
    partnerId,
    preparedAt,
    deliveredAt,
    preview,
    package: {
      pdf: preview.pdf,
      workspaceHref: preview.workspaceHref,
      invite: preview.invite,
      activationStatus: preview.activationStatus,
    },
  };

  savePilotDeliveryRecord(delivery);

  appendOfficeEvent({
    kind: 'pilot.delivered',
    label: 'PilotDelivered',
    detail: `${preview.email} · ${preview.workspaceHref} · aktivace ${preview.activationStatus} · invite ${preview.invite.status}`,
    partnerId,
  });

  const partner = getPartner(partnerId);
  if (partner !== null) {
    const draft = draftFromPartner(partner);
    updatePartner(partnerId, {
      ...draft,
      nextStep: 'Pilot odeslán — čeká se na aktivaci',
    });
  }

  const inviteForSend = findInviteForEmail(preview.email);
  if (inviteForSend !== null) {
    markInviteSent(inviteForSend.id);
  }

  syncCommercialFollowUpTimeline(partnerId);

  return { ok: true, delivery };
}

/** Validate partner can log into CONIS Studio with preset credentials. */
export function verifyPartnerStudioLogin(partnerId: string): boolean {
  const partner = getPartner(partnerId);
  if (partner === null) return false;
  const email = partner.contact.email.trim().toLowerCase();
  const result = login({
    email,
    password: PILOT_DELIVERY_PASSWORD,
    rememberMe: false,
  });
  return result.ok;
}
