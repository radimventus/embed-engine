import { platformApiOrigin } from '@embed-engine/platform-access';

import type { HousePackagePersistFiles } from './buildPersistFiles';

export type PlatformHousePackageState = {
  readonly houseId: string;
  readonly files: HousePackagePersistFiles;
  readonly updatedAt: string;
};

type PlatformHousePackageResponse =
  | { readonly ok: true; readonly houseId: string }
  | { readonly ok: false; readonly error: string };

export type PlatformHousePackageMediaReference = {
  readonly relativePath: string;
  readonly url: string;
};

function endpoint(
  houseId: string,
  action: 'initialize' | 'persist' | 'state',
): string {
  return `${platformApiOrigin().replace(/\/$/, '')}/public/house-packages/${encodeURIComponent(houseId)}/${action}`;
}

export function platformHousePackageMediaUrl(
  houseId: string,
  relativePath: string,
): string {
  const packagePath = relativePath.replace(/^media\//, '');
  const segments = packagePath.split('/').map(encodeURIComponent);
  return `${platformApiOrigin().replace(/\/$/, '')}/public/house-packages/${encodeURIComponent(houseId)}/media/${segments.join('/')}`;
}

async function error(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === 'string') return body.error;
  } catch {
    // Fall through to the HTTP error.
  }
  return `House Package request failed (HTTP ${response.status}).`;
}

export async function requestPlatformHousePackagePersist(
  houseId: string,
  files: HousePackagePersistFiles,
): Promise<PlatformHousePackageResponse> {
  const response = await fetch(endpoint(houseId, 'persist'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ files }),
  });
  if (!response.ok) return { ok: false, error: await error(response) };
  const body = (await response.json()) as { houseId?: unknown };
  return typeof body.houseId === 'string'
    ? { ok: true, houseId: body.houseId }
    : { ok: false, error: 'Platform API returned an invalid House Package response.' };
}

export async function requestPlatformHousePackageMediaUpload(input: {
  readonly houseId: string;
  readonly relativePath: string;
  readonly file: File;
}): Promise<
  | { readonly ok: true; readonly media: PlatformHousePackageMediaReference }
  | { readonly ok: false; readonly error: string }
> {
  const response = await fetch(
    platformHousePackageMediaUrl(input.houseId, input.relativePath),
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': input.file.type || 'application/octet-stream',
      },
      body: input.file,
    },
  );
  if (!response.ok) return { ok: false, error: await error(response) };
  return {
    ok: true,
    media: {
      relativePath: input.relativePath,
      url: platformHousePackageMediaUrl(input.houseId, input.relativePath),
    },
  };
}

export async function requestPlatformHousePackageState(
  houseId: string,
  signal?: AbortSignal,
): Promise<PlatformHousePackageState | null> {
  const response = await fetch(endpoint(houseId, 'state'), {
    credentials: 'include',
    signal,
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(await error(response));
  const body = (await response.json()) as Partial<PlatformHousePackageState>;
  if (
    typeof body.houseId !== 'string' ||
    typeof body.updatedAt !== 'string' ||
    body.files === null ||
    typeof body.files !== 'object'
  ) {
    throw new Error('Platform API returned invalid persisted House Package state.');
  }
  return body as PlatformHousePackageState;
}
