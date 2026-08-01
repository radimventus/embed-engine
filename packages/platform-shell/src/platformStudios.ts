/**
 * EPIC-BX-11 / BX-15 / RC-002 — Platform Studio registry.
 * Local Vite ports for development; path-based URLs on https://studio.conis.cz.
 */

export type PlatformStudioId = 'builder' | 'manager' | 'sales';

export type PlatformStudio = {
  readonly id: PlatformStudioId;
  readonly label: string;
  readonly shortLabel: string;
  /** Absolute studio URL, or null when Studio is not yet available. */
  readonly href: string | null;
  readonly available: boolean;
  readonly accent: string;
};

/** Canonical working-platform origin (marketing site stays on conis.cz). */
export const CLOUD_PLATFORM_ORIGIN = 'https://studio.conis.cz';

const LOCAL_PORTS: Record<PlatformStudioId, number> = {
  builder: 4177,
  manager: 4175,
  sales: 4179,
};

const CLOUD_PATHS: Record<PlatformStudioId, string> = {
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

export function resolvePlatformStudioHref(studioId: PlatformStudioId): string {
  const envOrigin = readEnvOrigin();
  if (envOrigin !== null) {
    const local =
      envOrigin.includes('127.0.0.1') || envOrigin.includes('localhost');
    if (local) {
      let host = '127.0.0.1';
      try {
        host = new URL(envOrigin).hostname;
      } catch {
        // keep default
      }
      return `http://${host}:${LOCAL_PORTS[studioId]}/`;
    }
    return `${CLOUD_PLATFORM_ORIGIN}${CLOUD_PATHS[studioId]}`;
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (isLocalHost(hostname)) {
      return `http://${hostname}:${LOCAL_PORTS[studioId]}/`;
    }
    return `${CLOUD_PLATFORM_ORIGIN}${CLOUD_PATHS[studioId]}`;
  }

  return `http://127.0.0.1:${LOCAL_PORTS[studioId]}/`;
}

const STUDIO_DEFS: readonly Omit<PlatformStudio, 'href'>[] = [
  {
    id: 'manager',
    label: 'Manager Studio',
    shortLabel: 'Manager',
    available: true,
    accent: '#18428F',
  },
  {
    id: 'sales',
    label: 'Sales Studio',
    shortLabel: 'Sales',
    available: true,
    accent: '#18428F',
  },
  {
    id: 'builder',
    label: 'Builder Studio',
    shortLabel: 'Builder',
    available: true,
    accent: '#18428F',
  },
] as const;

function buildStudios(): readonly PlatformStudio[] {
  return STUDIO_DEFS.map((studio) => ({
    ...studio,
    href: studio.available ? resolvePlatformStudioHref(studio.id) : null,
  }));
}

/** Resolved at module load (Node tests → local ports). */
export const PLATFORM_STUDIOS: readonly PlatformStudio[] = buildStudios();

export function getPlatformStudio(id: PlatformStudioId): PlatformStudio {
  const live = buildStudios().find((studio) => studio.id === id);
  return live ?? PLATFORM_STUDIOS[0];
}
