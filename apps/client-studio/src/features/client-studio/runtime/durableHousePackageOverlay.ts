import { parseCsv } from '@embed-engine/object-house/builder-package';
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

function mediaEndpoint(houseId: string, mediaPath: string): string {
  const packagePath = mediaPath.replace(/^media\//, '');
  const encodedPath = packagePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${endpoint(houseId)}/media/${encodedPath}`;
}

function galleryMediaPaths(galleryCsv: string | undefined): readonly string[] {
  if (galleryCsv === undefined) {
    return [];
  }
  return parseCsv(galleryCsv).rows.flatMap((row) => {
    const file = row.file?.trim() ?? '';
    return file.length === 0 || file.includes('/')
      ? []
      : [`media/gallery/${file}`];
  });
}

async function readAuthenticatedImageUrl(
  url: string,
  signal: AbortSignal | undefined,
): Promise<string> {
  const response = await fetch(url, {
    credentials: 'include',
    signal,
  });
  const contentType = response.headers.get('content-type') ?? '';
  if (!response.ok || !contentType.toLowerCase().startsWith('image/')) {
    return url;
  }
  return URL.createObjectURL(await response.blob());
}

async function materializeAuthenticatedGalleryMedia(input: {
  readonly houseId: string;
  readonly galleryCsv: string | undefined;
  readonly signal: AbortSignal | undefined;
}): Promise<Readonly<Record<string, string>>> {
  const paths = galleryMediaPaths(input.galleryCsv);
  const materialized = await Promise.all(
    paths.map(async (path) => [
      path,
      await readAuthenticatedImageUrl(
        mediaEndpoint(input.houseId, path),
        input.signal,
      ),
    ] as const),
  );
  return Object.freeze(Object.fromEntries(materialized));
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
 * Image bytes are materialized via credentialed Fetch so native `<img>` never
 * needs to satisfy the Platform API's cross-origin authentication contract.
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

  const mediaUrls = await materializeAuthenticatedGalleryMedia({
    houseId,
    galleryCsv: files.galleryCsv,
    signal,
  });

  return {
    files,
    ...(Object.keys(mediaUrls).length > 0 ? { mediaUrls } : {}),
  };
}
