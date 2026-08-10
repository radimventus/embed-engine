/**
 * OF-09 — Operations Center domain model (MVP).
 * Commercial operations after sale — not accounting / ERP / BI.
 */

import type { OfficePackageId } from './officeSalesModel';

export type OfficeLicenseType = 'pilot' | 'starter' | 'studio_partner';

export type OfficeLicenseStatus =
  | 'pending'
  | 'active'
  | 'expiring'
  | 'expired';

export type OfficeLicense = {
  readonly id: string;
  readonly partnerId: string;
  readonly partnerName: string;
  readonly type: OfficeLicenseType;
  readonly packageId: OfficePackageId;
  readonly activatedAt: string | null;
  readonly expiresAt: string | null;
  readonly status: OfficeLicenseStatus;
};

export type OfficeBillingStatus = 'proforma' | 'paid' | 'unpaid';

export type OfficeBillingRow = {
  readonly id: string;
  readonly partnerId: string;
  readonly partnerName: string;
  readonly status: OfficeBillingStatus;
  readonly amountCzk: number | null;
  readonly reference: string;
  readonly updatedAt: string;
};

export type OfficePackageUsage = {
  readonly packageId: OfficePackageId;
  readonly name: string;
  readonly activePartners: number;
  readonly partnerNames: readonly string[];
};

export type OfficeOperationsMetrics = {
  readonly activePartners: number;
  readonly waitingPayments: number;
  readonly implementationsInProgress: number;
  readonly implementationsDone: number;
};

export type OfficeOperationsAuditEntry = {
  readonly id: string;
  readonly at: string;
  readonly label: string;
  readonly detail: string;
  readonly partnerId: string | null;
};

export const OFFICE_LICENSE_TYPE_LABELS: Record<OfficeLicenseType, string> = {
  pilot: 'Pilot',
  starter: 'Starter',
  studio_partner: 'Studio Partner',
};

export const OFFICE_LICENSE_STATUS_LABELS: Record<OfficeLicenseStatus, string> =
  {
    pending: 'Čeká',
    active: 'Aktivní',
    expiring: 'Expiruje',
    expired: 'Expirovaná',
  };

export const OFFICE_BILLING_STATUS_LABELS: Record<OfficeBillingStatus, string> =
  {
    proforma: 'Proforma',
    paid: 'Zaplaceno',
    unpaid: 'Nezaplaceno',
  };

export function licenseTypeFromPackage(
  packageId: OfficePackageId | null,
): OfficeLicenseType {
  switch (packageId) {
    case 'starter':
      return 'starter';
    case 'studio-partner':
      return 'studio_partner';
    case 'pilot':
    default:
      return 'pilot';
  }
}

export function packageIdFromLicenseType(
  type: OfficeLicenseType,
): OfficePackageId {
  switch (type) {
    case 'starter':
      return 'starter';
    case 'studio_partner':
      return 'studio-partner';
    case 'pilot':
      return 'pilot';
  }
}

export function licenseStatusTone(
  status: OfficeLicenseStatus,
): 'pass' | 'warning' | 'fail' | 'info' | 'gold' | 'draft' {
  switch (status) {
    case 'active':
      return 'pass';
    case 'expiring':
      return 'gold';
    case 'expired':
      return 'fail';
    case 'pending':
      return 'warning';
  }
}

export function billingStatusTone(
  status: OfficeBillingStatus,
): 'pass' | 'warning' | 'info' | 'gold' {
  switch (status) {
    case 'paid':
      return 'pass';
    case 'unpaid':
      return 'warning';
    case 'proforma':
      return 'info';
  }
}
