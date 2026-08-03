/**
 * OF-05 — Builder Handoff registry (MVP).
 * Automatic Office → Builder handoff after PaymentReceived.
 */

import {
  provisionPilotWorkspace,
  resolveCloudStudioHref,
} from '@embed-engine/platform-access';

import { appendOfficeEvent } from './officeEventCatalog';
import {
  draftFromPartner,
  getPartner,
  listPartners,
  updatePartner,
} from './officePartnerRegistry';
import { defaultNextStep } from './officePartnerModel';
import { formatCzk, getSalesPackage } from './officeSalesModel';
import { getSalesCase } from './officeSalesRegistry';
import {
  type OfficeBuilderWorkspace,
  type OfficeHandoffStatus,
  type OfficeHandoffSummary,
  type OfficePartnerContext,
} from './officeHandoffModel';

function nowIso(): string {
  return new Date().toISOString();
}

function buildPartnerContext(partnerId: string): OfficePartnerContext | null {
  const partner = getPartner(partnerId);
  if (partner === null) return null;
  const sales = getSalesCase(partnerId);
  const packageId =
    sales?.order?.packageId ?? sales?.offer.packageId ?? null;
  const pkg = packageId !== null ? getSalesPackage(packageId) : null;
  return {
    partnerId,
    partnerName: partner.name,
    companyLegalName: partner.company.legalName,
    contactEmail: partner.contact.email,
    packageId,
    packageLabel: pkg?.name ?? null,
    amountCzk: sales?.order?.amountCzk ?? pkg?.priceCzk ?? null,
  };
}

function buildBuilderWorkspace(
  partnerId: string,
  context: OfficePartnerContext,
  provisioned: {
    readonly workspaceId: string;
    readonly projectId: string;
  },
): OfficeBuilderWorkspace {
  const packageId = context.packageId ?? 'pilot';
  const packageLabel = context.packageLabel ?? getSalesPackage('pilot').name;
  const objectId = `object-${partnerId}-p1`;
  return {
    id: provisioned.workspaceId,
    name: `${context.partnerName} Builder Workspace`,
    builderHref: resolveCloudStudioHref('builder'),
    project: {
      id: provisioned.projectId,
      name: `${context.partnerName} · ${packageLabel}`,
      packageId,
      packageLabel,
      object: {
        id: objectId,
        name: `${context.partnerName} P1`,
        kind: 'house',
      },
    },
  };
}

const SEED_HANDOFFS: readonly OfficeHandoffSummary[] = Object.freeze([
  {
    partnerId: 'p-blokki',
    status: 'builder_ready',
    partnerContext: {
      partnerId: 'p-blokki',
      partnerName: 'Blokki',
      companyLegalName: 'Blokki s.r.o.',
      contactEmail: 'jan@blokki.cz',
      packageId: 'pilot',
      packageLabel: 'Pilot',
      amountCzk: 4_970,
    },
    workspace: {
      id: 'workspace-blokki',
      name: 'Blokki Builder Workspace',
      builderHref: 'http://127.0.0.1:4177/',
      project: {
        id: 'project-blokki-01',
        name: 'Blokki · Pilot',
        packageId: 'pilot',
        packageLabel: 'Pilot',
        object: {
          id: 'object-p-blokki-p1',
          name: 'Blokki P1',
          kind: 'house',
        },
      },
    },
    paymentReceivedAt: '2026-08-02T16:00:00.000Z',
    workspaceCreatedAt: '2026-08-02T16:05:00.000Z',
    builderReadyAt: '2026-08-03T07:05:00.000Z',
  },
]);

let handoffs: OfficeHandoffSummary[] = SEED_HANDOFFS.map((entry) => ({
  ...entry,
  partnerContext: { ...entry.partnerContext },
  workspace:
    entry.workspace === null
      ? null
      : {
          ...entry.workspace,
          project: {
            ...entry.workspace.project,
            object: { ...entry.workspace.project.object },
          },
        },
}));

