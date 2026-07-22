import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveObjectPackage, DEFAULT_OBJECT_ID } from "./resolveObjectPackage";
import { createDeliveryRuntime } from "./createDeliveryRuntime";
import {
  isLegacyGardenMount,
  isProductionMount,
} from "./types";

describe("Embed delivery layer preparation", () => {
  it("resolves the pilot Object Package by default", () => {
    const pack = resolveObjectPackage();
    assert.equal(pack.identity.id, DEFAULT_OBJECT_ID);
    assert.equal(pack.identity.id, "house-modern-01");
  });

  it("rejects unknown object ids without Garden fallback", () => {
    assert.throws(() => resolveObjectPackage("garden"), /unknown objectId/);
  });

  it("creates a Decision Session Runtime for delivery", () => {
    const runtime = createDeliveryRuntime(resolveObjectPackage());
    const experience = runtime.getExperience();
    assert.ok(experience);
    assert.equal(experience!.context.object.id, "house-modern-01");
  });

  it("classifies mount options for production vs legacy garden", () => {
    assert.equal(
      isProductionMount({ target: "#x", objectId: "house-modern-01" }),
      true,
    );
    assert.equal(isLegacyGardenMount({ target: "#x", fixture: "garden" }), true);
    assert.equal(isProductionMount({ target: "#x", fixture: "garden" }), false);
  });
});
