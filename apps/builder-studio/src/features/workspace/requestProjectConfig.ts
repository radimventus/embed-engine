import { platformApiOrigin } from '@embed-engine/platform-access';

export type ProjectPrivacyConfig = {
  readonly projectId: string;
  readonly privacyUrl: string | null;
};

function endpoint(projectId: string): string {
  return `${platformApiOrigin().replace(/\/$/, '')}/public/projects/${encodeURIComponent(projectId)}/config`;
}

async function error(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === 'string') return body.error;
  } catch {
    // Fall through to the HTTP error.
  }
  return `Project configuration request failed (HTTP ${response.status}).`;
}

export async function requestProjectConfig(
  projectId: string,
  signal?: AbortSignal,
): Promise<ProjectPrivacyConfig> {
  const response = await fetch(endpoint(projectId), { signal });
  if (!response.ok) throw new Error(await error(response));
  const body = (await response.json()) as Partial<ProjectPrivacyConfig>;
  if (typeof body.projectId !== 'string') {
    throw new Error('Platform API returned invalid Project configuration.');
  }
  return {
    projectId: body.projectId,
    privacyUrl: typeof body.privacyUrl === 'string' ? body.privacyUrl : null,
  };
}

export async function saveProjectConfig(input: {
  readonly projectId: string;
  readonly privacyUrl: string | null;
}): Promise<ProjectPrivacyConfig> {
  const response = await fetch(endpoint(input.projectId), {
    method: 'PUT',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ privacyUrl: input.privacyUrl }),
  });
  if (!response.ok) throw new Error(await error(response));
  const body = (await response.json()) as Partial<ProjectPrivacyConfig>;
  if (typeof body.projectId !== 'string') {
    throw new Error('Platform API returned invalid Project configuration.');
  }
  return {
    projectId: body.projectId,
    privacyUrl: typeof body.privacyUrl === 'string' ? body.privacyUrl : null,
  };
}
