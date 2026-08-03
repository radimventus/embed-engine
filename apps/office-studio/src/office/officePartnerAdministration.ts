/**
 * PE-12 — Partner Administration (post-activation operational management).
 * Profile · package/licence/contact/notes · audit timeline.
 * No Runtime / Decision Layer / capabilities / invoicing / data deletion.
 */

import { appendOfficeEvent } from './officeEventCatalog';
import {
  getPartnerEnvironmentRecord,
  setPartnerEnvironmentCommercial,
} from './officePartnerEnvironmentLifecycle';
import type { OfficeContactCard } from './officePartnerModel';
import {
  draftFromPartner,
  getPartner,
  listPartners,
  updatePartner,
} from './officePartnerRegistry';
import type { OfficePackageId } from './officeSalesModel';
import {
  formatCzk,
  getSalesPackage,
  OFFICE_SALES_PACKAGES,
} from './officeSalesModel';
import { getSalesCase } from './officeSalesRegistry';

export type PartnerAdminChangeKind =
  | 'package'
  | 'licence'
  | 'contact'
  | 'note';

export type PartnerAdminNote = {
  readonly id: string;
  readonly text: string;
  readonly createdAt: string;
};

export type PartnerAdminChange = {
  readonly id: string;
  readonly kind: PartnerAdminChangeKind;
  readonly summary: string;
  readonly occurredAt: string;
};

export type PartnerAdminLicence = {
  readonly label: string;
  readonly source: 'package' | 'override';
};

export type PartnerAdminProfile = {
  readonly partnerId: string;
  readonly partnerName: string;
  readonly legalName: string;
  readonly ico: string;
  readonly city: string;
  readonly country: string;
  readonly contact: OfficeContactCard;
  readonly packageId: OfficePackageId | null;
  readonly packageName: string | null;
  readonly licence: PartnerAdminLicence;
  readonly notes: readonly PartnerAdminNote[];
  readonly changeHistory: readonly PartnerAdminChange[];
  readonly updatedAt: string | null;
};

export type PartnerAdminDashboardRow = {
  readonly partnerId: string;
  readonly partnerName: string;
  readonly packageName: string;
  readonly licence: string;
  readonly contactName: string;
  readonly contactEmail: string;
  readonly lastChangeSummary: string;
  readonly lastChangeAt: string | null;
  readonly notesCount: number;
};

type AdminStoreEntry = {
  readonly partnerId: string;
  readonly packageId: OfficePackageId | null;
  readonly licenceOverride: string | null;
  readonly notes: readonly PartnerAdminNote[];
  readonly changes: readonly PartnerAdminChange[];
  readonly updatedAt: string;
};

type AdminStore = {
  byPartnerId: Record<string, AdminStoreEntry>;
};

let store: AdminStore = { byPartnerId: {} };
let noteSeq = 0;
let changeSeq = 0;

function nowIso(): string {
  return new Date().toISOString();
}

function emptyEntry(partnerId: string): AdminStoreEntry {
  return {
    partnerId,
    packageId: null,
    licenceOverride: null,
    notes: [],
    changes: [],
    updatedAt: nowIso(),
  };
}

function getEntry(partnerId: string): AdminStoreEntry {
  return store.byPartnerId[partnerId] ?? emptyEntry(partnerId);
}

function upsertEntry(entry: AdminStoreEntry): AdminStoreEntry {
  store = {
    byPartnerId: {
      ...store.byPartnerId,
      [entry.partnerId]: entry,
    },
  };
  return entry;
}

function pushChange(
  entry: AdminStoreEntry,
  kind: PartnerAdminChangeKind,
  summary: string,
  at: string,
): AdminStoreEntry {
  changeSeq += 1;
  const change: PartnerAdminChange = {
    id: `admin-chg-${changeSeq}`,
    kind,
    summary,
    occurredAt: at,
  };
  return {
    ...entry,
    changes: [change, ...entry.changes],
    updatedAt: at,
  };
}

function resolvePackageId(partnerId: string): OfficePackageId | null {
  const entry = getEntry(partnerId);
  if (entry.packageId !== null) return entry.packageId;
  const env = getPartnerEnvironmentRecord(partnerId);
  if (env.packageId !== null) return env.packageId;
  const sales = getSalesCase(partnerId);
  return sales?.order?.packageId ?? sales?.offer.packageId ?? null;
}

function resolveLicence(
  partnerId: string,
  packageId: OfficePackageId | null,
): PartnerAdminLicence {
  const override = getEntry(partnerId).licenceOverride;
  if (override !== null && override.trim().length > 0) {
    return { label: override.trim(), source: 'override' };
  }
  if (packageId === null) {
    return { label: '—', source: 'package' };
  }
  const pkg = getSalesPackage(packageId);
  return {
    label: `${pkg.housesLabel} · ${formatCzk(pkg.priceCzk)}`,
    source: 'package',
  };
}

export function listAdminPackages(): readonly {
  readonly id: OfficePackageId;
  readonly name: string;
}[] {
  return OFFICE_SALES_PACKAGES.map((pkg) => ({ id: pkg.id, name: pkg.name }));
}

export function buildPartnerAdminProfile(
  partnerId: string,
): PartnerAdminProfile | null {
  const partner = getPartner(partnerId);
  if (partner === null) return null;
  const entry = getEntry(partnerId);
  const packageId = resolvePackageId(partnerId);
  const pkg = packageId !== null ? getSalesPackage(packageId) : null;
  return {
    partnerId,
    partnerName: partner.name,
    legalName: partner.company.legalName,
    ico: partner.company.ico,
    city: partner.company.city,
    country: partner.company.country,
    contact: { ...partner.contact },
    packageId,
    packageName: pkg?.name ?? null,
    licence: resolveLicence(partnerId, packageId),
    notes: entry.notes,
    changeHistory: entry.changes,
    updatedAt: entry.changes.length > 0 ? entry.updatedAt : null,
  };
}