function upsertHandoff(next: OfficeHandoffSummary): OfficeHandoffSummary {
  const index = handoffs.findIndex(
    (entry) => entry.partnerId === next.partnerId,
  );
  if (index < 0) {
    handoffs = [...handoffs, next];
  } else {
    handoffs = handoffs.map((entry, i) => (i === index ? next : entry));
  }
  return next;
}

function ensureWaitingHandoff(partnerId: string): OfficeHandoffSummary | null {
  const existing = handoffs.find((entry) => entry.partnerId === partnerId);
  if (existing !== undefined) return existing;
  const context = buildPartnerContext(partnerId);
  if (context === null) return null;
  const partner = getPartner(partnerId);
  const sales = getSalesCase(partnerId);
  const waiting =
    partner?.status === 'payment' || sales?.stage === 'waiting_payment';
  if (!waiting) return null;
  return upsertHandoff({
    partnerId,
    status: 'waiting_payment',
    partnerContext: context,
    workspace: null,
    paymentReceivedAt: null,
    workspaceCreatedAt: null,
    builderReadyAt: null,
  });
}

export function listHandoffs(): readonly OfficeHandoffSummary[] {
  for (const partner of listPartners()) {
    ensureWaitingHandoff(partner.id);
  }
  return [...handoffs].sort((a, b) =>
    a.partnerId.localeCompare(b.partnerId),
  );
}

export function getHandoff(partnerId: string): OfficeHandoffSummary | null {
  return (
    handoffs.find((entry) => entry.partnerId === partnerId) ??
    ensureWaitingHandoff(partnerId)
  );
}

export function listWaitingPaymentHandoffs(): readonly OfficeHandoffSummary[] {
  return listHandoffs().filter((entry) => entry.status === 'waiting_payment');
}

/**
 * PaymentReceived → Implementation + automatic Builder Handoff bootstrap.
 */
export function receivePayment(partnerId: string): OfficeHandoffSummary | null {
  const partner = getPartner(partnerId);
  const context = buildPartnerContext(partnerId);
  if (partner === null || context === null) return null;

  const paymentReceivedAt = nowIso();
  appendOfficeEvent({
    kind: 'payment.received',
    label: 'PaymentReceived',
    detail:
      context.amountCzk !== null
        ? `${context.partnerName} · ${formatCzk(context.amountCzk)}`
        : `${context.partnerName} · platba přijata`,
    partnerId,
  });

  const draft = draftFromPartner(partner);
  updatePartner(partnerId, {
    ...draft,
    status: 'implementation',
    nextStep: defaultNextStep('implementation'),
  });

  let status: OfficeHandoffStatus = 'payment_received';
  upsertHandoff({
    partnerId,
    status,
    partnerContext: context,
    workspace: null,
    paymentReceivedAt,
    workspaceCreatedAt: null,
    builderReadyAt: null,
  });

  const provisioned = provisionPilotWorkspace({
    companyName: context.companyLegalName || context.partnerName,
  });
  const workspaceCreatedAt = nowIso();
  const workspace = buildBuilderWorkspace(partnerId, context, {
    workspaceId: provisioned.workspace.id,
    projectId: provisioned.project.id,
  });

  appendOfficeEvent({
    kind: 'builder.workspace.created',
    label: 'BuilderWorkspaceCreated',
    detail: `${workspace.name} · ${workspace.project.name}`,
    partnerId,
  });

  const builderReadyAt = nowIso();
  status = 'builder_ready';
  const summary = upsertHandoff({
    partnerId,
    status,
    partnerContext: context,
    workspace,
    paymentReceivedAt,
    workspaceCreatedAt,
    builderReadyAt,
  });

  appendOfficeEvent({
    kind: 'builder.ready',
    label: 'BuilderReady',
    detail: `${workspace.project.object.name} · ${workspace.builderHref}`,
    partnerId,
  });

  return summary;
}

export function resetHandoffRegistryForTests(): void {
  handoffs = SEED_HANDOFFS.map((entry) => ({
    ...entry,
    partnerContext: { ...entry.partnerContext },
    workspace:
      entry.workspace === null
        ? null
        : {
            ...entry.workspace,
            project: {
              ...entry.workspace.project,
              object: { ...entry.workspace.project.object },
            },
          },
  }));
}
