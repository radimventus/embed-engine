import {
  buildBuilderPackageRegistries,
  isFloorPlanGeometry,
  parseCsv,
  projectBuilderImportToHousePackage,
  readHeroCopyFromManifest,
  readHeroRelativePathFromManifest,
  type BuilderHousePackageImport,
  type BuilderHousePackageProjectionOptions,
  type FloorPlanGeometry,
} from '@embed-engine/object-house/builder-package';
import type { HousePackage } from '@embed-engine/object-house';

import {
  AUTHORING_DRAFT_RUNTIME_HOUSE_DEFAULTS,
  BUILDER_RUNTIME_HOUSE_DEFAULTS,
} from './builderRuntimeHouseDefaults';
import {
  clearFloorPlanGeometryCache,
  setFloorPlanGeometryForFloor,
} from './floorPlanGeometryStore';
import { getPresentationAssetBase } from './presentationAssetBase';
import {
  evidenceLog,
  fingerprintText,
  firstLast,
  isRuntimeEvidenceEnabled,
} from './runtimeEvidence';
import { normalizeHousePackageAssets } from './normalizeHousePackageAssets';

const PACKAGE_ROOT_LABEL = '/house-package';
const HERO_PATH = 'media/hero/hero.png';

type AuthoringDraftManifest = {
  readonly validationMode: 'AUTHORING_DRAFT';
  readonly heroPath: string;
  readonly floorPlans: 'not-authored' | 'placeholder';
};

/** PT-PDM-03 — optional Shared Project identity overlay on Builder Package projection. */
export type BuilderPackageBootstrapProjection = {
  readonly identity?: BuilderHousePackageProjectionOptions['identity'];
};

/**
 * Durable VPD state overlays the seeded package text while its media remains
 * addressable through the Platform API's stable per-house media endpoint.
 */
export type BuilderPackageDurableOverlay = {
  readonly files: Partial<BuilderPackageCsvTexts> & {
    readonly manifestJson?: string | null;
  };
  /** Package-relative asset path → authenticated browser-local URL. */
  readonly mediaUrls?: Readonly<Record<string, string>>;
};

function csvPathsForPackageRoot(packagePublicRoot: string): {
  readonly gallery: string;
  readonly rooms: string;
  readonly videos: string;
  readonly packageRootLabel: string;
} {
  const root = packagePublicRoot.replace(/\/+$/, '') || '/house-package';
  return {
    gallery: `${root}/gallery.csv`,
    rooms: `${root}/rooms.csv`,
    videos: `${root}/videos.csv`,
    packageRootLabel: root,
  };
}

export type BuilderPackageCsvTexts = {
  readonly galleryCsv: string;
  readonly roomsCsv: string;
  readonly videosCsv: string;
};

function planPairsFromRooms(
  roomsCsvText: string,
  rasterExtension: 'png' | 'webp' = 'webp',
): {
  readonly floorId: string;
  readonly rasterRelativePath: string;
  readonly svgRelativePath: string;
}[] {
  const table = parseCsv(roomsCsvText);
  const floors = new Set<string>();
  for (const row of table.rows) {
    const floor = row.floor?.trim();
    if (floor) {
      floors.add(floor);
    }
  }

  return [...floors]
    .sort((a, b) => a.localeCompare(b, 'en'))
    .map((floorId) => ({
      floorId,
      rasterRelativePath: `media/plans/${floorId}.${rasterExtension}`,
      svgRelativePath: `media/plans/${floorId}.svg`,
    }));
}

function resolvePackageUrl(absolutePath: string): string {
  const assetBase = getPresentationAssetBase();
  if (assetBase === null || assetBase.length === 0) {
    return absolutePath;
  }
  if (
    absolutePath.startsWith('https://') ||
    absolutePath.startsWith('http://') ||
    absolutePath.startsWith('data:') ||
    absolutePath.startsWith('blob:')
  ) {
    return absolutePath;
  }
  if (absolutePath.startsWith('/')) {
    return `${assetBase}${absolutePath}`;
  }
  return absolutePath;
}

