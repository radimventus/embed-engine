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
  office: 4181,
  builder: 4177,
  manager: 4175,
  sales: 4179,
};

/** CS-01 — Client Studio (Experience host) local Vite port. */
const LOCAL_CLIENT_STUDIO_PORT = 4173;

const CLOUD_STUDIO_PATHS: Record<PlatformStudioId, string> = {
  office: '/studio/office/',
  builder: '/studio/builder/',
  manager: '/studio/manager/',
  sales: '/studio/sales/',
};

const CLOUD_CLIENT_STUDIO_PATH = '/embed/' as const;

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
    if (isLocalHost(hostname)) {
      return {
        mode: 'local',
        origin: `http://${hostname}`,
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
  const config = getCloudPlatformConfig();
  if (config.mode === 'local') {
    const port = LOCAL_STUDIO_PORTS[studioId];
    const host =
      typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
    return `http://${host}:${port}/`;
  }
  return `${config.origin}${CLOUD_STUDIO_PATHS[studioId]}`;
}

export function resolveCloudLandingHref(): string {
  const config = getCloudPlatformConfig();
  if (config.mode === 'local') {
    const host =
      typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
    return `http://${host}:4177/`;
  }
  return `${config.origin}${CLOUD_STUDIO_ENTRY_PATH}`;
}

/** CS-01 — Partner entry into Client Studio / Embed Experience (not Builder/Office). */
export function resolveClientStudioHref(): string {
  const config = getCloudPlatformConfig();
  if (config.mode === 'local') {
    const host =
      typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
    return `http://${host}:${LOCAL_CLIENT_STUDIO_PORT}/`;
  }
  return `${config.origin}${CLOUD_CLIENT_STUDIO_PATH}`;
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
