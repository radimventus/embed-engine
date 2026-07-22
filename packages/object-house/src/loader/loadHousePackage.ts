import { access, readFile } from "node:fs/promises";
import path from "node:path";

import {
  loadError,
  type HousePackageLoadError,
  type HousePackageLoadResult,
} from "./errors";
import {
  isAbsoluteUrl,
  isValidWistiaUrl,
  isWistiaUrl,
  normalizePackageRelativePath,
  validateHousePackageManifest,
} from "./validate";
import type { HousePackage } from "../HousePackage";

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveRelativeAsset(
  packageRoot: string,
  url: string,
  jsonPath: string,
  missingCode: "HP_ASSET_MISSING" | "HP_DOCUMENT_MISSING",
): Promise<HousePackageLoadError | undefined> {
  const normalized = normalizePackageRelativePath(url);
  if (!normalized.ok) {
    return { ...normalized.error, path: jsonPath };
  }

  const absolute = path.resolve(packageRoot, normalized.relativePath);
  const rootResolved = path.resolve(packageRoot);
  if (
    absolute !== rootResolved &&
    !absolute.startsWith(rootResolved + path.sep)
  ) {
    return loadError(
      "HP_ASSET_ESCAPE",
      "Resolved path escapes package root.",
      jsonPath,
    );
  }

  if (!(await pathExists(absolute))) {
    return loadError(
      missingCode,
      `Referenced asset is missing: ${normalized.relativePath}`,
      jsonPath,
    );
  }

  return undefined;
}

async function resolveMediaUrls(
  packageRoot: string,
  house: HousePackage,
): Promise<{
  house: HousePackage;
  errors: HousePackageLoadError[];
}> {
  const errors: HousePackageLoadError[] = [];
  const media = [];

  for (let i = 0; i < house.media.length; i += 1) {
    const asset = house.media[i];
    const jsonPath = `media[${i}].url`;

    if (isAbsoluteUrl(asset.url)) {
      if (asset.type === "video" && isWistiaUrl(asset.url) && !isValidWistiaUrl(asset.url)) {
        errors.push(
          loadError(
            "HP_INVALID_WISTIA",
            `Invalid Wistia reference "${asset.url}".`,
            jsonPath,
          ),
        );
        continue;
      }
      media.push(asset);
      continue;
    }

    const missing = await resolveRelativeAsset(
      packageRoot,
      asset.url,
      jsonPath,
      "HP_ASSET_MISSING",
    );
    if (missing) {
      errors.push(missing);
      continue;
    }

    // Optional sidecar: relative *.txt whose contents are a Wistia URL.
    if (asset.type === "video" && asset.url.toLowerCase().endsWith(".txt")) {
      const relative = normalizePackageRelativePath(asset.url);
      if (!relative.ok) {
        errors.push({ ...relative.error, path: jsonPath });
        continue;
      }
      const absolute = path.resolve(packageRoot, relative.relativePath);
      const raw = (await readFile(absolute, "utf8")).trim();
      if (!isValidWistiaUrl(raw)) {
        errors.push(
          loadError(
            "HP_INVALID_WISTIA",
            `Wistia sidecar does not contain a valid HTTPS Wistia URL.`,
            jsonPath,
          ),
        );
        continue;
      }
      media.push(Object.freeze({ ...asset, url: raw }));
      continue;
    }

    media.push(asset);
  }

  const documents = [];
  if (house.documents) {
    for (let i = 0; i < house.documents.length; i += 1) {
      const doc = house.documents[i];
      const jsonPath = `documents[${i}].url`;
      if (isAbsoluteUrl(doc.url)) {
        documents.push(doc);
        continue;
      }
      const missing = await resolveRelativeAsset(
        packageRoot,
        doc.url,
        jsonPath,
        "HP_DOCUMENT_MISSING",
      );
      if (missing) {
        errors.push(missing);
        continue;
      }
      documents.push(doc);
    }
  }

  if (errors.length > 0) {
    return { house, errors };
  }

  const resolved: HousePackage = Object.freeze({
    ...house,
    media: Object.freeze(media.map((item) => Object.freeze({ ...item }))),
    ...(house.documents !== undefined
      ? {
          documents: Object.freeze(
            documents.map((item) => Object.freeze({ ...item })),
          ),
        }
      : {}),
  });

  return { house: resolved, errors: [] };
}

/**
 * Load a House Package from a package root directory.
 * Owns filesystem access — Runtime MUST NOT call this for decision logic I/O.
 */
export async function loadHousePackage(
  packageRootPath: string,
): Promise<HousePackageLoadResult> {
  const packageRoot = path.resolve(packageRootPath);
  const manifestPath = path.join(packageRoot, "house.json");

  if (!(await pathExists(manifestPath))) {
    return {
      ok: false,
      errors: [
        loadError(
          "HP_MISSING_MANIFEST",
          "house.json is missing at package root.",
          "house.json",
        ),
      ],
    };
  }

  let text: string;
  try {
    text = await readFile(manifestPath, "utf8");
  } catch (cause) {
    return {
      ok: false,
      errors: [
        loadError(
          "HP_MISSING_MANIFEST",
          `Unable to read house.json: ${cause instanceof Error ? cause.message : String(cause)}`,
          "house.json",
        ),
      ],
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch (cause) {
    return {
      ok: false,
      errors: [
        loadError(
          "HP_INVALID_JSON",
          `house.json is not valid JSON: ${cause instanceof Error ? cause.message : String(cause)}`,
          "house.json",
        ),
      ],
    };
  }

  const validated = validateHousePackageManifest(parsed);
  if (!validated.ok) {
    return validated;
  }

  const resolved = await resolveMediaUrls(packageRoot, validated.package);
  if (resolved.errors.length > 0) {
    return { ok: false, errors: resolved.errors };
  }

  return { ok: true, package: resolved.house };
}

/**
 * Parse and validate house.json text without filesystem asset checks.
 * Useful for unit tests and non-Node hosts; does not resolve relative assets.
 */
export function parseHousePackageJson(text: string): HousePackageLoadResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch (cause) {
    return {
      ok: false,
      errors: [
        loadError(
          "HP_INVALID_JSON",
          `Invalid JSON: ${cause instanceof Error ? cause.message : String(cause)}`,
        ),
      ],
    };
  }
  return validateHousePackageManifest(parsed);
}
