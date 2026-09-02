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

describe(
  "Project commercial selection authority",
  () => {
    it(
      "keeps first timestamp for the same package",
      async () => {
        const dir = await mkdtemp(
          join(tmpdir(), "conis-selection-"),
        );

        try {
          const repo =
            new FileProjectConfigRepository(
              join(
                dir,
                "project-config.json",
              ),
            );

          const first =
            await repo.selectCommercialProgram(
              "project-a",
              "pilot",
              "2026-09-02T10:00:00.000Z",
            );

          const persistedAfterFirst =
            await repo.get("project-a");

          assert.equal(
            persistedAfterFirst
              ?.commercialProgramId,
            "pilot",
          );

          assert.equal(
            persistedAfterFirst
              ?.commercialProgramSelectedAt,
            "2026-09-02T10:00:00.000Z",
          );

          const again =
            await repo.selectCommercialProgram(
              "project-a",
              "pilot",
              "2026-09-03T10:00:00.000Z",
            );

          assert.equal(
            first.commercialProgramSelectedAt,
            "2026-09-02T10:00:00.000Z",
          );

          assert.equal(
            again.commercialProgramSelectedAt,
            first.commercialProgramSelectedAt,
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
      },
    );

    it(
      "records new timestamp when package changes",
      async () => {
        const dir = await mkdtemp(
          join(
            tmpdir(),
            "conis-selection-change-",
          ),
        );

        try {
          const repo =
            new FileProjectConfigRepository(
              join(
                dir,
                "project-config.json",
              ),
            );

          await repo.selectCommercialProgram(
            "project-a",
            "pilot",
            "2026-09-02T10:00:00.000Z",
          );

          const changed =
            await repo.selectCommercialProgram(
              "project-a",
              "start",
              "2026-09-04T12:00:00.000Z",
            );

          assert.equal(
            changed.commercialProgramId,
            "start",
          );

          assert.equal(
            changed.commercialProgramSelectedAt,
            "2026-09-04T12:00:00.000Z",
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
      },
    );
  },
);
