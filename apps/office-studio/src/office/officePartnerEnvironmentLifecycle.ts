/**
 * PE-10 / PE-11 — Partner Environment activation + Partner Lifecycle.
 * Lifecycle (after activation): Active → Suspended → Archived.
 * Pilot is onboarding only — not a lifecycle state.
 * No Runtime / Decision Layer / capabilities / data deletion.
 */

import { appendOfficeEvent, listPartnerTimeline } from './officeEventCatalog';
import {
  draftFromPartner,
  getPartner,
  listPartners,
  updatePartner,
} from './officePartnerRegistry';
import type { OfficePackageId } from './officeSalesModel';
import { formatCzk, getSalesPackage } from './officeSalesModel';

/** PE-11 — long-term partner lifecycle (Pilot is excluded). */
export type PartnerLifecycleStatus = 'active' | 'suspended' | 'archived';

/** @deprecated Prefer PartnerLifecycleStatus — PE-10 alias during transition. */
export type PartnerEnvironmentLifecycleStatus =
  | 'pilot'
  | PartnerLifecycleStatus
  | 'active_partner';

export type PartnerStudioAccess = {
  readonly client: boolean;
  readonly manager: boolean;
  readonly sales: boolean;
};

export type PartnerAdminActionId =
  | 'activate'
  | 'suspend'
  | 'restore'
  | 'archive';

export type PartnerEnvironmentRecord = {
  readonly partnerId: string;
  /** Null until Partner Environment is activated (PE-10). */
  readonly lifecycleStatus: PartnerLifecycleStatus | null;
  readonly pilotMode: boolean;
  readonly permanentWorkspace: boolean;
  readonly packageId: OfficePackageId | null;
  readonly packageName: string | null;
  readonly licenceLabel: string | null;
  readonly activatedAt: string | null;
  readonly lastActivityAt: string | null;
  readonly statusChangedAt: string | null;
  readonly statusChangeReason: string | null;
  readonly lastAdminAction: PartnerAdminActionId | null;
  readonly studioAccess: PartnerStudioAccess;
  readonly updatedAt: string;
  /**
   * PE-10 display compatibility: pilot | active | suspended | archived.
   * Prefer lifecycleStatus for PE-11.
   */
  readonly status: PartnerEnvironmentLifecycleStatus;
};

export type PartnerWorkspaceSummary = {
  readonly partnerId: string;
  readonly partnerName: string;
  readonly partnerStatus: PartnerEnvironmentLifecycleStatus;
  readonly partnerStatusLabel: string;
  readonly lifecycleStatus: PartnerLifecycleStatus | null;
  readonly lifecycleStatusLabel: string;
  readonly licence: string;
  readonly activePackage: string;
  readonly activatedAt: string | null;
  readonly lastActivityAt: string | null;
  readonly statusChangedAt: string | null;
  readonly statusChangeReason: string | null;
  readonly lastAdminAction: PartnerAdminActionId | null;
  readonly lastAdminActionLabel: string;
  readonly studioAccess: PartnerStudioAccess;
};

export const PARTNER_LIFECYCLE_STATUS_LABELS: Readonly<
  Record<PartnerLifecycleStatus, string>
> = Object.freeze({
  active: 'Active',
  suspended: 'Suspended',
  archived: 'Archived',
});

export const PARTNER_ADMIN_ACTION_LABELS: Readonly<
  Record<PartnerAdminActionId, string>
> = Object.freeze({
  activate: 'Aktivace prostředí',
  suspend: 'Pozastavení partnera',
  restore: 'Obnovení partnera',
  archive: 'Archivace partnera',
});

const DENIED_STUDIO_ACCESS: PartnerStudioAccess = Object.freeze({
  client: false,
  manager: false,
  sales: false,
});

const FULL_STUDIO_ACCESS: PartnerStudioAccess = Object.freeze({
  client: true,
  manager: true,
  sales: true,
});

type LifecycleStore = {
  byPartnerId: Record<string, PartnerEnvironmentRecord>;
};

let store: LifecycleStore = { byPartnerId: {} };

function nowIso(): string {
  return new Date().toISOString();
}

function hasTimelineKind(partnerId: string, kind: string): boolean {
  return listPartnerTimeline(partnerId, 100).some(
    (event) => event.kind === kind,
  );
}

export function studioAccessForLifecycle(
  status: PartnerLifecycleStatus | null,
): PartnerStudioAccess {
  return status === 'active' ? FULL_STUDIO_ACCESS : DENIED_STUDIO_ACCESS;
}

function displayStatus(
  lifecycleStatus: PartnerLifecycleStatus | null,
  pilotMode: boolean,
): PartnerEnvironmentLifecycleStatus {
  if (lifecycleStatus !== null) return lifecycleStatus;
  return pilotMode ? 'pilot' : 'pilot';
}