async function fetchText(absolutePath: string): Promise<string> {
  const url = resolvePackageUrl(absolutePath);
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(
      `Failed to load House Package asset ${url}: HTTP ${response.status}`,
    );
  }
  return response.text();
}

async function fetchCsvText(absolutePath: string): Promise<string> {
  return fetchText(absolutePath);
}

function isAuthoringDraftManifest(value: unknown): value is AuthoringDraftManifest {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const manifest = value as Partial<AuthoringDraftManifest>;
  return (
    manifest.validationMode === 'AUTHORING_DRAFT' &&
    typeof manifest.heroPath === 'string' &&
    manifest.heroPath.length > 0 &&
    (manifest.floorPlans === 'not-authored' ||
      manifest.floorPlans === 'placeholder')
  );
}

async function loadAuthoringDraftManifest(
  packagePublicRoot: string,
  manifestJson?: string | null,
): Promise<{
  readonly authoringDraft: AuthoringDraftManifest | null;
  readonly heroCopy: ReturnType<typeof readHeroCopyFromManifest>;
  readonly heroRelativePath: ReturnType<typeof readHeroRelativePathFromManifest>;
}> {
  try {
    const text =
      typeof manifestJson === 'string'
        ? manifestJson
        : await fetchText(
            `${packagePublicRoot.replace(/\/+$/, '')}/manifest.json`,
          );
    const parsed: unknown = JSON.parse(text);
    return {
      authoringDraft: isAuthoringDraftManifest(parsed) ? parsed : null,
      heroCopy: readHeroCopyFromManifest(text),
      heroRelativePath: readHeroRelativePathFromManifest(text),
    };
  } catch {
    return {
      authoringDraft: null,
      heroCopy: null,
      heroRelativePath: null,
    };
  }
}

async function loadFloorPlanGeometryForRooms(
  roomsCsvText: string,
  packagePublicRoot: string,
  hasFloorPlans: boolean,
): Promise<void> {
  clearFloorPlanGeometryCache();
  if (!hasFloorPlans) {
    return;
  }
  const table = parseCsv(roomsCsvText);
  const floors = new Set<string>();
  for (const row of table.rows) {
    const floor = row.floor?.trim();
    if (floor) {
      floors.add(floor);
    }
  }
  const root = packagePublicRoot.replace(/\/+$/, '') || '/house-package';
  await Promise.all(
    [...floors].map(async (floorId) => {
      const path = `${root}/media/plans/${floorId}.geometry.json`;
      const text = await fetchText(path);
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error(`Invalid HP-003 geometry JSON at ${path}`);
      }
      if (!isFloorPlanGeometry(parsed)) {
        throw new Error(`HP-003 schema mismatch at ${path}`);
      }
      const geometry = parsed as FloorPlanGeometry;
      if (geometry.floorId !== floorId) {
        throw new Error(
          `HP-003 floorId mismatch at ${path}: expected ${floorId}, got ${geometry.floorId}`,
        );
      }
      setFloorPlanGeometryForFloor(floorId, geometry);
    }),
  );
}

/**
 * Vite 7–compatible loader: HTTP fetch of public HP-002 CSVs (no public/?raw imports).
 * PT-PDM-02 — paths follow Shared Project `packagePublicRoot`.
 */
export async function loadBuilderPackageCsvTexts(
  packagePublicRoot: string = PACKAGE_ROOT_LABEL,
): Promise<BuilderPackageCsvTexts> {
  const paths = csvPathsForPackageRoot(packagePublicRoot);
  const [galleryCsv, roomsCsv, videosCsv] = await Promise.all([
    fetchCsvText(paths.gallery),
    fetchCsvText(paths.rooms),
    fetchCsvText(paths.videos),
  ]);
  return { galleryCsv, roomsCsv, videosCsv };
}

