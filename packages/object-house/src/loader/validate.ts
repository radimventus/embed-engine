import type {
  HouseDocument,
  HousePackage,
} from "../HousePackage";
import type { MediaAsset } from "../MediaAsset";
import type { Room } from "../Room";

import {
  loadError,
  type HousePackageLoadError,
  type HousePackageLoadResult,
} from "./errors";
import {
  MEDIA_TYPES,
  PACKAGE_FORMAT,
  SUPPORTED_SCHEMA_VERSION,
  type HousePackageManifestJson,
} from "./manifest";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(
  parent: Record<string, unknown>,
  key: string,
  jsonPath: string,
  errors: HousePackageLoadError[],
): string | undefined {
  const value = parent[key];
  if (typeof value !== "string" || value.length === 0) {
    errors.push(
      loadError("HP_MISSING_FIELD", `Missing or empty string field.`, jsonPath),
    );
    return undefined;
  }
  return value;
}

function requireNumber(
  parent: Record<string, unknown>,
  key: string,
  jsonPath: string,
  errors: HousePackageLoadError[],
): number | undefined {
  const value = parent[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    errors.push(
      loadError("HP_MISSING_FIELD", `Missing or invalid number field.`, jsonPath),
    );
    return undefined;
  }
  return value;
}

function requireBoolean(
  parent: Record<string, unknown>,
  key: string,
  jsonPath: string,
  errors: HousePackageLoadError[],
): boolean | undefined {
  const value = parent[key];
  if (typeof value !== "boolean") {
    errors.push(
      loadError("HP_MISSING_FIELD", `Missing or invalid boolean field.`, jsonPath),
    );
    return undefined;
  }
  return value;
}

function requireInteger(
  parent: Record<string, unknown>,
  key: string,
  jsonPath: string,
  errors: HousePackageLoadError[],
): number | undefined {
  const value = requireNumber(parent, key, jsonPath, errors);
  if (value === undefined) {
    return undefined;
  }
  if (!Number.isInteger(value)) {
    errors.push(
      loadError("HP_INVALID_TYPE", `Expected integer.`, jsonPath),
    );
    return undefined;
  }
  return value;
}

/**
 * Pure validation: unknown JSON value → immutable HousePackage or structured errors.
 * Does not touch the filesystem (asset existence is resolved separately).
 */
