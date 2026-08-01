/**
 * EPIC-BX-15 — Cloud Platform bootstrap for https://app.conis.cz
 * Local Vite ports remain for development; cloud uses path-based studio URLs.
 */

import type { PlatformStudioId } from '../domain/types';

export const CLOUD_PLATFORM_ORIGIN = 'https://app.conis.cz';

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

export function getCloudPlatformConfig(): CloudPlatformConfig {
  const envOrigin = readEnvOrigin();
  if (envOrigin !== null) {
    const isLocal =
      envOrigin.includes('127.0.0.1') || envOrigin.includes('localhost');
    return {
      mode: isLocal ? 'local' : 'cloud',
      origin: envOrigin,
      appHost: 'app.conis.cz',
    };
  }

  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    if (hostname === '127.0.0.1' || hostname === 'localhost') {
      return {
        mode: 'local',
        origin: `http://${hostname}`,
        appHost: 'app.conis.cz',
      };
    }
    return {
      mode: 'cloud',
      origin: origin.replace(/\/$/, ''),
      appHost: 'app.conis.cz',
    };
  }

  return {
    mode: 'local',
    origin: 'http://127.0.0.1',
    appHost: 'app.conis.cz',
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
