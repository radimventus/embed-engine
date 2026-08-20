import {
  findCompany,
  getDefaultCompanyRegistry,
  getCanonicalProject,
  listCanonicalHouses,
} from '@embed-engine/platform-access';

export type ResolvedLeadScope = {
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
  readonly privacyUrl: string;
};

export type ResolvedPublicHouseScope = {
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
};

function validPrivacyUrl(value: string | undefined): value is string {
  if (value === undefined) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Company / Project / House ownership without requiring partner privacy URL.
 * Used by public Decision Session persistence.
 */
export function resolvePublicHouseScope(input: {
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
}): ResolvedPublicHouseScope {
  const company = findCompany(getDefaultCompanyRegistry(), input.companyId);
  const project = getCanonicalProject(input.projectId);
  if (
    company === undefined ||
    project === null ||
    project.partner.companyId !== company.id
  ) {
    throw new Error('Invalid public house scope.');
  }

  const publishedHouse = listCanonicalHouses(input.projectId).find(
    (item) => item.house?.houseId === input.houseId,
  );
  if (
    publishedHouse !== undefined &&
    publishedHouse.project.projectId === project.project.projectId
  ) {
    return {
      companyId: company.id,
      projectId: project.project.projectId,
      houseId: publishedHouse.house!.houseId,
    };
  }

  const registryHouse = getDefaultCompanyRegistry().projects.find(
    (item) =>
      item.id === input.houseId &&
      item.companyId === company.id &&
      item.canonicalProjectId === project.project.projectId,
  );
  if (registryHouse === undefined) {
    throw new Error('Invalid public house scope.');
  }
  return {
    companyId: company.id,
    projectId: project.project.projectId,
    houseId: registryHouse.id,
  };
}

/**
 * Server-side authoritative relationship resolver for public lead scope.
 * Browser ids are accepted only after registry ownership validation.
 * privacyUrl is supplied by the resolved Project, never by Company.
 */
export function resolveLeadScope(input: {
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
}): ResolvedLeadScope {
  const scope = resolvePublicHouseScope(input);
  const project = getCanonicalProject(scope.projectId);
  if (project === null || !validPrivacyUrl(project.project.privacyUrl)) {
    throw new Error('Invalid lead scope or missing partner privacy configuration.');
  }
  return {
    ...scope,
    privacyUrl: project.project.privacyUrl,
  };
}
