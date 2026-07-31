/**
 * PT-DEPLOY-EMBED-01 — Runtime smoke after Embed distribution build.
 *
 * Verifies Builder → HousePackage projection (same path Embed/CS use) and that
 * the built IIFE carries the build fingerprint + Runtime source marker.
 * Does not change Runtime / Provider / Experience.
 */

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  assertFileContains,
  packageDir,
  readFingerprint,
  repoRoot,
  RUNTIME_HOUSE_PACKAGE_SOURCE,
} from "./lib/buildFingerprint.mjs";

const housePackageRoot = path.join(
  repoRoot,
  "apps/client-studio/public/house-package",
);
const distIife = path.join(packageDir, "dist/embed.iife.js");
const distEsm = path.join(packageDir, "dist/embed.es.js");

function readCsv(name) {
  const filePath = path.join(housePackageRoot, name);
  if (!existsSync(filePath)) {
    throw new Error(`Smoke: missing ${filePath}`);
  }
  return readFileSync(filePath, "utf8");
}

function planPairsFromRooms(roomsCsvText, parseCsv) {
  const table = parseCsv(roomsCsvText);
  const floors = new Set();
  for (const row of table.rows) {
    const floor = row.floor?.trim();
    if (floor) floors.add(floor);
  }
  return [...floors]
    .sort((a, b) => a.localeCompare(b, "en"))
    .map((floorId) => ({
      floorId,
      rasterRelativePath: `media/plans/${floorId}.webp`,
      svgRelativePath: `media/plans/${floorId}.svg`,
    }));
}

async function loadBuilderPackageApi() {
  const { register } = await import("tsx/esm/api");
  register();
  return import(
    pathToFileURL(
      path.join(repoRoot, "packages/object-house/src/builder-package/index.ts"),
    ).href
  );
}

async function main() {
  const fingerprint = readFingerprint();
  console.log("→ Runtime smoke (PT-DEPLOY-EMBED-01)");

  for (const file of [distIife, distEsm]) {
    if (!existsSync(file)) {
      throw new Error(`Smoke: missing built artifact ${file}`);
    }
    assertFileContains(file, fingerprint.marker, "fingerprint marker");
    assertFileContains(file, RUNTIME_HOUSE_PACKAGE_SOURCE, "Runtime source");
    assertFileContains(file, fingerprint.commit, "build commit");
  }

  const {
    buildBuilderPackageRegistries,
    parseCsv,
    projectBuilderImportToHousePackage,
    RUNTIME_HOUSE_PACKAGE_SOURCE: sourceFromPackage,
  } = await loadBuilderPackageApi();

  if (sourceFromPackage !== RUNTIME_HOUSE_PACKAGE_SOURCE) {
    throw new Error(
      `Smoke: object-house Runtime source mismatch: ${sourceFromPackage}`,
    );
  }

  const galleryCsv = readCsv("gallery.csv");
  const roomsCsv = readCsv("rooms.csv");
  const videosCsv = readCsv("videos.csv");

  const built = buildBuilderPackageRegistries({
    packageRoot: "/house-package",
    galleryCsv,
    roomsCsv,
    videosCsv,
    heroPath: "media/hero/hero.webp",
    planPairs: planPairsFromRooms(roomsCsv, parseCsv),
  });

  if (!built.ok) {
    const detail = built.errors.map((e) => `${e.code}: ${e.message}`).join("; ");
    throw new Error(`Smoke: Builder import failed: ${detail}`);
  }

  const housePackage = projectBuilderImportToHousePackage(built.result, {
    identity: {
      id: "house-modern-01",
      title: "Modern 01",
      reference: "ASTAV-M01",
    },
    overview: {
      price: 6_900_000,
      usableArea: 142,
      landArea: 620,
      hasGarden: true,
    },
    location: { city: "Praha", district: "Západ" },
    metadata: { energyClass: "B", construction: "Zděná" },
    packagePublicRoot: "/house-package",
  });

  const roomIds = housePackage.rooms.map((room) => room.id).sort();
  const expectedRoomIds = [
    "bathroom",
    "bedroom",
    "children-room",
    "exterior",
    "kitchen",
    "living-room",
    "office",
    "technical-room",
    "toilet",
    "vestibule",
    "wardrobe",
  ];
  if (JSON.stringify(roomIds) !== JSON.stringify(expectedRoomIds)) {
    throw new Error(
      `Smoke: expected ${expectedRoomIds.length} rooms [${expectedRoomIds.join(",")}]\n` +
        `  got ${roomIds.length}: [${roomIds.join(",")}]`,
    );
  }

  const exteriorGallery = housePackage.media
    .filter((asset) => asset.id.startsWith("gallery:exterior:"))
    .map((asset) => asset.url)
    .sort();

  const expectedExterior = [
    "/house-package/media/gallery/01.webp",
    "/house-package/media/gallery/02.webp",
    "/house-package/media/gallery/03.webp",
  ];
  if (JSON.stringify(exteriorGallery) !== JSON.stringify(expectedExterior)) {
    throw new Error(
      `Smoke: exterior gallery mismatch\n  got: ${exteriorGallery.join(", ")}\n  expected: ${expectedExterior.join(", ")}`,
    );
  }

  const hero = housePackage.media.find((asset) => asset.id === "hero");
  if (!hero || !hero.url.includes("/house-package/media/hero/hero.webp")) {
    throw new Error(`Smoke: hero missing or unexpected URL: ${hero?.url ?? "null"}`);
  }

  console.log(`  Runtime source: ${RUNTIME_HOUSE_PACKAGE_SOURCE}`);
  console.log(`  Rooms: ${roomIds.length}`);
  console.log(`  Navigation: ${roomIds.length} (HousePackage.rooms)`);
  console.log(`  Gallery: exterior 01 02 03`);
  console.log(`  Hero: ${hero.url}`);
  console.log(`  Fingerprint: ${fingerprint.commit} @ ${fingerprint.builtAt}`);
  console.log("Runtime smoke PASS");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
