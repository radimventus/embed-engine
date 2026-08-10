/**
 * PT-COM-02 — Portable pilot provision snapshot for cross-device partner entry.
 * Encoded into ?pilot= on the Studio landing URL (salesperson browser → partner device).
 */

import type { PlatformRole } from '../domain/types';
import type {
  PlatformCompany,
  PlatformCanonicalProject,
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
  readonly project: PlatformCanonicalProject;
  /** Optional for v1 links issued before canonical House scope was added. */
  readonly houses?: readonly PlatformProject[];
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
  readonly project: PlatformCanonicalProject;
  readonly houses: readonly PlatformProject[];
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
    houses: input.houses,
    branding: input.branding,
    offerSlug: offerSlugFromCompanyId(input.company.id),
  };
}

export function encodePilotProvisionSnapshot(
  snapshot: PilotProvisionSnapshot,
): string {
  const json = JSON.stringify(snapshot);
  const base64 =
    typeof btoa === 'function'
      ? btoa(unescape(encodeURIComponent(json)))
      : encodeBase64Node(json);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
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
        : decodeBase64Node(b64);
    const parsed = JSON.parse(json) as PilotProvisionSnapshot;
    if (parsed.v !== 1 || typeof parsed.email !== 'string') return null;
    if (parsed.email.trim().length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function encodeBase64Node(json: string): string {
  const nodeBuffer = (
    globalThis as {
      Buffer?: {
        from: (value: string, encoding: string) => { toString: (enc: string) => string };
      };
    }
  ).Buffer;
  if (nodeBuffer === undefined) {
    throw new Error('Base64 encode is unavailable in this environment.');
  }
  return nodeBuffer.from(json, 'utf8').toString('base64');
}

function decodeBase64Node(b64: string): string {
  const nodeBuffer = (
    globalThis as {
      Buffer?: {
        from: (value: string, encoding: string) => { toString: (enc: string) => string };
      };
    }
  ).Buffer;
  if (nodeBuffer === undefined) {
    throw new Error('Base64 decode is unavailable in this environment.');
  }
  return nodeBuffer.from(b64, 'base64').toString('utf8');
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
  const houses = Array.isArray(snapshot.houses) ? snapshot.houses : [];
  if (findCompany(registry, snapshot.company.id) === undefined) {
    appendPilotProvision({
      tenant: snapshot.tenant,
      company: snapshot.company,
      workspace: snapshot.workspace,
      project: houses[0],
      canonicalProject: snapshot.project,
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
    houses,
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