function buildRegistriesFromTexts(
  texts: BuilderPackageCsvTexts,
  packagePublicRoot: string = PACKAGE_ROOT_LABEL,
  manifest: AuthoringDraftManifest | null = null,
  heroRelativePath: ReturnType<typeof readHeroRelativePathFromManifest> = null,
): BuilderHousePackageImport {
  const paths = csvPathsForPackageRoot(packagePublicRoot);
  const result = buildBuilderPackageRegistries({
    packageRoot: paths.packageRootLabel,
    galleryCsv: texts.galleryCsv,
    roomsCsv: texts.roomsCsv,
    videosCsv: texts.videosCsv,
    validationMode: manifest?.validationMode ?? 'PUBLISH_READY',
    heroPath: heroRelativePath ?? manifest?.heroPath ?? HERO_PATH,
    planPairs:
      manifest?.floorPlans === 'not-authored'
        ? []
        : planPairsFromRooms(
            texts.roomsCsv,
            manifest?.floorPlans === 'placeholder' ? 'png' : 'webp',
          ),
  });

  if (!result.ok) {
    const detail = result.errors
      .map((error) => `${error.code}: ${error.message}`)
      .join('; ');
    throw new Error(`Builder House Package bootstrap failed: ${detail}`);
  }

  return result.result;
}

export function createBuilderPackageEvidence(input: {
  readonly packagePublicRoot: string;
  readonly heroRelativePath: string | null;
  readonly registries: BuilderHousePackageImport;
  readonly texts: BuilderPackageCsvTexts;
}): Record<string, unknown> {
  const paths = csvPathsForPackageRoot(input.packagePublicRoot);
  const heroRelativePath = input.heroRelativePath ?? HERO_PATH;
  return {
    packageRoot: paths.packageRootLabel,
    galleryCsvPath: paths.gallery,
    roomsCsvPath: paths.rooms,
    videosCsvPath: paths.videos,
    heroPath: `${paths.packageRootLabel}/${heroRelativePath.replace(/^\/+/, '')}`,
    galleryCsvSource: `HTTP fetch of public${paths.packageRootLabel}/*.csv (Vite 7 compatible)`,
    galleryCsvFingerprint: fingerprintText(input.texts.galleryCsv),
    galleryItemCount: input.registries.gallery.entries.length,
    galleryFirst: input.registries.gallery.entries[0] ?? null,
    galleryLast:
      input.registries.gallery.entries[input.registries.gallery.entries.length - 1] ?? null,
    roomsCsvFingerprint: fingerprintText(input.texts.roomsCsv),
    videosCsvFingerprint: fingerprintText(input.texts.videosCsv),
  };
}

function logBuilderPackageEvidence(
  registries: BuilderHousePackageImport,
  texts: BuilderPackageCsvTexts,
  packagePublicRoot: string,
  heroRelativePath: string | null,
): void {
  if (!isRuntimeEvidenceEnabled()) {
    return;
  }

  // Evidence must not delay the bootstrap promise or mask a binding race.
  window.setTimeout(() => {
    evidenceLog(
      '1.BuilderPackage',
      createBuilderPackageEvidence({
        packagePublicRoot,
        heroRelativePath,
        registries,
        texts,
      }),
    );

    evidenceLog('2.RuntimeRegistry', {
      gallery: firstLast(registries.gallery.entries),
      hero: firstLast(registries.hero.entries),
      rooms: firstLast(registries.rooms.rooms),
      videos: firstLast(registries.videos.entries),
      floors: firstLast(registries.floors.floors),
    });

    evidenceLog('6.RuntimeSource', {
      usesBuilderPackageRegistry: true,
      usesRuntimeHousePackageFromBuilder: true,
      usesManifestJson: false,
      usesReferenceHousePackage: false,
      csvLoadMode: 'http-fetch-public-house-package',
    });
  }, 0);
}