export function listPartnerAdminDashboardRows(): readonly PartnerAdminDashboardRow[] {
  return listPartners()
    .map((partner) => buildPartnerAdminProfile(partner.id))
    .filter((profile): profile is PartnerAdminProfile => profile !== null)
    .filter((profile) => {
      const lifecycle = getPartnerEnvironmentRecord(profile.partnerId);
      return lifecycle.lifecycleStatus !== null;
    })
    .map((profile) => {
      const last = profile.changeHistory[0] ?? null;
      return {
        partnerId: profile.partnerId,
        partnerName: profile.partnerName,
        packageName: profile.packageName ?? '—',
        licence: profile.licence.label,
        contactName: profile.contact.name || '—',
        contactEmail: profile.contact.email || '—',
        lastChangeSummary: last?.summary ?? 'Zatím bez administrativních změn',
        lastChangeAt: last?.occurredAt ?? null,
        notesCount: profile.notes.length,
      };
    });
}

/**
 * Change active commercial package (data retained; audited).
 */
export function changePartnerPackage(
  partnerId: string,
  packageId: OfficePackageId,
): PartnerAdminProfile | null {
  if (getPartner(partnerId) === null) return null;
  const pkg = getSalesPackage(packageId);
  const stamp = nowIso();
  let entry = getEntry(partnerId);
  entry = upsertEntry(
    pushChange(
      {
        ...entry,
        packageId,
        // Reset override so licence follows new package unless set again.
        licenceOverride: null,
      },
      'package',
      `Balíček změněn na ${pkg.name}`,
      stamp,
    ),
  );
  setPartnerEnvironmentCommercial(partnerId, {
    packageId,
    licenceLabel: `${pkg.housesLabel} · ${formatCzk(pkg.priceCzk)}`,
  });
  appendOfficeEvent({
    kind: 'admin.package_changed',
    label: 'PackageChanged',
    detail: `${pkg.name} · ${pkg.housesLabel}`,
    partnerId,
  });
  return buildPartnerAdminProfile(partnerId);
}

/**
 * Override licence label without deleting prior package history.
 */
export function changePartnerLicence(
  partnerId: string,
  licenceLabel: string,
): PartnerAdminProfile | null {
  if (getPartner(partnerId) === null) return null;
  const trimmed = licenceLabel.trim();
  if (trimmed.length === 0) return buildPartnerAdminProfile(partnerId);
  const stamp = nowIso();
  let entry = getEntry(partnerId);
  entry = upsertEntry(
    pushChange(
      { ...entry, licenceOverride: trimmed },
      'licence',
      `Licence aktualizována · ${trimmed}`,
      stamp,
    ),
  );
  const packageId = resolvePackageId(partnerId);
  if (packageId !== null) {
    setPartnerEnvironmentCommercial(partnerId, {
      packageId,
      licenceLabel: trimmed,
    });
  }
  appendOfficeEvent({
    kind: 'admin.licence_changed',
    label: 'LicenceChanged',
    detail: trimmed,
    partnerId,
  });
  return buildPartnerAdminProfile(partnerId);
}

/**
 * Update primary contact person (no deletion of prior contact history in audit).
 */
export function changePartnerContact(
  partnerId: string,
  contact: OfficeContactCard,
): PartnerAdminProfile | null {
  const partner = getPartner(partnerId);
  if (partner === null) return null;
  const stamp = nowIso();
  updatePartner(partnerId, {
    ...draftFromPartner(partner),
    contact: {
      name: contact.name.trim(),
      email: contact.email.trim(),
      phone: contact.phone.trim(),
      role: contact.role.trim(),
    },
  });
  upsertEntry(
    pushChange(
      getEntry(partnerId),
      'contact',
      `Kontakt · ${contact.name.trim() || '—'} · ${contact.email.trim() || '—'}`,
      stamp,
    ),
  );
  appendOfficeEvent({
    kind: 'admin.contact_changed',
    label: 'ContactChanged',
    detail: `${contact.name.trim() || '—'} · ${contact.email.trim() || '—'}`,
    partnerId,
  });
  return buildPartnerAdminProfile(partnerId);
}

/**
 * Append internal note (append-only; no deletion).
 */
export function addPartnerInternalNote(
  partnerId: string,
  text: string,
): PartnerAdminProfile | null {
  if (getPartner(partnerId) === null) return null;
  const trimmed = text.trim();
  if (trimmed.length === 0) return buildPartnerAdminProfile(partnerId);
  const stamp = nowIso();
  noteSeq += 1;
  const note: PartnerAdminNote = {
    id: `admin-note-${noteSeq}`,
    text: trimmed,
    createdAt: stamp,
  };
  const entry = getEntry(partnerId);
  upsertEntry(
    pushChange(
      {
        ...entry,
        notes: [note, ...entry.notes],
      },
      'note',
      `Interní poznámka · ${trimmed.slice(0, 80)}`,
      stamp,
    ),
  );
  appendOfficeEvent({
    kind: 'admin.note_added',
    label: 'InternalNoteAdded',
    detail: trimmed.slice(0, 120),
    partnerId,
  });
  return buildPartnerAdminProfile(partnerId);
}

/** Test helper — clears administration store. */
export function resetPartnerAdministrationForTests(): void {
  store = { byPartnerId: {} };
  noteSeq = 0;
  changeSeq = 0;
}
