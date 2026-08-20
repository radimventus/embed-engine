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

function validPrivacyUrl(value: string | undefined): value is string {
  if (value === undefined) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
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
  const company = findCompany(getDefaultCompanyRegistry(), input.companyId);
  const project = getCanonicalProject(input.projectId);
  const house = listCanonicalHouses(input.projectId).find(
    (item) => item.house?.houseId === input.houseId,
  );
  if (
    company === undefined ||
    project === null ||
    project.partner.companyId !== company.id ||
    house === undefined ||
    house.project.projectId !== project.project.projectId ||
    !validPrivacyUrl(project.project.privacyUrl)
  ) {
    throw new Error('Invalid lead scope or missing partner privacy configuration.');
  }
  return {
    companyId: company.id,
    projectId: project.project.projectId,
    houseId: house.house!.houseId,
    privacyUrl: project.project.privacyUrl,
  };
}
