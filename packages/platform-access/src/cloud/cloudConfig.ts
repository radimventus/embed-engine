/**
 * EPIC-BX-15 / RC-002 — Cloud Platform bootstrap for https://studio.conis.cz
 * Local Vite ports remain for development; cloud uses path-based studio URLs.
 */

import type { PlatformStudioId } from '../domain/types';

/** Canonical working-platform origin (not the public marketing site). */
export const CLOUD_PLATFORM_ORIGIN = 'https://studio.conis.cz';

export const CLOUD_APP_HOST = 'studio.conis.cz';

export type PlatformDeployMode = 'local' | 'cloud';

export type CloudPlatformConfig = {
  readonly mode: PlatformDeployMode;
  readonly origin: string;
  readonly appHost: string;
};

const LOCAL_STUDIO_PORTS: Record<PlatformStudioId, number> = {
  builder: 4177,
  manager: 4175,
  sales: 4179,
};

const CLOUD_STUDIO_PATHS: Record<PlatformStudioId, string> = {
  builder: '/builder/',
  manager: '/manager/',
  sales: '/sales/',
};

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
  return `${config.origin}/`;
}
