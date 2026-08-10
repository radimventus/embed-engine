/**
 * OF-09 — Operations Center registry (MVP projections over Commercial Journey).
 * Licenses / packages / billing overview / ops metrics / operational audit.
 */

import { appendOfficeEvent, listRecentOfficeEvents } from './officeEventCatalog';
import { getDocumentPackage } from './officeDocumentRegistry';
import { getHandoff, listHandoffs } from './officeHandoffRegistry';
import { getPartner, listPartners } from './officePartnerRegistry';
import {
  formatCzk,
  getSalesPackage,
  OFFICE_SALES_PACKAGES,
  type OfficePackageId,
} from './officeSalesModel';
import { getSalesCase, listSalesCases } from './officeSalesRegistry';
import {
  billingStatusTone,
  licenseStatusTone,
  licenseTypeFromPackage,
  OFFICE_BILLING_STATUS_LABELS,
  OFFICE_LICENSE_STATUS_LABELS,
  OFFICE_LICENSE_TYPE_LABELS,
  packageIdFromLicenseType,
  type OfficeBillingRow,
  type OfficeBillingStatus,
  type OfficeLicense,
  type OfficeLicenseStatus,
  type OfficeLicenseType,
  type OfficeOperationsAuditEntry,
  type OfficeOperationsMetrics,
  type OfficePackageUsage,
} from './officeOperationsModel';

type LicenseStore = {
  readonly byPartnerId: Record<string, OfficeLicense>;
};

const DAY_MS = 1000 * 60 * 60 * 24;
const EXPIRING_WITHIN_DAYS = 30;

let licenseOverrides: LicenseStore = { byPartnerId: {} };

function nowIso(): string {
  return new Date().toISOString();
}

function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * DAY_MS).toISOString();
}

function deriveLicenseStatus(
  activatedAt: string | null,
  expiresAt: string | null,
): OfficeLicenseStatus {
  if (activatedAt === null) return 'pending';
  if (expiresAt === null) return 'active';
  const remaining = new Date(expiresAt).getTime() - Date.now();
  if (remaining < 0) return 'expired';
  if (remaining <= EXPIRING_WITHIN_DAYS * DAY_MS) return 'expiring';
  return 'active';
}

function seedLicenseForPartner(partnerId: string): OfficeLicense | null {
  const partner = getPartner(partnerId);
  if (partner === null) return null;
  const sales = getSalesCase(partnerId);
  const handoff = getHandoff(partnerId);
  const packageId =
    sales?.order?.packageId ?? sales?.offer.packageId ?? 'pilot';
  const type = licenseTypeFromPackage(packageId);
  const paid =
    handoff?.status === 'payment_received' ||
    handoff?.status === 'builder_ready' ||
    partner.status === 'implementation' ||
    partner.status === 'active';
  const activatedAt =
    handoff?.paymentReceivedAt ??
    (paid ? partner.updatedAt : null);
  const expiresAt =
    activatedAt !== null ? addDays(activatedAt, 365) : null;
  return {
    id: `lic-${partnerId}`,
    partnerId,
    partnerName: partner.name,
    type,
    packageId,
    activatedAt,
    expiresAt,
    status: deriveLicenseStatus(activatedAt, expiresAt),
  };
}

function resolveLicense(partnerId: string): OfficeLicense | null {
  const override = licenseOverrides.byPartnerId[partnerId];
  if (override !== undefined) {
    return {
      ...override,
      status: deriveLicenseStatus(override.activatedAt, override.expiresAt),
      partnerName: getPartner(partnerId)?.name ?? override.partnerName,
    };
  }
  return seedLicenseForPartner(partnerId);
}

export function resetOperationsRegistryForTests(): void {
  licenseOverrides = { byPartnerId: {} };
}

export function listLicenses(): readonly OfficeLicense[] {
  return listPartners()
    .map((partner) => resolveLicense(partner.id))
    .filter((entry): entry is OfficeLicense => entry !== null)
    .sort((a, b) => a.partnerName.localeCompare(b.partnerName, 'cs'));
}

export function getLicense(partnerId: string): OfficeLicense | null {
  return resolveLicense(partnerId);
}

export function activateLicense(input: {
  readonly partnerId: string;
  readonly type: OfficeLicenseType;
  readonly activatedAt?: string;
  readonly expiresAt?: string | null;
}): OfficeLicense | null {
  const partner = getPartner(input.partnerId);
  if (partner === null) return null;
  const activatedAt = input.activatedAt ?? nowIso();
  const expiresAt =
    input.expiresAt === undefined ? addDays(activatedAt, 365) : input.expiresAt;
  const packageId = packageIdFromLicenseType(input.type);
  const license: OfficeLicense = {
    id: `lic-${input.partnerId}`,
    partnerId: input.partnerId,
    partnerName: partner.name,
    type: input.type,
    packageId,
    activatedAt,
    expiresAt,
    status: deriveLicenseStatus(activatedAt, expiresAt),
  };
  licenseOverrides = {
    byPartnerId: {
      ...licenseOverrides.byPartnerId,
      [input.partnerId]: license,
    },
  };
  appendOfficeEvent({
    kind: 'partner.updated',
    label: 'Licence aktivována',
    detail: `${partner.name} · ${OFFICE_LICENSE_TYPE_LABELS[input.type]} · ${OFFICE_LICENSE_STATUS_LABELS[license.status]}`,
    partnerId: input.partnerId,
  });
  return license;
}

