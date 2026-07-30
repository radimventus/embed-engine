#!/usr/bin/env node
/**
 * HP-003 — publish floorplan geometry (+ optional raster) for a House Package root.
 *
 * Usage:
 *   pnpm --filter @embed-engine/object-house exec tsx ./scripts/publish-floorplan-geometry.mjs [packageRoot] [--write-raster]
 *
 * Default packageRoot: apps/client-studio/public/house-package
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { publishAllFloorPlanGeometry } from "../src/builder-package/publishFloorPlanGeometry.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");

const args = process.argv.slice(2);
const writeRaster = args.includes("--write-raster");
const positional = args.filter((a) => !a.startsWith("--"));
const packageRoot = path.resolve(
  positional[0] ??
    path.join(repoRoot, "apps/client-studio/public/house-package"),
);

const results = await publishAllFloorPlanGeometry(packageRoot, { writeRaster });
let failed = false;
for (const result of results) {
  if (result.ok) {
    console.log(
      `✓ ${result.geometry.floorId}: geometry → ${path.relative(repoRoot, result.geometryPath)}` +
        (result.rasterPath
          ? `; raster → ${path.relative(repoRoot, result.rasterPath)}`
          : ""),
    );
    for (const warning of result.warnings) {
      console.log(`  ⚠ ${warning}`);
    }
  } else {
    failed = true;
    console.error("✗ publish failed:");
    for (const err of result.errors) {
      console.error(`  ${err.code}: ${err.message}${err.path ? ` (${err.path})` : ""}`);
    }
  }
}

if (failed) {
  process.exit(1);
}
console.log("HP-003 floorplan geometry publish PASS");
