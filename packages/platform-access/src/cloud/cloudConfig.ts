/**
 * EPIC-BX-15 / RC-002 / W-01A — Cloud Platform bootstrap for https://conis.cz/studio
 * Local Vite ports remain for development; cloud uses path-based studio URLs.
 */

import type { PlatformStudioId } from '../domain/types';

/** Site origin that hosts CONIS Studio under /studio/* (GitHub Pages single custom domain). */
export const CLOUD_PLATFORM_ORIGIN = 'https://conis.cz';

/** Public display host path for CONIS Studio (not a separate subdomain). */
export const CLOUD_APP_HOST = 'conis.cz/studio';

/** Canonical Studio entry (login / role redirect landing). */
export const CLOUD_STUDIO_ENTRY_PATH = '/studio/';

export type PlatformDeployMode = 'local' | 'cloud';

export type CloudPlatformConfig = {
  readonly mode: PlatformDeployMode;
  readonly origin: string;
  readonly appHost: string;
};

const LOCAL_STUDIO_PORTS: Record<PlatformStudioId, number> = {
  client: 4173,
  office: 4181,
  builder: 4177,
  manager: 4175,
  sales: 4179,
};

/** CS-01 — Client Studio (Experience host) local Vite port. */
const LOCAL_CLIENT_STUDIO_PORT = LOCAL_STUDIO_PORTS.client;

/** PT-CJ-01 — Offer Experience (pilot program selection) local Vite port. */
const LOCAL_OFFER_EXPERIENCE_PORT = 4192;

/** TASK-44C1 — Public CONIS website development host. */
const LOCAL_PUBLIC_WEB_PORT = 4190;

/** ARCH-01 — CONIS Workspace Host (operator entry; not partner Embed Host). */
const LOCAL_WORKSPACE_HOST_PORT = 4183;

const CLOUD_STUDIO_PATHS: Record<PlatformStudioId, string> = {
  client: '/embed/',
  office: '/studio/office/',
  builder: '/studio/builder/',
  manager: '/studio/manager/',
  sales: '/studio/sales/',
};
const CLOUD_WORKSPACE_HOST_PATH = '/studio/workspace/' as const;
const CLOUD_OFFER_EXPERIENCE_PATH = '/offer/' as const;

function readEnvOrigin(): string | null {
  try {
    const meta = import.meta as { env?: Record<string, string | undefined> };
    const fromVite = meta.env?.VITE_PLATFORM_ORIGIN?.trim();
    if (fromVite !== undefined && fromVite.length > 0) {
      return fromVite.replace(/\/$/, '');
    }
  } catch {
    // non-Vite host
  }
  return null;
}

function isLocalHost(hostname: string): boolean {
  return hostname === '127.0.0.1' || hostname === 'localhost';
}

function isSameSiteLocalDevelopment(location: Location): boolean {
  return (
    location.hostname === 'conis.cz' &&
    location.protocol === 'https:' &&
    [...Object.values(LOCAL_STUDIO_PORTS), LOCAL_WORKSPACE_HOST_PORT].includes(
      Number(location.port),
    )
  );
}

function localStudioOrigin(port: number): string {
  const host =
    typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
  const protocol =
    typeof window !== 'undefined' && window.location.protocol === 'https:'
      ? 'https:'
      : 'http:';
  return `${protocol}//${host}:${port}`;
}

function localStudioPort(studioId: PlatformStudioId): number {
  if (studioId !== 'office') return LOCAL_STUDIO_PORTS[studioId];
  try {
    const configured = Number.parseInt(
      (import.meta as { env?: Record<string, string | undefined> })
        .env?.VITE_LOCAL_OFFICE_STUDIO_PORT ?? '',
      10,
    );
    if (Number.isInteger(configured) && configured > 0 && configured <= 65_535) {
      return configured;
    }
  } catch {
    // Non-Vite hosts use the default Office port.
  }
  return LOCAL_STUDIO_PORTS.office;
}

export function getCloudPlatformConfig(): CloudPlatformConfig {
  const envOrigin = readEnvOrigin();
  if (envOrigin !== null) {
    const isLocal =
      envOrigin.includes('127.0.0.1') || envOrigin.includes('localhost');
    return {
      mode: isLocal ? 'local' : 'cloud',
      origin: isLocal ? envOrigin : CLOUD_PLATFORM_ORIGIN,
      appHost: CLOUD_APP_HOST,
    };
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (isLocalHost(hostname) || isSameSiteLocalDevelopment(window.location)) {
      return {
        mode: 'local',
        origin: `${window.location.protocol}//${hostname}`,
        appHost: CLOUD_APP_HOST,
      };
    }
    return {
      mode: 'cloud',
      origin: CLOUD_PLATFORM_ORIGIN,
      appHost: CLOUD_APP_HOST,
    };
  }

  return {
    mode: 'local',
    origin: 'http://127.0.0.1',
    appHost: CLOUD_APP_HOST,
  };
}