export function setLicenseExpiry(
  partnerId: string,
  expiresAt: string | null,
): OfficeLicense | null {
  const current = resolveLicense(partnerId);
  if (current === null) return null;
  const next: OfficeLicense = {
    ...current,
    expiresAt,
    status: deriveLicenseStatus(current.activatedAt, expiresAt),
  };
  licenseOverrides = {
    byPartnerId: {
      ...licenseOverrides.byPartnerId,
      [partnerId]: next,
    },
  };
  appendOfficeEvent({
    kind: 'partner.updated',
    label: 'Licence aktualizována',
    detail: `${current.partnerName} · expirace ${expiresAt ?? 'bez data'}`,
    partnerId,
  });
  return next;
}

export function listPackageUsage(): readonly OfficePackageUsage[] {
  const licenses = listLicenses().filter(
    (entry) => entry.status === 'active' || entry.status === 'expiring',
  );
  return OFFICE_SALES_PACKAGES.map((pkg) => {
    const matched = licenses.filter((entry) => entry.packageId === pkg.id);
    return {
      packageId: pkg.id,
      name: pkg.name,
      activePartners: matched.length,
      partnerNames: matched.map((entry) => entry.partnerName),
    };
  });
}

export function getActivePackageForPartner(
  partnerId: string,
): {
  readonly packageId: OfficePackageId;
  readonly name: string;
  readonly licenseStatus: OfficeLicenseStatus;
} | null {
  const license = resolveLicense(partnerId);
  if (license === null) return null;
  const pkg = getSalesPackage(license.packageId);
  return {
    packageId: pkg.id,
    name: pkg.name,
    licenseStatus: license.status,
  };
}

function deriveBillingStatus(partnerId: string): OfficeBillingRow | null {
  const partner = getPartner(partnerId);
  if (partner === null) return null;
  const docs = getDocumentPackage(partnerId);
  const sales = getSalesCase(partnerId);
  const handoff = getHandoff(partnerId);
  const amount =
    docs?.proforma?.amountCzk ??
    sales?.order?.amountCzk ??
    null;

  const paid =
    handoff?.status === 'payment_received' ||
    handoff?.status === 'builder_ready' ||
    partner.status === 'implementation' ||
    partner.status === 'active';

  let status: OfficeBillingStatus;
  let reference: string;
  let updatedAt: string;

  if (paid) {
    status = 'paid';
    reference =
      docs?.proforma?.number ??
      sales?.order?.id ??
      'PaymentReceived';
    updatedAt =
      handoff?.paymentReceivedAt ?? partner.updatedAt;
  } else if (docs?.proforma != null) {
    status =
      sales?.stage === 'waiting_payment' || partner.status === 'payment'
        ? 'unpaid'
        : 'proforma';
    reference = docs.proforma.number;
    updatedAt = docs.proforma.issuedAt;
  } else if (sales?.stage === 'waiting_payment' && sales.order !== null) {
    status = 'unpaid';
    reference = sales.order.id;
    updatedAt = sales.order.confirmedAt;
  } else {
    return null;
  }

  return {
    id: `bill-${partnerId}`,
    partnerId,
    partnerName: partner.name,
    status,
    amountCzk: amount,
    reference,
    updatedAt,
  };
}

export function listBillingOverview(): readonly OfficeBillingRow[] {
  return listPartners()
    .map((partner) => deriveBillingStatus(partner.id))
    .filter((entry): entry is OfficeBillingRow => entry !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function buildOperationsMetrics(): OfficeOperationsMetrics {
  const partners = listPartners();
  const sales = listSalesCases();
  const handoffs = listHandoffs();

  const activePartners = partners.filter(
    (partner) =>
      partner.status === 'active' ||
      partner.status === 'implementation' ||
      partner.status === 'payment' ||
      partner.status === 'order',
  ).length;

  const waitingPayments = sales.filter(
    (entry) => entry.stage === 'waiting_payment',
  ).length;

  const implementationsInProgress = partners.filter(
    (partner) => partner.status === 'implementation',
  ).length;

  const implementationsDone = handoffs.filter(
    (entry) => entry.status === 'builder_ready',
  ).length;

  return {
    activePartners,
    waitingPayments,
    implementationsInProgress,
    implementationsDone,
  };
}

export function listOperationsAudit(
  limit = 20,
): readonly OfficeOperationsAuditEntry[] {
  return listRecentOfficeEvents(limit).map((event) => ({
    id: event.id,
    at: event.occurredAt,
    label: event.label,
    detail: event.detail,
    partnerId: event.partnerId,
  }));
}

export function formatLicenseWindow(license: OfficeLicense): string {
  if (license.activatedAt === null) return 'Neaktivována';
  const from = new Date(license.activatedAt).toLocaleDateString('cs-CZ');
  if (license.expiresAt === null) return `Od ${from}`;
  const to = new Date(license.expiresAt).toLocaleDateString('cs-CZ');
  return `${from} → ${to}`;
}

export function formatBillingAmount(row: OfficeBillingRow): string {
  return row.amountCzk !== null ? formatCzk(row.amountCzk) : '—';
}

export {
  OFFICE_BILLING_STATUS_LABELS,
  OFFICE_LICENSE_STATUS_LABELS,
  OFFICE_LICENSE_TYPE_LABELS,
  billingStatusTone,
  licenseStatusTone,
};
