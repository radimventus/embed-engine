import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

import { importBuilderHousePackage } from "./importBuilderHousePackage";
import { persistBuilderHousePackage } from "./persistBuilderHousePackage";

export const BUILDER_HOUSE_PACKAGE_ROOT =
  "apps/client-studio/public/house-packages" as const;

const EMPTY_DRAFT_FILES = {
  roomsCsv: "floor,room,name,area\n",
  galleryCsv: "order,room,file\n",
  videosCsv: "order,room,provider,mediaId\n",
} as const;

export type InitializeBuilderHousePackageInput = {
  readonly repoRoot: string;
  readonly houseId: string;
};

export type InitializeBuilderHousePackageResult =
  | {
      readonly ok: true;
      readonly created: boolean;
      readonly houseId: string;
      /** Repository-relative root suitable for Builder's existing Vite host. */
      readonly packageRoot: string;
    }
  | {
      readonly ok: false;
      readonly error: string;
    };

function isSafeHouseId(houseId: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(houseId);
}

export function resolveBuilderHousePackageRoot(houseId: string): string {
  const normalizedHouseId = houseId.trim();
  if (!isSafeHouseId(normalizedHouseId)) {
    throw new Error(`Invalid canonical House id "${houseId}".`);
  }
  return `${BUILDER_HOUSE_PACKAGE_ROOT}/${normalizedHouseId}`;
}

/**
 * Allocates a House-owned, schema-only HP-002 AUTHORING_DRAFT package.
 * Existing packages are validated and never overwritten.
 */
export async function initializeBuilderHousePackage(
  input: InitializeBuilderHousePackageInput,
): Promise<InitializeBuilderHousePackageResult> {
  const houseId = input.houseId.trim();
  let packageRoot: string;
  try {
    packageRoot = resolveBuilderHousePackageRoot(houseId);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Invalid canonical House id.",
    };
  }

  const diskRoot = path.resolve(input.repoRoot, packageRoot);
  try {
    await mkdir(path.dirname(diskRoot), { recursive: true });
    await mkdir(diskRoot);
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "EEXIST")) {
      return {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "House Package initialization failed.",
      };
    }

    const existing = await importBuilderHousePackage(diskRoot, {
      validationMode: "AUTHORING_DRAFT",
    });
    return existing.ok
      ? { ok: true, created: false, houseId, packageRoot }
      : {
          ok: false,
          error: `Existing House Package is invalid: ${existing.errors
            .map((item) => item.message)
            .join(" ")}`,
        };
  }

  const persisted = await persistBuilderHousePackage({
    packageRoot: diskRoot,
    files: EMPTY_DRAFT_FILES,
  });
  if (!persisted.ok) {
    await rm(diskRoot, { recursive: true, force: true });
    return { ok: false, error: persisted.error };
  }

  const initialized = await importBuilderHousePackage(diskRoot, {
    validationMode: "AUTHORING_DRAFT",
  });
  if (!initialized.ok) {
    await rm(diskRoot, { recursive: true, force: true });
    return {
      ok: false,
      error: `Initialized House Package is invalid: ${initialized.errors
        .map((item) => item.message)
        .join(" ")}`,
    };
  }

  return { ok: true, created: true, houseId, packageRoot };
}