export function validateHousePackageManifest(
  value: unknown,
): HousePackageLoadResult {
  const errors: HousePackageLoadError[] = [];

  if (!isRecord(value)) {
    return {
      ok: false,
      errors: [
        loadError("HP_INVALID_TYPE", "house.json root must be a JSON object."),
      ],
    };
  }

  const packageFormat = value.packageFormat;
  if (packageFormat !== PACKAGE_FORMAT) {
    errors.push(
      loadError(
        "HP_BAD_FORMAT",
        `packageFormat must be "${PACKAGE_FORMAT}".`,
        "packageFormat",
      ),
    );
  }

  const schemaVersion = value.schemaVersion;
  if (schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    errors.push(
      loadError(
        "HP_UNSUPPORTED_SCHEMA",
        `schemaVersion "${String(schemaVersion)}" is not supported (expected "${SUPPORTED_SCHEMA_VERSION}").`,
        "schemaVersion",
      ),
    );
  }

  const contentVersion = requireString(
    value,
    "contentVersion",
    "contentVersion",
    errors,
  );

  if (!isRecord(value.identity)) {
    errors.push(
      loadError("HP_MISSING_FIELD", "identity object is required.", "identity"),
    );
  }
  if (!isRecord(value.overview)) {
    errors.push(
      loadError("HP_MISSING_FIELD", "overview object is required.", "overview"),
    );
  }
  if (!isRecord(value.location)) {
    errors.push(
      loadError("HP_MISSING_FIELD", "location object is required.", "location"),
    );
  }
  if (!isRecord(value.metadata)) {
    errors.push(
      loadError("HP_MISSING_FIELD", "metadata object is required.", "metadata"),
    );
  }
  if (!Array.isArray(value.rooms)) {
    errors.push(
      loadError("HP_MISSING_FIELD", "rooms array is required.", "rooms"),
    );
  }
  if (!Array.isArray(value.media)) {
    errors.push(
      loadError("HP_MISSING_FIELD", "media array is required.", "media"),
    );
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const identityRecord = value.identity as Record<string, unknown>;
  const overviewRecord = value.overview as Record<string, unknown>;
  const locationRecord = value.location as Record<string, unknown>;
  const metadataRecord = value.metadata as Record<string, unknown>;
  const roomsRaw = value.rooms as unknown[];
  const mediaRaw = value.media as unknown[];

  const identity = {
    id: requireString(identityRecord, "id", "identity.id", errors),
    title: requireString(identityRecord, "title", "identity.title", errors),
    reference: requireString(
      identityRecord,
      "reference",
      "identity.reference",
      errors,
    ),
  };

  const overview = {
    price: requireNumber(overviewRecord, "price", "overview.price", errors),
    usableArea: requireNumber(
      overviewRecord,
      "usableArea",
      "overview.usableArea",
      errors,
    ),
    landArea: requireNumber(
      overviewRecord,
      "landArea",
      "overview.landArea",
      errors,
    ),
    rooms: requireInteger(overviewRecord, "rooms", "overview.rooms", errors),
    hasGarden: requireBoolean(
      overviewRecord,
      "hasGarden",
      "overview.hasGarden",
      errors,
    ),
  };

  const location = {
    city: requireString(locationRecord, "city", "location.city", errors),
    district: requireString(
      locationRecord,
      "district",
      "location.district",
      errors,
    ),
  };

  const metadata = {
    energyClass: requireString(
      metadataRecord,
      "energyClass",
      "metadata.energyClass",
      errors,
    ),
    construction: requireString(
      metadataRecord,
      "construction",
      "metadata.construction",
      errors,
    ),
  };

  const roomIds = new Set<string>();
  const rooms: Room[] = [];
  for (let i = 0; i < roomsRaw.length; i += 1) {
    const item = roomsRaw[i];
    const path = `rooms[${i}]`;
    if (!isRecord(item)) {
      errors.push(loadError("HP_INVALID_TYPE", "Room must be an object.", path));
      continue;
    }
    const id = requireString(item, "id", `${path}.id`, errors);
    const name = requireString(item, "name", `${path}.name`, errors);
    const area = requireNumber(item, "area", `${path}.area`, errors);
    const floor = requireInteger(item, "floor", `${path}.floor`, errors);
    if (id === undefined || name === undefined || area === undefined || floor === undefined) {
      continue;
    }
    if (roomIds.has(id)) {
      errors.push(
        loadError("HP_DUPLICATE_ID", `Duplicate room id "${id}".`, `${path}.id`),
      );
      continue;
    }
    roomIds.add(id);
    rooms.push({ id, name, area, floor });
  }

  const mediaIds = new Set<string>();
  const media: MediaAsset[] = [];
  for (let i = 0; i < mediaRaw.length; i += 1) {
    const item = mediaRaw[i];
    const path = `media[${i}]`;
    if (!isRecord(item)) {
      errors.push(
        loadError("HP_INVALID_TYPE", "Media asset must be an object.", path),
      );
      continue;
    }
    const id = requireString(item, "id", `${path}.id`, errors);
    const title = requireString(item, "title", `${path}.title`, errors);
    const url = requireString(item, "url", `${path}.url`, errors);
    const typeRaw = item.type;
    if (typeof typeRaw !== "string" || !MEDIA_TYPES.includes(typeRaw as MediaAsset["type"])) {
      errors.push(
        loadError(
          "HP_INVALID_TYPE",
          `media.type must be one of: ${MEDIA_TYPES.join(", ")}.`,
          `${path}.type`,
        ),
      );
      continue;
    }
    if (id === undefined || title === undefined || url === undefined) {
      continue;
    }
    if (mediaIds.has(id)) {
      errors.push(
        loadError(
          "HP_DUPLICATE_ID",
          `Duplicate media id "${id}".`,
          `${path}.id`,
        ),
      );
      continue;
    }
    mediaIds.add(id);

    if (typeRaw === "video" && isWistiaUrl(url) && !isValidWistiaUrl(url)) {
      errors.push(
        loadError(
          "HP_INVALID_WISTIA",
          `Invalid Wistia reference "${url}".`,
          `${path}.url`,
        ),
      );
      continue;
    }

    media.push({
      id,
      type: typeRaw as MediaAsset["type"],
      title,
      url,
    });
  }

  let documents: readonly HouseDocument[] | undefined;
  if (value.documents !== undefined) {
    if (!Array.isArray(value.documents)) {
      errors.push(
        loadError(
          "HP_INVALID_TYPE",
          "documents must be an array when present.",
          "documents",
        ),
      );
    } else {
      const documentIds = new Set<string>();
      const parsed: HouseDocument[] = [];
      for (let i = 0; i < value.documents.length; i += 1) {
        const item = value.documents[i];
        const path = `documents[${i}]`;
        if (!isRecord(item)) {
          errors.push(
            loadError("HP_INVALID_TYPE", "Document must be an object.", path),
          );
          continue;
        }
        const id = requireString(item, "id", `${path}.id`, errors);
        const title = requireString(item, "title", `${path}.title`, errors);
        const url = requireString(item, "url", `${path}.url`, errors);
        if (id === undefined || title === undefined || url === undefined) {
          continue;
        }
        if (documentIds.has(id) || mediaIds.has(id) || roomIds.has(id)) {
          errors.push(
            loadError(
              "HP_DUPLICATE_ID",
              `Duplicate document id "${id}".`,
              `${path}.id`,
            ),
          );
          continue;
        }
        documentIds.add(id);
        parsed.push({ id, title, url });
      }
      documents = parsed;
    }
  }

  if (
    contentVersion === undefined ||
    identity.id === undefined ||
    identity.title === undefined ||
    identity.reference === undefined ||
    overview.price === undefined ||
    overview.usableArea === undefined ||
    overview.landArea === undefined ||
    overview.rooms === undefined ||
    overview.hasGarden === undefined ||
    location.city === undefined ||
    location.district === undefined ||
    metadata.energyClass === undefined ||
    metadata.construction === undefined
  ) {
    return { ok: false, errors };
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const housePackage: HousePackage = Object.freeze({
    identity: Object.freeze({
      id: identity.id,
      title: identity.title,
      reference: identity.reference,
    }),
    overview: Object.freeze({
      price: overview.price,
      usableArea: overview.usableArea,
      landArea: overview.landArea,
      rooms: overview.rooms,
      hasGarden: overview.hasGarden,
    }),
    location: Object.freeze({
      city: location.city,
      district: location.district,
    }),
    metadata: Object.freeze({
      energyClass: metadata.energyClass,
      construction: metadata.construction,
    }),
    rooms: Object.freeze(rooms.map((room) => Object.freeze({ ...room }))),
    media: Object.freeze(media.map((asset) => Object.freeze({ ...asset }))),
    ...(documents !== undefined
      ? {
          documents: Object.freeze(
            documents.map((doc) => Object.freeze({ ...doc })),
          ),
        }
      : {}),
  });

  // Satisfy TypeScript that contentVersion was read (manifest provenance; not on HousePackage).
  void contentVersion;
  void (value as HousePackageManifestJson);

  return { ok: true, package: housePackage };
}

/** Absolute http(s) or package-relative path without `..`. */
export function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function isWistiaUrl(url: string): boolean {
  return /wistia\.net/i.test(url);
}

export function isValidWistiaUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      /(^|\.)wistia\.net$/i.test(parsed.hostname) &&
      parsed.pathname.length > 1
    );
  } catch {
    return false;
  }
}

/**
 * Reject path escape. Returns normalized package-relative path using `/`.
 */
export function normalizePackageRelativePath(
  url: string,
): { ok: true; relativePath: string } | { ok: false; error: HousePackageLoadError } {
  if (url.includes("\0")) {
    return {
      ok: false,
      error: loadError("HP_ASSET_ESCAPE", "Path contains NUL.", url),
    };
  }
  const normalized = url.replace(/\\/g, "/");
  if (normalized.startsWith("/") || /^[a-zA-Z]:\//.test(normalized)) {
    return {
      ok: false,
      error: loadError(
        "HP_ASSET_ESCAPE",
        "Absolute filesystem paths are not allowed in package-relative urls.",
        url,
      ),
    };
  }
  const segments = normalized.split("/");
  if (segments.some((segment) => segment === "..")) {
    return {
      ok: false,
      error: loadError(
        "HP_ASSET_ESCAPE",
        "Path must not contain '..' segments.",
        url,
      ),
    };
  }
  return { ok: true, relativePath: normalized };
}
