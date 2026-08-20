import { DSE_COMPANY_ID } from '../registry/defaults';

/** Legacy Office identifier for the DSE Partner; runtime Company id is canonical. */
export const OFFICE_REFERENCE_PARTNER_ID = 'p-dse' as const;

/**
 * Maps an Office Partner technical id to the canonical Platform Company id.
 * `p-dse` is the only legacy alias; every other Partner is already Company-keyed.
 */
export function canonicalCompanyIdForOfficePartner(partnerId: string): string {
  const normalized = partnerId.trim();
  return normalized === OFFICE_REFERENCE_PARTNER_ID
    ? DSE_COMPANY_ID
    : normalized;
}
