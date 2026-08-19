import {
  EXPLICIT_PRODUCT,
  customerFacingHouseIdentityForm,
} from "./czechRealization";

const LEGACY_HOUSE_IDENTITY_TOKENS = Object.freeze([
  "MODERN A01 – 4+kk",
  "MODERN A01",
  "MODERN 4KK",
  "MODERN",
] as const);

export const CUSTOMER_FACING_FORBIDDEN_HOUSE_IDENTITY_TOKENS =
  LEGACY_HOUSE_IDENTITY_TOKENS;

function explicitProductName(): string {
  const name = customerFacingHouseIdentityForm(EXPLICIT_PRODUCT, "DISPLAY");
  if (name === null) {
    throw new Error("Missing controlled explicit product display form.");
  }
  return name;
}

/**
 * Rewrites only explicitly allowlisted legacy implementation labels at a
 * customer-facing rendering boundary. It does not inspect or transform IDs,
 * slugs, arbitrary house names, or general Czech prose.
 */
export function realizeCustomerFacingHouseIdentityText(source: string): string {
  let result = source;

  for (const token of LEGACY_HOUSE_IDENTITY_TOKENS) {
    const parts = result.split(token);
    if (parts.length > 1) {
      result = parts.join(explicitProductName());
    }
  }

  return result;
}