function defaultRecord(partnerId: string): PartnerEnvironmentRecord {
  const stamp = nowIso();
  return {
    partnerId,
    lifecycleStatus: null,
    status: 'pilot',
    pilotMode: true,
    permanentWorkspace: false,
    packageId: null,
    packageName: null,
    licenceLabel: null,
    activatedAt: null,
    lastActivityAt: null,
    statusChangedAt: null,
    statusChangeReason: null,
    lastAdminAction: null,
    studioAccess: DENIED_STUDIO_ACCESS,
    updatedAt: stamp,
  };
}

function resolvePackageMeta(packageId: OfficePackageId | null): {
  packageName: string | null;
  licenceLabel: string | null;
} {
  if (packageId === null) {
    return { packageName: null, licenceLabel: null };
  }
  const pkg = getSalesPackage(packageId);
  return {
    packageName: pkg.name,
    licenceLabel: `${pkg.housesLabel} · ${formatCzk(pkg.priceCzk)}`,
  };
}

function upsert(record: PartnerEnvironmentRecord): PartnerEnvironmentRecord {
  store = {
    byPartnerId: {
      ...store.byPartnerId,
      [record.partnerId]: record,
    },
  };
  return record;
}

function normalizeStored(
  raw: PartnerEnvironmentRecord,
): PartnerEnvironmentRecord {
  // Migrate PE-10 active_partner records if any linger in memory.
  const legacyStatus = raw.status as string;
  let lifecycleStatus = raw.lifecycleStatus ?? null;
  if (lifecycleStatus === null && legacyStatus === 'active_partner') {
    lifecycleStatus = 'active';
  }
  if (lifecycleStatus === null && legacyStatus === 'active') {
    lifecycleStatus = 'active';
  }
  if (lifecycleStatus === null && legacyStatus === 'suspended') {
    lifecycleStatus = 'suspended';
  }
  if (lifecycleStatus === null && legacyStatus === 'archived') {
    lifecycleStatus = 'archived';
  }
  const pilotMode =
    lifecycleStatus === null ? (raw.pilotMode ?? true) : false;
  return {
    ...raw,
    lifecycleStatus,
    pilotMode,
    status: displayStatus(lifecycleStatus, pilotMode),
    studioAccess:
      raw.studioAccess ?? studioAccessForLifecycle(lifecycleStatus),
    statusChangedAt: raw.statusChangedAt ?? null,
    statusChangeReason: raw.statusChangeReason ?? null,
    lastAdminAction: raw.lastAdminAction ?? null,
  };
}

export function getPartnerEnvironmentRecord(
  partnerId: string,
): PartnerEnvironmentRecord {
  const existing = store.byPartnerId[partnerId];
  if (existing === undefined) return defaultRecord(partnerId);
  return normalizeStored(existing);
}

export function listPartnerEnvironmentRecords(): readonly PartnerEnvironmentRecord[] {
  return listPartners().map((partner) =>
    getPartnerEnvironmentRecord(partner.id),
  );
}

export function partnerLifecycleStatusLabel(
  status: PartnerLifecycleStatus | null,
): string {
  if (status === null) return '—';
  return PARTNER_LIFECYCLE_STATUS_LABELS[status];
}

/** @deprecated Prefer partnerLifecycleStatusLabel */
export function partnerEnvironmentStatusLabel(
  status: PartnerEnvironmentLifecycleStatus,
): string {
  if (status === 'active_partner') return 'Active';
  if (status === 'pilot') return 'Pilot';
  if (status === 'active' || status === 'suspended' || status === 'archived') {
    return PARTNER_LIFECYCLE_STATUS_LABELS[status];
  }
  return status;
}

export function partnerAdminActionLabel(
  action: PartnerAdminActionId | null,
): string {
  if (action === null) return '—';
  return PARTNER_ADMIN_ACTION_LABELS[action];
}

/**
 * PE-10 — Activate long-term Partner Environment after order confirmation.
 * Ends Pilot mode and enters PE-11 lifecycle as Active.
 */
