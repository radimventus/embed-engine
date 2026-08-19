import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CUSTOMER_FACING_FORBIDDEN_HOUSE_IDENTITY_TOKENS,
  realizeCustomerFacingHouseIdentityText,
} from "./houseIdentity";

describe("customer-facing house identity boundary", () => {
  it("maps only allowlisted legacy house labels to the approved display name", () => {
    for (const legacy of CUSTOMER_FACING_FORBIDDEN_HOUSE_IDENTITY_TOKENS) {
      const realized = realizeCustomerFacingHouseIdentityText(
        `Referenční ${legacy} zůstává popsaný.`,
      );
      assert.equal(realized, "Referenční Bungalov 4KK zůstává popsaný.");
    }
  });

  it("does not transform an internal ID, slug, or unrelated prose", () => {
    assert.equal(
      realizeCustomerFacingHouseIdentityText("modern-4kk"),
      "modern-4kk",
    );
    assert.equal(
      realizeCustomerFacingHouseIdentityText("house-modern-01"),
      "house-modern-01",
    );
    assert.equal(
      realizeCustomerFacingHouseIdentityText("Tento bungalov má zahradu."),
      "Tento bungalov má zahradu.",
    );
  });
});
