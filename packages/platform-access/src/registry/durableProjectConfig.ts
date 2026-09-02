export type DurableProjectConfigOverlay = {
  readonly projectId: string;
  readonly privacyUrl: string | null;
  readonly billingNumber?: string | null;
  readonly commercialProgramId?: string | null;
  readonly commercialProgramSelectedAt?: string | null;
};

type DurableProjectProjection = {
  readonly privacyUrl: string | null;
  readonly billingNumber: string | null;
  readonly commercialProgramId: string | null;
  readonly commercialProgramSelectedAt: string | null;
};

const overlayByProjectId =
  new Map<
    string,
    DurableProjectProjection
  >();

export function applyDurableProjectConfigs(
  configs: readonly DurableProjectConfigOverlay[],
): void {
  overlayByProjectId.clear();
  for (const config of configs) {
    const projectId = config.projectId.trim();
    if (projectId.length === 0) continue;
    overlayByProjectId.set(
      projectId,
      {
        privacyUrl:
          config.privacyUrl,
        billingNumber:
          typeof config.billingNumber === 'string' &&
          /^\d{5}$/.test(config.billingNumber)
            ? config.billingNumber
            : null,
        commercialProgramId:
          typeof config.commercialProgramId === 'string' &&
          config.commercialProgramId.trim().length > 0
            ? config.commercialProgramId.trim()
            : null,
        commercialProgramSelectedAt:
          typeof config.commercialProgramSelectedAt === 'string' &&
          config.commercialProgramSelectedAt.trim().length > 0
            ? config.commercialProgramSelectedAt.trim()
            : null,
      },
    );
  }
}

export function applyDurableProjectConfig(
  config: DurableProjectConfigOverlay,
): void {
  const projectId = config.projectId.trim();

  if (projectId.length === 0) {
    return;
  }

  overlayByProjectId.set(
    projectId,
    {
      privacyUrl:
        config.privacyUrl,
      billingNumber:
        typeof config.billingNumber === 'string' &&
        /^\d{5}$/.test(config.billingNumber)
          ? config.billingNumber
          : null,
      commercialProgramId:
        typeof config.commercialProgramId === 'string' &&
        config.commercialProgramId.trim().length > 0
          ? config.commercialProgramId.trim()
          : null,
      commercialProgramSelectedAt:
        typeof config.commercialProgramSelectedAt === 'string' &&
        config.commercialProgramSelectedAt.trim().length > 0
          ? config.commercialProgramSelectedAt.trim()
          : null,
    },
  );
}

export function resetDurableProjectConfigs(): void {
  overlayByProjectId.clear();
}

export function durableProjectPrivacyUrl(
  projectId: string,
): string | undefined {
  const overlay =
    overlayByProjectId.get(
      projectId,
    );

  const value =
    overlay?.privacyUrl;

  if (
    value === undefined ||
    value === null ||
    value.length === 0
  ) {
    return undefined;
  }

  return value;
}

export function durableProjectBillingNumber(
  projectId: string,
): string | undefined {
  const value =
    overlayByProjectId.get(
      projectId,
    )?.billingNumber;

  return value === null ||
    value === undefined
    ? undefined
    : value;
}


export function durableProjectCommercialProgramId(
  projectId: string,
): string | undefined {
  const value =
    overlayByProjectId.get(
      projectId,
    )?.commercialProgramId;

  return value === null ||
    value === undefined
    ? undefined
    : value;
}

export function durableProjectCommercialProgramSelectedAt(
  projectId: string,
): string | undefined {
  const value =
    overlayByProjectId.get(
      projectId,
    )?.commercialProgramSelectedAt;

  return value === null ||
    value === undefined
    ? undefined
    : value;
}
