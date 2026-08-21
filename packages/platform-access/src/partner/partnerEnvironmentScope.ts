import {
  DSE_CANONICAL_PROJECT_ID,
  DSE_COMPANY_ID,
  DSE_TENANT_ID,
  DSE_WORKSPACE_ID,
} from '../registry/defaults';
import { OFFICE_REFERENCE_PARTNER_ID } from './canonicalOfficePartner';

export type PartnerEnvironmentScope = {
  readonly tenantId: string;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string;
};

export type AuthoritativePartnerEnvironmentScope = PartnerEnvironmentScope & {
  readonly partnerId: string;
};

/** Canonical DSE Partner Environment scope — write validation only, never an enter bypass. */
export const CANONICAL_DSE_PARTNER_ENVIRONMENT_SCOPE: PartnerEnvironmentScope =
  Object.freeze({
    tenantId: DSE_TENANT_ID,
    companyId: DSE_COMPANY_ID,
    workspaceId: DSE_WORKSPACE_ID,
    projectId: DSE_CANONICAL_PROJECT_ID,
  });

function requiredId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parsePartnerEnvironmentScope(
  value: unknown,
): PartnerEnvironmentScope | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const tenantId = requiredId(record.tenantId);
  const companyId = requiredId(record.companyId);
  const workspaceId = requiredId(record.workspaceId);
  const projectId = requiredId(record.projectId);
  if (
    tenantId === null ||
    companyId === null ||
    workspaceId === null ||
    projectId === null
  ) {
    return null;
  }
  return { tenantId, companyId, workspaceId, projectId };
}

export function partnerEnvironmentScopesMatch(
  requested: AuthoritativePartnerEnvironmentScope,
  authoritative: AuthoritativePartnerEnvironmentScope,
): boolean {
  return (
    requested.partnerId === authoritative.partnerId &&
    requested.tenantId === authoritative.tenantId &&
    requested.companyId === authoritative.companyId &&
    requested.workspaceId === authoritative.workspaceId &&
    requested.projectId === authoritative.projectId
  );
}

export function isCanonicalDsePartnerId(partnerId: string): boolean {
  return partnerId.trim() === OFFICE_REFERENCE_PARTNER_ID;
}

/**
 * Write-time check: DSE must persist its canonical seed scope;
 * every other Partner must bind companyId to its durable Company identity.
 */
export function partnerEnvironmentScopeMatchesPartner(input: {
  readonly partnerId: string;
  readonly partnerCompanyId: string;
  readonly scope: PartnerEnvironmentScope;
}): boolean {
  if (input.scope.companyId !== input.partnerCompanyId) return false;
  if (isCanonicalDsePartnerId(input.partnerId)) {
    return partnerEnvironmentScopesMatch(
      { partnerId: input.partnerId, ...input.scope },
      {
        partnerId: input.partnerId,
        ...CANONICAL_DSE_PARTNER_ENVIRONMENT_SCOPE,
      },
    );
  }
  return true;
}
