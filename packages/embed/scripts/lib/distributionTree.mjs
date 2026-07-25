/**
 * SSOT — single Embed distribution directory.
 *
 * Package consumers see `packages/embed/dist`.
 * GitHub Pages serves `docs/embed`.
 * Those MUST be the same inode tree (symlink), never two copies.
 */

import {
  existsSync,
  lstatSync,
  mkdirSync,
  realpathSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import path from "node:path";

import { packageDir, repoRoot } from "./buildFingerprint.mjs";

/** Canonical publish tree (GitHub Pages /docs). */
export const pagesDir = path.join(repoRoot, "docs/embed");

/** Package entry path — always a symlink to pagesDir after ensure. */
export const distDir = path.join(packageDir, "dist");

/**
 * Make packages/embed/dist → docs/embed (relative symlink).
 * Removes a real dist directory if present (legacy dual-tree).
 */
export function ensureSingleDistributionTree() {
  mkdirSync(pagesDir, { recursive: true });

  if (existsSync(distDir)) {
    const stat = lstatSync(distDir);
    if (stat.isSymbolicLink()) {
      const resolved = realpathSync(distDir);
      const pagesResolved = realpathSync(pagesDir);
      if (resolved === pagesResolved) {
        return;
      }
      rmSync(distDir, { force: true });
    } else {
      // Legacy second tree — discard; Pages tree is the source of truth.
      rmSync(distDir, { recursive: true, force: true });
    }
  }

  const relative = path.relative(path.dirname(distDir), pagesDir);
  symlinkSync(relative, distDir);
}

/** Fail if dist and pages are not the same physical tree. */
export function assertSingleDistributionTree() {
  if (!existsSync(distDir)) {
    throw new Error(
      "packages/embed/dist missing — run embed build (creates symlink to docs/embed)",
    );
  }
  if (!lstatSync(distDir).isSymbolicLink()) {
    throw new Error(
      "packages/embed/dist must be a symlink to docs/embed (dual tree forbidden)",
    );
  }
  if (realpathSync(distDir) !== realpathSync(pagesDir)) {
    throw new Error(
      "packages/embed/dist does not resolve to docs/embed — dual distribution tree",
    );
  }
}
