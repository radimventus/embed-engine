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

export function createPartnerEnvironmentScopeResolver(
  officePartners: OfficePartnerRepository,
): (partnerId: string) => Promise<AuthoritativePartnerEnvironmentScope | null> {
  return (partnerId) =>
    resolveAuthoritativePartnerEnvironmentScope(partnerId, officePartners);
}
