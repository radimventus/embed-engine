/**
 * Canonical Studio ↔ Embed release provenance (TASK 117).
 *
 * Studio records a full Git SHA in docs/studio/release.json.sourceGitSha.
 * Embed records `git rev-parse --short HEAD` in docs/embed/version.json
 * fingerprint.commit (packages/embed/scripts/lib/buildFingerprint.mjs).
 *
 * This module is the single comparison authority. It does not invent a
 * second fingerprint format.
 */

const GIT_SHA_PATTERN = /^[0-9a-f]+$/;
const MIN_ABBREV_LENGTH = 7;

/**
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeReleaseCommit(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

/**
 * True when two Git ids are the same commit expressed as full SHA and/or
 * unique abbreviation (git --short).
 *
 * @param {unknown} left
 * @param {unknown} right
 */
export function commitsIdentifySameSource(left, right) {
  const a = normalizeReleaseCommit(left);
  const b = normalizeReleaseCommit(right);
  if (a.length < MIN_ABBREV_LENGTH || b.length < MIN_ABBREV_LENGTH) {
    return false;
  }
  if (!GIT_SHA_PATTERN.test(a) || !GIT_SHA_PATTERN.test(b)) {
    return false;
  }
  return a.startsWith(b) || b.startsWith(a);
}

/**
 * @typedef {{
 *   readonly sourceHeadSha?: string | null;
 *   readonly studioSourceGitSha?: string | null;
 *   readonly embedFingerprintCommit?: string | null;
 * }} CanonicalReleaseProvenanceInput
 *
 * @typedef {{
 *   readonly ok: true;
 *   readonly studioSourceGitSha: string;
 *   readonly embedFingerprintCommit: string;
 *   readonly sourceHeadSha: string | null;
 * } | {
 *   readonly ok: false;
 *   readonly reason: string;
 *   readonly studioSourceGitSha: string | null;
 *   readonly embedFingerprintCommit: string | null;
 *   readonly sourceHeadSha: string | null;
 * }} CanonicalReleaseProvenanceResult
 */

/**
 * Studio source SHA, Embed fingerprint commit, and optional release HEAD
 * must identify the same committed source.
 *
 * @param {CanonicalReleaseProvenanceInput} input
 * @returns {CanonicalReleaseProvenanceResult}
 */
export function evaluateCanonicalReleaseProvenance(input) {
  const studioSourceGitSha = normalizeReleaseCommit(input.studioSourceGitSha);
  const embedFingerprintCommit = normalizeReleaseCommit(
    input.embedFingerprintCommit,
  );
  const sourceHeadSha = normalizeReleaseCommit(input.sourceHeadSha);

  const studio = studioSourceGitSha.length > 0 ? studioSourceGitSha : null;
  const embed = embedFingerprintCommit.length > 0 ? embedFingerprintCommit : null;
  const head = sourceHeadSha.length > 0 ? sourceHeadSha : null;

  if (studio === null) {
    return {
      ok: false,
      reason: "Studio release sourceGitSha is missing",
      studioSourceGitSha: studio,
      embedFingerprintCommit: embed,
      sourceHeadSha: head,
    };
  }
  if (embed === null) {
    return {
      ok: false,
      reason: "Embed fingerprint.commit is missing",
      studioSourceGitSha: studio,
      embedFingerprintCommit: embed,
      sourceHeadSha: head,
    };
  }
  if (!commitsIdentifySameSource(studio, embed)) {
    return {
      ok: false,
      reason: `studio source SHA != embed release fingerprint (${studio} != ${embed})`,
      studioSourceGitSha: studio,
      embedFingerprintCommit: embed,
      sourceHeadSha: head,
    };
  }
  if (head !== null && !commitsIdentifySameSource(studio, head)) {
    return {
      ok: false,
      reason: `studio source SHA != release HEAD (${studio} != ${head})`,
      studioSourceGitSha: studio,
      embedFingerprintCommit: embed,
      sourceHeadSha: head,
    };
  }
  if (head !== null && !commitsIdentifySameSource(embed, head)) {
    return {
      ok: false,
      reason: `embed release fingerprint != release HEAD (${embed} != ${head})`,
      studioSourceGitSha: studio,
      embedFingerprintCommit: embed,
      sourceHeadSha: head,
    };
  }

  return {
    ok: true,
    studioSourceGitSha: studio,
    embedFingerprintCommit: embed,
    sourceHeadSha: head,
  };
}

/**
 * @param {{
 *   readonly studioRelease?: { readonly sourceGitSha?: unknown } | null;
 *   readonly embedVersion?: { readonly fingerprint?: { readonly commit?: unknown } } | null;
 *   readonly sourceHeadSha?: string | null;
 * }} artifacts
 */
export function evaluateCanonicalReleaseArtifacts(artifacts) {
  return evaluateCanonicalReleaseProvenance({
    sourceHeadSha: artifacts.sourceHeadSha,
    studioSourceGitSha: artifacts.studioRelease?.sourceGitSha,
    embedFingerprintCommit: artifacts.embedVersion?.fingerprint?.commit,
  });
}
