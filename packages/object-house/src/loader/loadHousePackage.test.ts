import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { projectHouse } from "../projectHouse";
import {
  loadHousePackage,
  normalizePackageRelativePath,
  validateHousePackageManifest,
} from "./index";

const referenceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../reference-house",
);

function minimalManifest(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    packageFormat: "house-package",
    schemaVersion: "0.1",
    contentVersion: "1.0.0",
    identity: { id: "h", title: "t", reference: "r" },
    overview: {
      price: 1,
      usableArea: 1,
      landArea: 1,
      rooms: 0,
      hasGarden: false,
    },
    location: { city: "c", district: "d" },
    metadata: { energyClass: "A", construction: "x" },
    rooms: [],
    media: [],
    ...overrides,
  };
}

describe("loadHousePackage", () => {
  it("loads Reference House Package as immutable HousePackage", async () => {
    const result = await loadHousePackage(referenceRoot);
    assert.equal(result.ok, true);
    if (!result.ok) {
      assert.fail(JSON.stringify(result.errors));
    }

    assert.equal(result.package.identity.id, "house-modern-01");
    assert.equal(result.package.rooms.length, 8);
    assert.equal(result.package.media[0]?.id, "hero-image");
    assert.equal(result.package.documents?.[0]?.id, "technical-document");
    assert.throws(() => {
      (result.package.identity as { id: string }).id = "mutated";
    });
  });

  it("returns HP_MISSING_MANIFEST when house.json is absent", async () => {
    const result = await loadHousePackage(path.join(referenceRoot, "assets"));
    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.equal(result.errors[0]?.code, "HP_MISSING_MANIFEST");
  });

  it("returns HP_ASSET_MISSING for absent relative media", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "hp-missing-asset-"));
    await writeFile(
      path.join(root, "house.json"),
      JSON.stringify(
        minimalManifest({
          media: [
            {
              id: "missing",
              type: "image",
              title: "Missing",
              url: "assets/gone.webp",
            },
          ],
        }),
      ),
      "utf8",
    );

    const result = await loadHousePackage(root);
    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.errors.some((error) => error.code === "HP_ASSET_MISSING"));
  });

  it("returns HP_DOCUMENT_MISSING for absent document", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "hp-missing-doc-"));
    await mkdir(path.join(root, "assets"), { recursive: true });
    await writeFile(
      path.join(root, "house.json"),
      JSON.stringify(
        minimalManifest({
          documents: [
            {
              id: "technical-document",
              title: "Doc",
              url: "assets/missing.pdf",
            },
          ],
        }),
      ),
      "utf8",
    );

    const result = await loadHousePackage(root);
    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(
      result.errors.some((error) => error.code === "HP_DOCUMENT_MISSING"),
    );
  });

  it("resolves Wistia sidecar .txt to absolute embed URL", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "hp-wistia-"));
    await mkdir(path.join(root, "assets/video"), { recursive: true });
    await writeFile(
      path.join(root, "assets/video/wistia.txt"),
      "https://fast.wistia.net/embed/iframe/sxe3yw702e",
      "utf8",
    );
    await writeFile(
      path.join(root, "house.json"),
      JSON.stringify(
        minimalManifest({
          media: [
            {
              id: "intro-video",
              type: "video",
              title: "Intro",
              url: "assets/video/wistia.txt",
            },
          ],
        }),
      ),
      "utf8",
    );

    const result = await loadHousePackage(root);
    assert.equal(result.ok, true);
    if (!result.ok) {
      assert.fail(JSON.stringify(result.errors));
    }
    assert.equal(
      result.package.media[0]?.url,
      "https://fast.wistia.net/embed/iframe/sxe3yw702e",
    );
  });
});

describe("validateHousePackageManifest", () => {
  it("rejects duplicate RoomId", () => {
    const result = validateHousePackageManifest(
      minimalManifest({
        rooms: [
          { id: "room-a", name: "A", area: 1, floor: 0 },
          { id: "room-a", name: "B", area: 1, floor: 0 },
        ],
      }),
    );
    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.errors.some((error) => error.code === "HP_DUPLICATE_ID"));
  });

  it("rejects invalid Wistia URL", () => {
    const result = validateHousePackageManifest(
      minimalManifest({
        media: [
          {
            id: "intro-video",
            type: "video",
            title: "Bad",
            url: "https://fast.wistia.net/",
          },
        ],
      }),
    );
    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(
      result.errors.some((error) => error.code === "HP_INVALID_WISTIA"),
    );
  });

  it("rejects path escape segments", () => {
    const escaped = normalizePackageRelativePath("../secret.png");
    assert.equal(escaped.ok, false);
    if (escaped.ok) {
      return;
    }
    assert.equal(escaped.error.code, "HP_ASSET_ESCAPE");
  });
});

describe("projection boundary", () => {
  it("HousePackage → projectHouse → ExperienceHouse (no identity/overview leak)", async () => {
    const loaded = await loadHousePackage(referenceRoot);
    assert.equal(loaded.ok, true);
    if (!loaded.ok) {
      return;
    }
    const experience = projectHouse(loaded.package);
    assert.ok(experience);
    assert.equal(experience?.id, "house-modern-01");
    assert.equal(
      Object.prototype.hasOwnProperty.call(experience, "identity"),
      false,
    );
  });
});
