/**
 * CAP-BLD-07 — House Package content fingerprint (no mock checksum).
 */

export type HousePackageFingerprintInput = {
  readonly roomsCsv: string;
  readonly galleryCsv: string;
  readonly videosCsv: string;
  readonly heroRelativePath: string;
  readonly manifestVersion: string;
};

/** FNV-1a text fingerprint — same family as Client Studio runtime evidence. */
export function fingerprintText(text: string): string {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}-len${text.length}`;
}

/**
 * Stable content fingerprint for the mounted / published HP-002 texts.
 */
export function fingerprintHousePackageContent(
  input: HousePackageFingerprintInput,
): string {
  const payload = [
    `version:${input.manifestVersion}`,
    `hero:${input.heroRelativePath}`,
    `rooms:${fingerprintText(input.roomsCsv)}`,
    `gallery:${fingerprintText(input.galleryCsv)}`,
    `videos:${fingerprintText(input.videosCsv)}`,
  ].join('|');
  return fingerprintText(payload);
}

export type ReleaseVerification = {
  readonly publishFingerprint: string;
  readonly runtimeFingerprint: string;
  readonly housePackageFingerprint: string;
  readonly buildTimestamp: string;
  readonly housePackageVersion: string;
  readonly embedVersion: string;
  /** True when Runtime source is the production projection path. */
  readonly runtimeAligned: boolean;
  readonly previewReady: boolean;
};

export const PRODUCTION_RUNTIME_SOURCE =
  'builder-package/projectBuilderImportToHousePackage' as const;

export function buildReleaseVerification(input: {
  readonly publishFingerprint: string;
  readonly runtimeFingerprint: string;
  readonly housePackageFingerprint: string;
  readonly buildTimestamp: string;
  readonly housePackageVersion: string;
  readonly embedVersion: string;
  readonly previewOpen: boolean;
}): ReleaseVerification {
  return {
    publishFingerprint: input.publishFingerprint,
    runtimeFingerprint: input.runtimeFingerprint,
    housePackageFingerprint: input.housePackageFingerprint,
    buildTimestamp: input.buildTimestamp,
    housePackageVersion: input.housePackageVersion,
    embedVersion: input.embedVersion,
    runtimeAligned:
      input.runtimeFingerprint === PRODUCTION_RUNTIME_SOURCE ||
      input.runtimeFingerprint.includes(PRODUCTION_RUNTIME_SOURCE),
    previewReady: input.previewOpen,
  };
}
