import { platformApiOrigin } from '@embed-engine/platform-access';

import type { BuilderPackageDurableOverlay } from './builderPackageBootstrap';

type DurableHousePackageState = {
  readonly houseId: string;
  readonly files: {
    readonly roomsCsv?: unknown;
    readonly galleryCsv?: unknown;
    readonly videosCsv?: unknown;
    readonly manifestJson?: unknown;
  };
  readonly updatedAt: string;
};

function endpoint(houseId: string): string {
  const baseUrl = platformApiOrigin().replace(/\/$/, '');
  return `${baseUrl}/public/house-packages/${encodeURIComponent(houseId)}`;
}

function isDurableHousePackageState(
  value: unknown,
): value is DurableHousePackageState {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const state = value as Partial<DurableHousePackageState>;
  return (
    typeof state.houseId === 'string' &&
    typeof state.updatedAt === 'string' &&
    state.files !== null &&
    typeof state.files === 'object'
  );
}

/**
 * Reads authenticated VPD persistence without making durable state mandatory.
 * A missing/unauthenticated state deliberately leaves the seeded package intact.
 */
export async function loadDurableHousePackageOverlay(
  houseId: string,
  signal?: AbortSignal,
): Promise<BuilderPackageDurableOverlay | null> {
  const response = await fetch(`${endpoint(houseId)}/state`, {
    credentials: 'include',
    signal,
  });
  if (response.status === 401 || response.status === 403 || response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(
      `Platform API House Package state failed (HTTP ${response.status}).`,
    );
  }

  const body: unknown = await response.json();
  if (!isDurableHousePackageState(body) || body.houseId !== houseId) {
    throw new Error('Platform API returned invalid persisted House Package state.');
  }

  const files = {
    ...(typeof body.files.roomsCsv === 'string'
      ? { roomsCsv: body.files.roomsCsv }
      : {}),
    ...(typeof body.files.galleryCsv === 'string'
      ? { galleryCsv: body.files.galleryCsv }
      : {}),
    ...(typeof body.files.videosCsv === 'string'
      ? { videosCsv: body.files.videosCsv }
      : {}),
    ...(typeof body.files.manifestJson === 'string' ||
    body.files.manifestJson === null
      ? { manifestJson: body.files.manifestJson }
      : {}),
  };
  if (Object.keys(files).length === 0) {
    return null;
  }

  return {
    files,
    mediaPublicRoot: `${endpoint(houseId)}/media`,
  };
}