export function resolveCloudStudioHref(studioId: PlatformStudioId): string {
  if (studioId === 'client') {
    return resolveWorkspaceHostHref();
  }

  const config = getCloudPlatformConfig();
  if (config.mode === 'local') {
    return `${localStudioOrigin(localStudioPort(studioId))}/`;
  }
  return `${config.origin}${CLOUD_STUDIO_PATHS[studioId]}`;
}

export function resolveCloudLandingHref(): string {
  const config = getCloudPlatformConfig();
  if (config.mode === 'local') {
    return `${localStudioOrigin(4177)}/`;
  }
  return `${config.origin}${CLOUD_STUDIO_ENTRY_PATH}`;
}

/**
 * CS-01 / PT-DATA-02 — Partner entry into Client Studio / Embed Experience.
 * Pass Shared Project `projectId` so Client binds the same Projekt as Office / CJ.
 */
export function resolveClientStudioHref(projectId?: string | null): string {
  const config = getCloudPlatformConfig();
  let base: string;
  if (config.mode === 'local') {
    base = `${localStudioOrigin(LOCAL_CLIENT_STUDIO_PORT)}/`;
  } else {
    base = `${config.origin}${CLOUD_STUDIO_PATHS.client}`;
  }
  return withOptionalProjectId(base, projectId);
}

/**
 * PT-OS-01 / VR10 — Builder Studio entry for the Shared Project open in Office.
 * Opens editor terminal; Office remains the salesperson home surface.
 */
export function resolveBuilderStudioHref(projectId?: string | null): string {
  return withOptionalProjectId(resolveCloudStudioHref('builder'), projectId);
}

function withOptionalProjectId(baseHref: string, projectId?: string | null): string {
  const id = projectId?.trim() ?? '';
  if (id.length === 0) return baseHref;
  const normalized = baseHref.endsWith('/') ? baseHref : `${baseHref}/`;
  return `${normalized}?projectId=${encodeURIComponent(id)}`;
}

/**
 * PT-CJ-01 / PT-COM-02 — Pilot program selection (Offer Experience).
 * Pass partner offerSlug so Welcome opens that firm's offer — never a seed default.
 */
export function resolvePilotOfferHref(offerSlug?: string, writeToken?: string): string {
  const slug = offerSlug?.trim().toLowerCase() ?? '';
  const config = getCloudPlatformConfig();
  if (config.mode === 'local') {
    const base = localStudioOrigin(LOCAL_OFFER_EXPERIENCE_PORT);
    const href = slug.length === 0 ? `${base}/` : `${base}/${encodeURIComponent(slug)}`;
    return writeToken === undefined ? href : `${href}?write=${encodeURIComponent(writeToken)}`;
  }
  if (slug.length === 0) {
    const href = `${config.origin}${CLOUD_OFFER_EXPERIENCE_PATH}`;
    return writeToken === undefined ? href : `${href}?write=${encodeURIComponent(writeToken)}`;
  }
  const href = `${config.origin}${CLOUD_OFFER_EXPERIENCE_PATH}${encodeURIComponent(slug)}/`;
  return writeToken === undefined ? href : `${href}?write=${encodeURIComponent(writeToken)}`;
}

/** Canonical public legal document URL, resolved against the public web host. */
export function resolvePublicLegalHref(fileName: string): string {
  const file = fileName.replace(/^\/+/, '');
  const config = getCloudPlatformConfig();
  if (config.mode === 'local') {
    return `${localStudioOrigin(LOCAL_PUBLIC_WEB_PORT)}/legal/${file}`;
  }
  return `${config.origin}/legal/${file}`;
}

/**
 * PT-COM-02 — Partner Studio landing with portable provision hydrate (?pilot=).
 */
export function resolvePilotEntryHref(pilotPayloadEncoded: string): string {
  const payload = pilotPayloadEncoded.trim();
  const base = resolveCloudLandingHref().replace(/\/?$/, '/');
  if (payload.length === 0) return base;
  return `${base}?pilot=${encodeURIComponent(payload)}`;
}

/**
 * ARCH-01 — CONIS operator Workspace Host.
 * Not the partner Embed Host — opens Workspace with Client Studio as default.
 */
export function resolveWorkspaceHostHref(): string {
  const config = getCloudPlatformConfig();
  if (config.mode === 'local') {
    return `${localStudioOrigin(LOCAL_WORKSPACE_HOST_PORT)}/`;
  }
  return `${config.origin}${CLOUD_WORKSPACE_HOST_PATH}`;
}

/**
 * PE-07 — Partner Workspace invite deep-link (opens InviteShell via ?invite=).
 * Uses Manager Studio host — partner surface, not Builder/Office.
 */
export function resolvePartnerInviteHref(inviteToken: string): string {
  const token = inviteToken.trim();
  const base = resolveCloudStudioHref('manager').replace(/\/?$/, '/');
  if (token.length === 0) return base;
  return `${base}?invite=${encodeURIComponent(token)}`;
}
