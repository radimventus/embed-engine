/**
 * PT-COM-02 — Portable pilot provision snapshot for cross-device partner entry.
 * Encoded into ?pilot= on the Studio landing URL (salesperson browser → partner device).
 */

import type { PlatformRole } from '../domain/types';
import type {
  PlatformCompany,
  PlatformProject,
  PlatformWorkspace,
} from '../domain/types';
import type { PlatformTenant } from '../domain/pilotTypes';
import {
  appendPilotProvision,
  findCompany,
  getDefaultCompanyRegistry,
} from '../registry/companyRegistry';
import {
  setUserPassword,
  upsertActivatedUser,
} from '../registry/userRegistry';
import { upsertPartnerBranding } from './partnerBrandingStore';
import { initializePilotWorkspace } from './pilotWorkspaceStore';

export const PILOT_PROVISION_QUERY = 'pilot' as const;

export type PilotProvisionSnapshot = {
  readonly v: 1;
  readonly email: string;
  readonly password: string;
  readonly displayName: string;
  readonly userId: string;
  readonly roles: readonly PlatformRole[];
  readonly tenant: PlatformTenant;
  readonly company: PlatformCompany;
  readonly workspace: PlatformWorkspace;
  readonly project: PlatformProject;
  readonly branding: {
    readonly firmName: string;
    readonly logoLabel: string;
    readonly heroLabel: string;
    readonly websiteUrl: string;
  };
  readonly offerSlug: string;
};

export function offerSlugFromCompanyId(companyId: string): string {
  const trimmed = companyId.trim();
  if (trimmed.startsWith('company-')) {
    return trimmed.slice('company-'.length) || trimmed;
  }
  return trimmed;
}

export function buildPilotProvisionSnapshot(input: {
  readonly email: string;
  readonly password: string;
  readonly displayName: string;
  readonly userId: string;
  readonly roles: readonly PlatformRole[];
  readonly tenant: PlatformTenant;
  readonly company: PlatformCompany;
  readonly workspace: PlatformWorkspace;
  readonly project: PlatformProject;
  readonly branding: {
    readonly firmName: string;
    readonly logoLabel: string;
    readonly heroLabel: string;
    readonly websiteUrl: string;
  };
}): PilotProvisionSnapshot {
  return {
    v: 1,
    email: input.email.trim().toLowerCase(),
    password: input.password,
    displayName: input.displayName.trim(),
    userId: input.userId,
    roles: input.roles,
    tenant: input.tenant,
    company: input.company,
    workspace: input.workspace,
    project: input.project,
    branding: input.branding,
    offerSlug: offerSlugFromCompanyId(input.company.id),
  };
}

export function encodePilotProvisionSnapshot(
  snapshot: PilotProvisionSnapshot,
): string {
  const json = JSON.stringify(snapshot);
  if (typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }
  return Buffer.from(json, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function decodePilotProvisionSnapshot(
  encoded: string,
): PilotProvisionSnapshot | null {
  try {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
    const b64 = padded + pad;
    const json =
      typeof atob === 'function'
        ? decodeURIComponent(escape(atob(b64)))
        : Buffer.from(b64, 'base64').toString('utf8');
    const parsed = JSON.parse(json) as PilotProvisionSnapshot;
    if (parsed.v !== 1 || typeof parsed.email !== 'string') return null;
    if (parsed.email.trim().length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Write snapshot into local platform-access stores so login works on this device.
 */
export function hydratePilotProvisionSnapshot(
  snapshot: PilotProvisionSnapshot,
): { readonly ok: true; readonly offerSlug: string } | { readonly ok: false; readonly error: string } {
  const email = snapshot.email.trim().toLowerCase();
  if (email.length === 0) {
    return { ok: false, error: 'Neplatný e-mail v pilotním odkazu.' };
  }

  const registry = getDefaultCompanyRegistry();
  if (findCompany(registry, snapshot.company.id) === undefined) {
    appendPilotProvision({
      tenant: snapshot.tenant,
      company: snapshot.company,
      workspace: snapshot.workspace,
      project: snapshot.project,
    });
  }

  upsertActivatedUser({
    id: snapshot.userId,
    email,
    displayName: snapshot.displayName,
    roles: snapshot.roles,
    password: snapshot.password,
  });
  setUserPassword(email, snapshot.password);

  upsertPartnerBranding({
    companyId: snapshot.company.id,
    firmName: snapshot.branding.firmName,
    logoLabel: snapshot.branding.logoLabel,
    heroLabel: snapshot.branding.heroLabel,
    websiteUrl: snapshot.branding.websiteUrl,
  });

  initializePilotWorkspace({
    tenant: snapshot.tenant,
    company: snapshot.company,
    workspace: snapshot.workspace,
    project: snapshot.project,
  });

  return { ok: true, offerSlug: snapshot.offerSlug };
}

export function readPilotProvisionFromUrl(
  search = typeof window !== 'undefined' ? window.location.search : '',
): PilotProvisionSnapshot | null {
  const raw = new URLSearchParams(search).get(PILOT_PROVISION_QUERY);
  if (raw === null || raw.trim().length === 0) return null;
  return decodePilotProvisionSnapshot(raw.trim());
}
