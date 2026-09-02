import assert from "node:assert/strict";
import {
  mkdtemp,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  describe,
  it,
} from "node:test";

import {
  FileProjectConfigRepository,
} from "./projectConfigRepository";

describe("Project billing authority", () => {
  it("allocates 26010, is idempotent, then allocates 26011", async () => {
    const dir = await mkdtemp(
      join(tmpdir(), "conis-billing-"),
    );

    try {
      const repo =
        new FileProjectConfigRepository(
          join(dir, "project-config.json"),
        );

      const first =
        await repo.ensureBillingNumber(
          "project-a",
          "2026-09-02T10:00:00.000Z",
        );

      const again =
        await repo.ensureBillingNumber(
          "project-a",
          "2026-09-03T10:00:00.000Z",
        );

      const second =
        await repo.ensureBillingNumber(
          "project-b",
          "2026-09-03T10:00:00.000Z",
        );

      assert.equal(
        first.billingNumber,
        "26010",
      );

      assert.equal(
        again.billingNumber,
        "26010",
      );

      assert.equal(
        second.billingNumber,
        "26011",
      );
    } finally {
      await rm(
        dir,
        {
          recursive: true,
          force: true,
        },
      );
    }
  });

  it("preserves billing number when privacy config is updated", async () => {
    const dir = await mkdtemp(
      join(tmpdir(), "conis-billing-privacy-"),
    );

    try {
      const repo =
        new FileProjectConfigRepository(
          join(dir, "project-config.json"),
        );

      await repo.ensureBillingNumber(
        "project-a",
        "2026-09-02T10:00:00.000Z",
      );

      await repo.upsert({
        projectId: "project-a",
        privacyUrl:
          "https://example.test/privacy",
      });

      const saved =
        await repo.get("project-a");

      assert.equal(
        saved?.billingNumber,
        "26010",
      );

      assert.equal(
        saved?.privacyUrl,
        "https://example.test/privacy",
      );
    } finally {
      await rm(
        dir,
        {
          recursive: true,
          force: true,
        },
      );
    }
  });
});