let cachedRegistries: BuilderHousePackageImport | null = null;
let cachedHousePackage: HousePackage | null = null;
let cachedPackagePublicRoot: string | null = null;
let cachedMediaPublicRoot: string | null = null;
let cachedProjectionKey: string | null = null;
let bootstrapPromise: Promise<BuilderHousePackageImport> | null = null;

function projectionCacheKey(
  packagePublicRoot: string,
  projection?: BuilderPackageBootstrapProjection,
  durableOverlay?: BuilderPackageDurableOverlay,
): string {
  const identityId = projection?.identity?.id ?? '';
  const durableMediaUrls = durableOverlay?.mediaUrls ?? {};
  const durableFiles = durableOverlay?.files ?? {};
  return `${packagePublicRoot}::${identityId}::${JSON.stringify(durableFiles)}::${JSON.stringify(durableMediaUrls)}`;
}

function projectCachedHousePackage(
  registries: BuilderHousePackageImport,
  packagePublicRoot: string,
  staticPackagePublicRoot: string,
  projection?: BuilderPackageBootstrapProjection,
  isAuthoringDraft = false,
  heroCopy: ReturnType<typeof readHeroCopyFromManifest> = null,
  mediaUrls?: Readonly<Record<string, string>>,
): HousePackage {
  const housePackage = projectBuilderImportToHousePackage(registries, {
    ...(isAuthoringDraft
      ? AUTHORING_DRAFT_RUNTIME_HOUSE_DEFAULTS
      : BUILDER_RUNTIME_HOUSE_DEFAULTS),
    ...(projection?.identity !== undefined
      ? { identity: projection.identity }
      : {}),
    packagePublicRoot,
    ...(heroCopy !== null ? { heroCopy } : {}),
  });
  const projected = normalizeHousePackageAssets(
    housePackage,
    staticPackagePublicRoot,
    mediaUrls,
  );
  cachedHousePackage = projected;
  return projected;
}

/**
 * Ensure Builder registries + Runtime HousePackage exist (async).
 * PT-PDM-02/03 — `packagePublicRoot` + identity from Shared Project Runtime (`openProject`).
 * Browser: fetches HP-002 CSVs over HTTP. Tests: use bootstrapBuilderPackageRegistriesSyncForTests.
 */
export async function ensureBuilderPackageBootstrapped(
  packagePublicRoot: string = PACKAGE_ROOT_LABEL,
  projection?: BuilderPackageBootstrapProjection,
  durableOverlay?: BuilderPackageDurableOverlay,
): Promise<BuilderHousePackageImport> {
  const root = packagePublicRoot.replace(/\/+$/, '') || PACKAGE_ROOT_LABEL;
  const cacheKey = projectionCacheKey(root, projection, durableOverlay);
  if (
    cachedRegistries !== null &&
    cachedPackagePublicRoot === root &&
    cachedProjectionKey === cacheKey
  ) {
    return cachedRegistries;
  }
  if (
    bootstrapPromise !== null &&
    cachedPackagePublicRoot === root &&
    cachedProjectionKey === cacheKey
  ) {
    return bootstrapPromise;
  }

  cachedRegistries = null;
  cachedHousePackage = null;
  cachedPackagePublicRoot = root;
  cachedProjectionKey = cacheKey;

  bootstrapPromise = (async () => {
    const [seedTexts, manifest] = await Promise.all([
      loadBuilderPackageCsvTexts(root),
      loadAuthoringDraftManifest(root, durableOverlay?.files.manifestJson),
    ]);
    const texts: BuilderPackageCsvTexts = {
      galleryCsv: durableOverlay?.files.galleryCsv ?? seedTexts.galleryCsv,
      roomsCsv: durableOverlay?.files.roomsCsv ?? seedTexts.roomsCsv,
      videosCsv: durableOverlay?.files.videosCsv ?? seedTexts.videosCsv,
    };
    // Registries describe package-relative assets. Keep that source invariant
    // for every House; durable URLs are applied once by the normalizer after
    // projection rather than changing the shape seen by Runtime consumers.
    const mediaRoot = root;
    cachedMediaPublicRoot = root;
    await loadFloorPlanGeometryForRooms(
      texts.roomsCsv,
      // Durable state overlays authored text and uploaded media only. HP-003
      // geometry remains required seed package infrastructure, so an absent
      // optional API media object must not fail the entire Runtime bootstrap.
      root,
      manifest.authoringDraft?.floorPlans !== 'not-authored',
    );
    const registries = buildRegistriesFromTexts(
      texts,
      mediaRoot,
      manifest.authoringDraft,
      manifest.heroRelativePath,
    );
    cachedRegistries = registries;
    projectCachedHousePackage(
      registries,
      mediaRoot,
      root,
      projection,
      manifest.authoringDraft?.validationMode === 'AUTHORING_DRAFT',
      manifest.heroCopy,
      durableOverlay?.mediaUrls,
    );
    logBuilderPackageEvidence(
      registries,
      texts,
      mediaRoot,
      manifest.heroRelativePath,
    );
    return registries;
  })();

  try {
    return await bootstrapPromise;
  } catch (error) {
    bootstrapPromise = null;
    cachedPackagePublicRoot = null;
    cachedMediaPublicRoot = null;
    cachedProjectionKey = null;
    throw error;
  }
}

