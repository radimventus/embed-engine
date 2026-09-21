import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  commitsIdentifySameSource,
  evaluateCanonicalReleaseArtifacts,
  evaluateCanonicalReleaseProvenance,
  normalizeReleaseCommit,
} from "./canonicalReleaseProvenance.mjs";

/** Recorded TASK 119 Studio source vs the stale pre-117 Embed IIFE fingerprint. */
const TASK_119_STUDIO_SOURCE =
  "fb22d6a524e90116adb5eb428b61ea3d5401ec77";
const STALE_EMBED_FINGERPRINT = "6db65ca4";

describe("canonical release provenance", () => {
  it("normalizes Git ids without inventing a second fingerprint format", () => {
    assert.equal(
      normalizeReleaseCommit("  FB22D6A5 "),
      "fb22d6a5",
    );
  });

  it("treats git --short and full SHA of the same commit as one source", () => {
    assert.equal(
      commitsIdentifySameSource(
        TASK_119_STUDIO_SOURCE,
        TASK_119_STUDIO_SOURCE.slice(0, 8),
      ),
      true,
    );
    assert.equal(
      evaluateCanonicalReleaseProvenance({
        sourceHeadSha: TASK_119_STUDIO_SOURCE,
        studioSourceGitSha: TASK_119_STUDIO_SOURCE,
        embedFingerprintCommit: TASK_119_STUDIO_SOURCE.slice(0, 8),
      }).ok,
      true,
    );
  });

  it("rejects the recorded Studio vs stale Embed mismatch", () => {
    const result = evaluateCanonicalReleaseProvenance({
      studioSourceGitSha: TASK_119_STUDIO_SOURCE,
      embedFingerprintCommit: STALE_EMBED_FINGERPRINT,
    });
    assert.equal(result.ok, false);
    assert.match(
      result.reason,
      /studio source SHA != embed release fingerprint/,
    );
    assert.match(result.reason, new RegExp(TASK_119_STUDIO_SOURCE));
    assert.match(result.reason, new RegExp(STALE_EMBED_FINGERPRINT));
  });

  it("rejects a Studio READY whose Embed fingerprint is not the release HEAD", () => {
    const result = evaluateCanonicalReleaseProvenance({
      sourceHeadSha: TASK_119_STUDIO_SOURCE,
      studioSourceGitSha: TASK_119_STUDIO_SOURCE,
      embedFingerprintCommit: STALE_EMBED_FINGERPRINT,
    });
    assert.equal(result.ok, false);
  });

  it("reads Studio release.json and Embed version.json through one evaluator", () => {
    const stale = evaluateCanonicalReleaseArtifacts({
      studioRelease: { sourceGitSha: TASK_119_STUDIO_SOURCE },
      embedVersion: { fingerprint: { commit: STALE_EMBED_FINGERPRINT } },
    });
    assert.equal(stale.ok, false);

    const current = evaluateCanonicalReleaseArtifacts({
      sourceHeadSha: TASK_119_STUDIO_SOURCE,
      studioRelease: { sourceGitSha: TASK_119_STUDIO_SOURCE },
      embedVersion: {
        fingerprint: { commit: TASK_119_STUDIO_SOURCE.slice(0, 8) },
      },
    });
    assert.equal(current.ok, true);
  });
});
