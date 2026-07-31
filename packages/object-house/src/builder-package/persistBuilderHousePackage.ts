/**
 * CAP-BLD-04 — Atomic persistence of HP-002 authoring files (Node only).
 * Writes only provided files; never invents a parallel package format.
 */

import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

export type PersistBuilderHousePackageFiles = {
  /** When set, write package-root rooms.csv */
  readonly roomsCsv?: string;
  /** When set, write package-root gallery.csv */
  readonly galleryCsv?: string;
  /** When set, write package-root videos.csv */
  readonly videosCsv?: string;
  /**
   * When set (including empty string), write package-root manifest.json.
   * `null` skips (no delete in this CAP).
   */
  readonly manifestJson?: string | null;
};

export type PersistBuilderHousePackageInput = {
  readonly packageRoot: string;
  readonly files: PersistBuilderHousePackageFiles;
};

export type PersistBuilderHousePackageResult =
  | {
      readonly ok: true;
      readonly written: readonly string[];
    }
  | {
      readonly ok: false;
      readonly written: readonly [];
      readonly error: string;
    };

type PlannedWrite = {
  readonly relativePath: string;
  readonly contents: string;
};

function planWrites(
  files: PersistBuilderHousePackageFiles,
): readonly PlannedWrite[] {
  const planned: PlannedWrite[] = [];
  if (files.roomsCsv !== undefined) {
    planned.push({ relativePath: "rooms.csv", contents: files.roomsCsv });
  }
  if (files.galleryCsv !== undefined) {
    planned.push({ relativePath: "gallery.csv", contents: files.galleryCsv });
  }
  if (files.videosCsv !== undefined) {
    planned.push({ relativePath: "videos.csv", contents: files.videosCsv });
  }
  if (files.manifestJson !== undefined && files.manifestJson !== null) {
    planned.push({
      relativePath: "manifest.json",
      contents: files.manifestJson,
    });
  }
  return planned;
}

/**
 * Atomically persist HP-002 text files under packageRoot.
 *
 * Strategy:
 * 1. Stage all new contents under a unique staging directory
 * 2. Snapshot current targets into a backup directory
 * 3. Rename staged files over targets (same-filesystem atomic replace)
 * 4. On any failure after backups exist, restore backups and remove staging
 * 5. On success, remove staging + backup
 *
 * If staging fails, nothing in packageRoot is modified.
 */
export async function persistBuilderHousePackage(
  input: PersistBuilderHousePackageInput,
): Promise<PersistBuilderHousePackageResult> {
  const planned = planWrites(input.files);
  if (planned.length === 0) {
    return { ok: true, written: [] };
  }

  const token = randomBytes(8).toString("hex");
  const stagingDir = path.join(
    input.packageRoot,
    `.hp-persist-staging-${token}`,
  );
  const backupDir = path.join(
    input.packageRoot,
    `.hp-persist-backup-${token}`,
  );

  const writtenRelative: string[] = [];

  try {
    await mkdir(stagingDir, { recursive: true });
    await mkdir(backupDir, { recursive: true });

    for (const item of planned) {
      const stagedPath = path.join(stagingDir, item.relativePath);
      await mkdir(path.dirname(stagedPath), { recursive: true });
      await writeFile(stagedPath, item.contents, "utf8");
    }

    for (const item of planned) {
      const targetPath = path.join(input.packageRoot, item.relativePath);
      const backupPath = path.join(backupDir, item.relativePath);
      try {
        const existing = await readFile(targetPath);
        await mkdir(path.dirname(backupPath), { recursive: true });
        await writeFile(backupPath, existing);
      } catch {
        // Target may not exist yet — no backup needed.
      }
    }

    for (const item of planned) {
      const stagedPath = path.join(stagingDir, item.relativePath);
      const targetPath = path.join(input.packageRoot, item.relativePath);
      await mkdir(path.dirname(targetPath), { recursive: true });
      await rename(stagedPath, targetPath);
      writtenRelative.push(item.relativePath);
    }

    await rm(stagingDir, { recursive: true, force: true });
    await rm(backupDir, { recursive: true, force: true });

    return { ok: true, written: writtenRelative };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "House Package persist failed.";

    try {
      for (const item of planned) {
        const backupPath = path.join(backupDir, item.relativePath);
        const targetPath = path.join(input.packageRoot, item.relativePath);
        try {
          const backup = await readFile(backupPath);
          await writeFile(targetPath, backup);
        } catch {
          // No backup ⇒ file was new; remove partial write if present.
          await rm(targetPath, { force: true }).catch(() => undefined);
        }
      }
    } catch {
      // Best-effort restore; surface original error.
    }

    await rm(stagingDir, { recursive: true, force: true }).catch(() => undefined);
    await rm(backupDir, { recursive: true, force: true }).catch(() => undefined);

    return { ok: false, written: [], error: message };
  }
}
