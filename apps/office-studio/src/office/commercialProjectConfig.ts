import {
  applyDurableProjectConfigs,
  platformApiOrigin,
} from '@embed-engine/platform-access';

import type { CommercialPilotProgramId } from './commercialPilotProgramCatalog';

export type CommercialProjectConfig = {
  readonly projectId: string;
  readonly billingNumber: string | null;
  readonly commercialProgramId: string | null;
  readonly commercialProgramSelectedAt: string | null;
};

function baseEndpoint(projectId: string): string {
  return `${platformApiOrigin().replace(/\/$/, '')}/public/projects/${encodeURIComponent(projectId)}/config`;
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
    throw new Error('Platform API returned invalid Project configuration.');
  }

  const value = body as Record<string, unknown>;

  if (typeof value.projectId !== 'string') {
    throw new Error('Platform API returned invalid Project configuration.');
  }

  return {
    projectId: value.projectId,
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

function apply(config: CommercialProjectConfig): void {
  applyDurableProjectConfigs([
    {
      projectId: config.projectId,
      privacyUrl: null,
      billingNumber: config.billingNumber,
      commercialProgramId: config.commercialProgramId,
      commercialProgramSelectedAt:
        config.commercialProgramSelectedAt,
    },
  ]);
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
        commercialProgramId: input.programId,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await responseError(response));
  }

  const config = normalize(await response.json());
  apply(config);
  return config;
}
