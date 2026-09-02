/**
 * OF-06 — Pilot Runtime orchestrator (end-to-end Office MVP).
 * Lead → Partner → Offer → Documents → Payment → Builder Handoff → Pilot Ready.
 */

import { appendOfficeEvent, listPartnerTimeline } from './officeEventCatalog';
import {
  confirmClickWrap,
  getDocumentPackage,
  issueProforma,
  prepareDocumentPackage,
  sendDocumentPackage,
} from './officeDocumentRegistry';
import { getHandoff, receivePayment } from './officeHandoffRegistry';
import { emptyPartnerDraft, createPartner, getPartner } from './officePartnerRegistry';
import {
  confirmSalesOrder,
  getSalesCase,
  moveToWaitingPayment,
  selectSalesPackage,
  sendPersonalizedOffer,
  updatePersonalizedOffer,
} from './officeSalesRegistry';
import {
  PILOT_REQUIRED_EVENT_KINDS,
  PILOT_RUNTIME_STEP_LABELS,
  type PilotRuntimeCheck,
  type PilotRuntimeStep,
  type PilotRuntimeSummary,
} from './officePilotRuntimeModel';

let lastSummary: PilotRuntimeSummary | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function step(
  id: PilotRuntimeStep['id'],
  passed: boolean,
  detail: string,
): PilotRuntimeStep {
  return {
    id,
    label: PILOT_RUNTIME_STEP_LABELS[id],
    passed,
    detail,
  };
}

function check(
  id: string,
  label: string,
  passed: boolean,
  detail: string,
): PilotRuntimeCheck {
  return { id, label, passed, detail };
}

export function getLastPilotRuntimeSummary(): PilotRuntimeSummary | null {
  return lastSummary;
}