export function activatePartnerEnvironment(
  partnerId: string,
  packageId: OfficePackageId | null = null,
): PartnerEnvironmentRecord | null {
  const partner = getPartner(partnerId);
  if (partner === null) return null;

  const existing = getPartnerEnvironmentRecord(partnerId);
  if (
    existing.lifecycleStatus === 'active' &&
    existing.pilotMode === false &&
    existing.activatedAt !== null
  ) {
    return existing;
  }
  if (existing.lifecycleStatus === 'archived') {
    return existing;
  }

  const resolvedPackageId = packageId ?? existing.packageId;
  const meta = resolvePackageMeta(resolvedPackageId);
  const stamp = nowIso();
  const lifecycleStatus: PartnerLifecycleStatus = 'active';

  upsert({
    partnerId,
    lifecycleStatus,
    status: lifecycleStatus,
    pilotMode: false,
    permanentWorkspace: true,
    packageId: resolvedPackageId,
    packageName: meta.packageName,
    licenceLabel: meta.licenceLabel,
    activatedAt: existing.activatedAt ?? stamp,
    lastActivityAt: stamp,
    statusChangedAt: stamp,
    statusChangeReason: 'Partner Environment aktivováno po potvrzení nabídky',
    lastAdminAction: 'activate',
    studioAccess: studioAccessForLifecycle(lifecycleStatus),
    updatedAt: stamp,
  });

  updatePartner(partnerId, {
    ...draftFromPartner(partner),
    status: 'active',
    nextStep: 'Dlouhodobý Partner Environment — standardní provoz',
  });

  if (!hasTimelineKind(partnerId, 'pilot.completed')) {
    appendOfficeEvent({
      kind: 'pilot.completed',
      label: 'PilotCompleted',
      detail: 'Pilotní režim ukončen',
      partnerId,
    });
  }
  if (!hasTimelineKind(partnerId, 'environment.activated')) {
    appendOfficeEvent({
      kind: 'environment.activated',
      label: 'EnvironmentActivated',
      detail: meta.packageName
        ? `Partner Environment aktivní · ${meta.packageName}`
        : 'Partner Environment aktivní',
      partnerId,
    });
  }
  if (!hasTimelineKind(partnerId, 'partner.activated')) {
    appendOfficeEvent({
      kind: 'partner.activated',
      label: 'PartnerActivated',
      detail: `${partner.name} · Active`,
      partnerId,
    });
  }

  return getPartnerEnvironmentRecord(partnerId);
}

/**
 * PE-12 — Update commercial package/licence on an activated Partner Environment.
 * Retains lifecycle status and studio access; no data deletion.
 */
export function setPartnerEnvironmentCommercial(
  partnerId: string,
  input: {
    readonly packageId: OfficePackageId;
    readonly licenceLabel?: string | null;
  },
): PartnerEnvironmentRecord | null {
  if (getPartner(partnerId) === null) return null;
  const current = getPartnerEnvironmentRecord(partnerId);
  const meta = resolvePackageMeta(input.packageId);
  const stamp = nowIso();
  return upsert({
    ...current,
    packageId: input.packageId,
    packageName: meta.packageName,
    licenceLabel:
      input.licenceLabel?.trim() ||
      meta.licenceLabel ||
      current.licenceLabel,
    lastActivityAt: stamp,
    updatedAt: stamp,
  });
}

const DEFAULT_SUSPEND_REASON = 'Pozastaveno administrátorem Office';
const DEFAULT_RESTORE_REASON = 'Obnoveno administrátorem Office';
const DEFAULT_ARCHIVE_REASON = 'Archivováno administrátorem Office';

/**
 * PE-11 — Suspend partner (studio access revoked, data retained).
 */
export function suspendPartnerEnvironment(
  partnerId: string,
  reason: string = DEFAULT_SUSPEND_REASON,
): PartnerEnvironmentRecord | null {
  const partner = getPartner(partnerId);
  if (partner === null) return null;
  const current = getPartnerEnvironmentRecord(partnerId);
  if (current.lifecycleStatus === null) return current;
  if (current.lifecycleStatus === 'archived') return current;
  if (current.lifecycleStatus === 'suspended') return current;

  const stamp = nowIso();
  const lifecycleStatus: PartnerLifecycleStatus = 'suspended';
  upsert({
    ...current,
    lifecycleStatus,
    status: lifecycleStatus,
    pilotMode: false,
    lastActivityAt: stamp,
    statusChangedAt: stamp,
    statusChangeReason: reason.trim() || DEFAULT_SUSPEND_REASON,
    lastAdminAction: 'suspend',
    studioAccess: studioAccessForLifecycle(lifecycleStatus),
    updatedAt: stamp,
  });

  updatePartner(partnerId, {
    ...draftFromPartner(partner),
    nextStep: 'Partner pozastaven — obnovit nebo archivovat',
  });

  appendOfficeEvent({
    kind: 'partner.suspended',
    label: 'PartnerSuspended',
    detail: reason.trim() || DEFAULT_SUSPEND_REASON,
    partnerId,
  });

  return getPartnerEnvironmentRecord(partnerId);
}

/**
 * PE-11 — Restore suspended partner to Active (studio access restored).
 */
