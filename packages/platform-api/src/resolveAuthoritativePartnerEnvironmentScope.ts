import type {
  AuthoritativePartnerEnvironmentScope,
} from '@embed-engine/platform-access';

import type { OfficePartnerRepository } from './officePartnerRepository';

export async function resolveAuthoritativePartnerEnvironmentScope(
  partnerId: string,
  officePartners: OfficePartnerRepository,
): Promise<AuthoritativePartnerEnvironmentScope | null> {
  const normalizedPartnerId = partnerId.trim();
  if (normalizedPartnerId.length === 0) return null;

  const partner = await officePartners.get(normalizedPartnerId);
  if (partner === null || partner.partnerEnvironmentScope === null) {
    return null;
  }

  return {
    partnerId: partner.id,
    ...partner.partnerEnvironmentScope,
  };
}

export async function resolveAuthoritativePartnerEnvironmentScopeByProject(
  projectId: string,
  officePartners: OfficePartnerRepository,
): Promise<AuthoritativePartnerEnvironmentScope | null> {
  const normalizedProjectId = projectId.trim();
  if (normalizedProjectId.length === 0) return null;

  const partners = await officePartners.list();
  const matches = partners.filter(
    (partner) =>
      partner.partnerEnvironmentScope?.projectId === normalizedProjectId,
  );

  if (matches.length !== 1) return null;

  const partner = matches[0]!;
  if (partner.partnerEnvironmentScope === null) return null;

  return {
    partnerId: partner.id,
    ...partner.partnerEnvironmentScope,
  };
}

export type PartnerEnvironmentScopeResolver = {
  (
    partnerId: string,
  ): Promise<AuthoritativePartnerEnvironmentScope | null>;
  byProject(
    projectId: string,
  ): Promise<AuthoritativePartnerEnvironmentScope | null>;
};

export function createPartnerEnvironmentScopeResolver(
  officePartners: OfficePartnerRepository,
): PartnerEnvironmentScopeResolver {
  const resolver = (
    partnerId: string,
  ): Promise<AuthoritativePartnerEnvironmentScope | null> =>
    resolveAuthoritativePartnerEnvironmentScope(partnerId, officePartners);

  resolver.byProject = (
    projectId: string,
  ): Promise<AuthoritativePartnerEnvironmentScope | null> =>
    resolveAuthoritativePartnerEnvironmentScopeByProject(
      projectId,
      officePartners,
    );

  return resolver;
}