export function validatePilotRuntime(
  partnerId: string,
): PilotRuntimeSummary {
  const partner = getPartner(partnerId);
  const sales = getSalesCase(partnerId);
  const docs = getDocumentPackage(partnerId);
  const handoff = getHandoff(partnerId);
  const timeline = listPartnerTimeline(partnerId, 100);
  const kinds = new Set(timeline.map((event) => event.kind));

  const missingEventKinds = PILOT_REQUIRED_EVENT_KINDS.filter(
    (kind) => !kinds.has(kind),
  );

  const steps: PilotRuntimeStep[] = [
    step('lead', partner !== null, partner !== null ? 'Lead zachycen' : 'Chybí lead'),
    step(
      'partner',
      partner !== null,
      partner !== null ? `Partner ${partner.name}` : 'Partner neexistuje',
    ),
    step(
      'offer',
      (sales?.offer.status === 'sent' ||
        sales?.offer.status === 'accepted') &&
        sales.offer.packageId !== null,
      sales?.offer.packageId != null
        ? `Nabídka · ${sales.offer.status} · ${sales.offer.packageId}`
        : 'Nabídka není odeslána',
    ),
    step(
      'documents',
      docs !== null &&
        docs.status === 'proforma_issued' &&
        docs.clickWrapConfirmedAt !== null &&
        docs.emailSentAt !== null,
      docs?.status === 'proforma_issued'
        ? 'Document package kompletní'
        : `Documents status: ${docs?.status ?? 'empty'}`,
    ),
    step(
      'payment',
      kinds.has('payment.received'),
      kinds.has('payment.received')
        ? 'PaymentReceived'
        : 'PaymentReceived chybí',
    ),
    step(
      'builder_handoff',
      kinds.has('builder.workspace.created'),
      kinds.has('builder.workspace.created')
        ? 'BuilderWorkspaceCreated'
        : 'Builder Handoff neproběhl',
    ),
    step(
      'builder_ready',
      handoff?.status === 'builder_ready' && handoff.workspace !== null,
      handoff?.workspace != null
        ? `Workspace ${handoff.workspace.id}`
        : 'Builder Workspace není ready',
    ),
    step(
      'pilot_ready',
      partner?.status === 'implementation' &&
        kinds.has('pilot.ready') &&
        missingEventKinds.length === 0,
      kinds.has('pilot.ready') && missingEventKinds.length === 0
        ? 'Pilot Ready'
        : 'Pilot ještě není ready',
    ),
  ];

  const runtimeChecks: PilotRuntimeCheck[] = [
    check(
      'partner-status',
      'Partner status = Implementation',
      partner?.status === 'implementation',
      partner?.status ?? 'missing',
    ),
    check(
      'offer-package',
      'Offer má zvolený balíček',
      sales?.offer.packageId != null,
      sales?.offer.packageId ?? 'missing',
    ),
    check(
      'docs-clickwrap',
      'Click-wrap potvrzen',
      docs?.clickWrapConfirmedAt != null,
      docs?.clickWrapConfirmedAt ?? 'missing',
    ),
    check(
      'docs-proforma',
      'Proforma vydána',
      docs?.proforma != null,
      docs?.proforma?.number ?? 'missing',
    ),
    check(
      'builder-workspace',
      'Builder Workspace existuje',
      handoff?.workspace != null,
      handoff?.workspace?.name ?? 'missing',
    ),
    check(
      'builder-project',
      'Project existuje',
      handoff?.workspace?.project != null,
      handoff?.workspace?.project.id ?? 'missing',
    ),
    check(
      'builder-object',
      'Object existuje',
      handoff?.workspace?.project.object != null,
      handoff?.workspace?.project.object.id ?? 'missing',
    ),
  ];

  const timelineChecks: PilotRuntimeCheck[] = PILOT_REQUIRED_EVENT_KINDS.map(
    (kind) =>
      check(
        `event-${kind}`,
        kind,
        kinds.has(kind),
        kinds.has(kind) ? 'zapsáno' : 'chybí',
      ),
  );

  const pilotReady =
    steps.every((entry) => entry.passed) &&
    runtimeChecks.every((entry) => entry.passed) &&
    missingEventKinds.length === 0;

  const summary: PilotRuntimeSummary = {
    partnerId,
    partnerName: partner?.name ?? partnerId,
    pilotReady,
    completedAt: pilotReady ? nowIso() : null,
    steps,
    runtimeChecks,
    timelineChecks,
    missingEventKinds,
  };
  lastSummary = summary;
  return summary;
}

/**
 * Runs the complete commercial journey without manual steps.
 */
export function runPilotRuntime(input?: {
  readonly partnerName?: string;
}): PilotRuntimeSummary {
  const stamp = Date.now().toString(36);
  const name = input?.partnerName?.trim() || `Pilot ${stamp}`;
  const draft = emptyPartnerDraft();
  const partner = createPartner({
    ...draft,
    name,
    status: 'lead',
    company: {
      legalName: `${name} s.r.o.`,
      ico: '',
      streetAddress: '',
      city: 'Praha',
      country: 'Česko',
    },
    contact: {
      name: `${name} Contact`,
      email: `pilot+${stamp}@conis.cz`,
      phone: '+420 777 000 000',
      role: 'Jednatel',
    },
  });

  updatePersonalizedOffer(partner.id, {
    title: `Personalizovaná nabídka · ${partner.name}`,
    personalNote: `OF-06 Pilot Runtime nabídka pro ${partner.name}.`,
  });
  selectSalesPackage(partner.id, 'pilot');
  sendPersonalizedOffer(partner.id);

  prepareDocumentPackage(partner.id);
  sendDocumentPackage(partner.id, partner.contact.email);
  confirmClickWrap(partner.id);
  issueProforma(partner.id);

  confirmSalesOrder(partner.id);
  moveToWaitingPayment(partner.id);

  receivePayment(partner.id);

  appendOfficeEvent({
    kind: 'pilot.ready',
    label: 'PilotReady',
    detail: `${partner.name} · Office Studio MVP ready`,
    partnerId: partner.id,
  });

  // Mark partner as implementation-ready for pilot (already set by receivePayment).
  return validatePilotRuntime(partner.id);
}