export function restorePartnerEnvironment(
  partnerId: string,
  reason: string = DEFAULT_RESTORE_REASON,
): PartnerEnvironmentRecord | null {
  const partner = getPartner(partnerId);
  if (partner === null) return null;
  const current = getPartnerEnvironmentRecord(partnerId);
  if (current.lifecycleStatus !== 'suspended') return current;

  const stamp = nowIso();
  const lifecycleStatus: PartnerLifecycleStatus = 'active';
  upsert({
    ...current,
    lifecycleStatus,
    status: lifecycleStatus,
    pilotMode: false,
    permanentWorkspace: true,
    lastActivityAt: stamp,
    statusChangedAt: stamp,
    statusChangeReason: reason.trim() || DEFAULT_RESTORE_REASON,
    lastAdminAction: 'restore',
    studioAccess: studioAccessForLifecycle(lifecycleStatus),
    updatedAt: stamp,
  });

  updatePartner(partnerId, {
    ...draftFromPartner(partner),
    status: 'active',
    nextStep: 'Dlouhodobý Partner Environment — standardní provoz',
  });

  appendOfficeEvent({
    kind: 'partner.restored',
    label: 'PartnerRestored',
    detail: reason.trim() || DEFAULT_RESTORE_REASON,
    partnerId,
  });

  return getPartnerEnvironmentRecord(partnerId);
}

/**
 * PE-11 — Archive partner (terminal; data retained, no deletion).
 */
export function archivePartnerEnvironment(
  partnerId: string,
  reason: string = DEFAULT_ARCHIVE_REASON,
): PartnerEnvironmentRecord | null {
  const partner = getPartner(partnerId);
  if (partner === null) return null;
  const current = getPartnerEnvironmentRecord(partnerId);
  if (current.lifecycleStatus === null) return current;
  if (current.lifecycleStatus === 'archived') return current;

  const stamp = nowIso();
  const lifecycleStatus: PartnerLifecycleStatus = 'archived';
  upsert({
    ...current,
    lifecycleStatus,
    status: lifecycleStatus,
    pilotMode: false,
    lastActivityAt: stamp,
    statusChangedAt: stamp,
    statusChangeReason: reason.trim() || DEFAULT_ARCHIVE_REASON,
    lastAdminAction: 'archive',
    studioAccess: studioAccessForLifecycle(lifecycleStatus),
    updatedAt: stamp,
  });

  updatePartner(partnerId, {
    ...draftFromPartner(partner),
    nextStep: 'Partner archivován — data zachována',
  });

  appendOfficeEvent({
    kind: 'partner.archived',
    label: 'PartnerArchived',
    detail: reason.trim() || DEFAULT_ARCHIVE_REASON,
    partnerId,
  });

  return getPartnerEnvironmentRecord(partnerId);
}

export function touchPartnerEnvironmentActivity(
  partnerId: string,
  atIso = nowIso(),
): PartnerEnvironmentRecord | null {
  if (getPartner(partnerId) === null) return null;
  const current = getPartnerEnvironmentRecord(partnerId);
  return upsert({
    ...current,
    lastActivityAt: atIso,
    updatedAt: atIso,
  });
}

export function buildPartnerWorkspaceSummary(
  partnerId: string,
): PartnerWorkspaceSummary | null {
  const partner = getPartner(partnerId);
  if (partner === null) return null;
  const record = getPartnerEnvironmentRecord(partnerId);
  return {
    partnerId,
    partnerName: partner.name,
    partnerStatus: record.status,
    partnerStatusLabel: partnerEnvironmentStatusLabel(record.status),
    lifecycleStatus: record.lifecycleStatus,
    lifecycleStatusLabel: partnerLifecycleStatusLabel(record.lifecycleStatus),
    licence: record.licenceLabel ?? '—',
    activePackage: record.packageName ?? '—',
    activatedAt: record.activatedAt,
    lastActivityAt: record.lastActivityAt,
    statusChangedAt: record.statusChangedAt,
    statusChangeReason: record.statusChangeReason,
    lastAdminAction: record.lastAdminAction,
    lastAdminActionLabel: partnerAdminActionLabel(record.lastAdminAction),
    studioAccess: record.studioAccess,
  };
}

export function listPartnerWorkspaceSummaries(): readonly PartnerWorkspaceSummary[] {
  return listPartners()
    .map((partner) => buildPartnerWorkspaceSummary(partner.id))
    .filter((item): item is PartnerWorkspaceSummary => item !== null)
    .filter((item) => item.lifecycleStatus !== null);
}

/** Test helper — clears lifecycle store. */
export function resetPartnerEnvironmentLifecycleForTests(): void {
  store = { byPartnerId: {} };
}