/**
 * Sync access after bootstrap. Throws if ensureBuilderPackageBootstrapped has not completed.
 */
export function getBuilderPackageRegistries(): BuilderHousePackageImport {
  if (cachedRegistries === null) {
    throw new Error(
      'Builder House Package registries are not ready. Await ensureBuilderPackageBootstrapped() first.',
    );
  }
  return cachedRegistries;
}

/** Active package public root after bootstrap (for presentation asset URLs). */
export function getBuilderPackagePublicRoot(): string {
  return cachedMediaPublicRoot ?? cachedPackagePublicRoot ?? PACKAGE_ROOT_LABEL;
}

/**
 * Runtime HousePackage projected from Builder registries (sole Client Studio object SSOT).
 */
export function getBuilderRuntimeHousePackage(): HousePackage {
  if (cachedHousePackage !== null) {
    return cachedHousePackage;
  }
  return projectCachedHousePackage(
    getBuilderPackageRegistries(),
    cachedPackagePublicRoot ?? PACKAGE_ROOT_LABEL,
    cachedPackagePublicRoot ?? PACKAGE_ROOT_LABEL,
  );
}

/**
 * Node/unit-test bootstrap — inject CSV texts without HTTP (no Vite public/?raw).
 */
export function bootstrapBuilderPackageRegistriesSyncForTests(
  texts: BuilderPackageCsvTexts,
  geometryByFloor?: Readonly<Record<string, FloorPlanGeometry>>,
  packagePublicRoot: string = PACKAGE_ROOT_LABEL,
  projection?: BuilderPackageBootstrapProjection,
): BuilderHousePackageImport {
  clearFloorPlanGeometryCache();
  if (geometryByFloor !== undefined) {
    for (const [floorId, geometry] of Object.entries(geometryByFloor)) {
      setFloorPlanGeometryForFloor(floorId, geometry);
    }
  }
  const root = packagePublicRoot.replace(/\/+$/, '') || PACKAGE_ROOT_LABEL;
  cachedPackagePublicRoot = root;
  cachedMediaPublicRoot = root;
  cachedProjectionKey = projectionCacheKey(root, projection);
  const registries = buildRegistriesFromTexts(texts, root);
  cachedRegistries = registries;
  bootstrapPromise = Promise.resolve(registries);
  projectCachedHousePackage(registries, root, root, projection);
  return registries;
}

/** Test helper — clear memoized registries. */
export function resetBuilderPackageBootstrapForTests(): void {
  cachedRegistries = null;
  cachedHousePackage = null;
  cachedPackagePublicRoot = null;
  cachedMediaPublicRoot = null;
  cachedProjectionKey = null;
  bootstrapPromise = null;
  clearFloorPlanGeometryCache();
}
