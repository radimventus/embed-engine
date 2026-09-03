import {
  applyDurableProjectConfig,
  platformApiOrigin,
} from '@embed-engine/platform-access';

import type { CommercialPilotProgramId } from './commercialPilotProgramCatalog';

export type CommercialProjectConfig = {
  readonly projectId: string;
  readonly privacyUrl: string | null;
  readonly logoUrl: string | null;
  readonly billingNumber: string | null;
  readonly commercialProgramId: string | null;
  readonly commercialProgramSelectedAt: string | null;
};

function apiOrigin(): string {
  return platformApiOrigin().replace(/\/$/, '');
}

function baseEndpoint(projectId: string): string {
  return `${apiOrigin()}/public/projects/${encodeURIComponent(projectId)}/config`;
}

function normalizeProjectLogoUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const normalized = value.trim();
  if (normalized.length === 0) return null;

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  return normalized.startsWith('/')
    ? `${apiOrigin()}${normalized}`
    : `${apiOrigin()}/${normalized}`;
}

async function responseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === 'string') return body.error;
  } catch {
    // Fall through.
  }

  return `Project commercial configuration request failed (HTTP ${response.status}).`;
}

function normalize(body: unknown): CommercialProjectConfig {
  if (
    body === null ||
    typeof body !== 'object' ||
    Array.isArray(body)
  ) {
    throw new Error(
      'Platform API returned invalid Project configuration.',
    );
  }

  const value = body as Record<string, unknown>;

  if (typeof value.projectId !== 'string') {
    throw new Error(
      'Platform API returned invalid Project configuration.',
    );
  }

  return {
    projectId: value.projectId,
    privacyUrl:
      typeof value.privacyUrl === 'string'
        ? value.privacyUrl
        : null,
    logoUrl: normalizeProjectLogoUrl(value.logoUrl),
    billingNumber:
      typeof value.billingNumber === 'string'
        ? value.billingNumber
        : null,
    commercialProgramId:
      typeof value.commercialProgramId === 'string'
        ? value.commercialProgramId
        : null,
    commercialProgramSelectedAt:
      typeof value.commercialProgramSelectedAt === 'string'
        ? value.commercialProgramSelectedAt
        : null,
  };
}

async function fetchProjectConfig(
  projectId: string,
): Promise<CommercialProjectConfig> {
  const response = await fetch(
    baseEndpoint(projectId),
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error(await responseError(response));
  }

  return normalize(await response.json());
}

export async function hydrateCommercialProjectConfig(
  projectId: string,
): Promise<CommercialProjectConfig> {
  const config = await fetchProjectConfig(projectId);

  applyDurableProjectConfig({
    projectId: config.projectId,
    privacyUrl: config.privacyUrl,
    logoUrl: config.logoUrl,
    billingNumber: config.billingNumber,
    commercialProgramId:
      config.commercialProgramId,
    commercialProgramSelectedAt:
      config.commercialProgramSelectedAt,
  });

  return config;
}

export async function selectCommercialProjectProgram(input: {
  readonly projectId: string;
  readonly programId: CommercialPilotProgramId;
}): Promise<CommercialProjectConfig> {
  const response = await fetch(
    `${baseEndpoint(input.projectId)}/commercial-selection`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        programId: input.programId,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await responseError(response));
  }

  // POST intentionally confirms the mutation only.
  // Hydrate the complete canonical Project configuration afterwards,
  // so billing/privacy authority cannot be lost by a partial response.
  const config =
    await fetchProjectConfig(input.projectId);

  applyDurableProjectConfig({
    projectId: config.projectId,
    privacyUrl: config.privacyUrl,
    logoUrl: config.logoUrl,
    billingNumber: config.billingNumber,
    commercialProgramId:
      config.commercialProgramId,
    commercialProgramSelectedAt:
      config.commercialProgramSelectedAt,
  });

  return config;
}
