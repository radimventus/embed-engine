import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, cp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  BUILDER_PACKAGE_FORMAT,
  buildBuilderPackageRegistries,
  importBuilderHousePackage,
  initializeBuilderHousePackage,
  parseCsv,
  resolveBuilderHousePackageRoot,
} from "./node";

const fixtureRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures/minimal-house-package",
);

async function copyFixture(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "bp-hp-"));
  await cp(fixtureRoot, dir, { recursive: true });
  return dir;
}

async function createEmptyAuthoringDraft(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "bp-draft-"));
  await writeFile(path.join(dir, "rooms.csv"), "floor,room,name,area\n");
  await writeFile(path.join(dir, "gallery.csv"), "order,room,file\n");
  await writeFile(
    path.join(dir, "videos.csv"),
    "order,room,provider,mediaId\n",
  );
  return dir;
}

describe("parseCsv", () => {
  it("parses headers and rows without using filename order", () => {
    const table = parseCsv("order,room,file\n2,kitchen,02.webp\n1,exterior,01.webp\n");
    assert.deepEqual(table.headers, ["order", "room", "file"]);
    assert.equal(table.rows.length, 2);
    assert.equal(table.rows[0]?.order, "2");
    assert.equal(table.rows[1]?.order, "1");
  });
});

describe("buildBuilderPackageRegistries", () => {
  it("orders gallery strictly by CSV order", () => {
    const result = buildBuilderPackageRegistries({
      packageRoot: "/virtual",
      roomsCsv: "floor,room,name,area\np1,exterior,Exteriér,0\np1,kitchen,Kuchyně,14\n",
      galleryCsv: "order,room,file\n10,kitchen,01.webp\n1,exterior,03.webp\n5,kitchen,02.webp\n",
      videosCsv: "order,room,provider,mediaId\n1,exterior,wistia,abc\n",
      heroPath: "media/hero/hero.webp",
      planPairs: [
        {
          floorId: "p1",
          rasterRelativePath: "media/plans/p1.webp",
          svgRelativePath: "media/plans/p1.svg",
        },
      ],
    });
    assert.equal(result.ok, true);
    if (!result.ok) {
      assert.fail(JSON.stringify(result.errors));
    }
    assert.deepEqual(
      result.result.gallery.entries.map((e) => ({ order: e.order, file: e.file })),
      [
        { order: 1, file: "03.webp" },
        { order: 5, file: "02.webp" },
        { order: 10, file: "01.webp" },
      ],
    );
  });
});

describe("importBuilderHousePackage", () => {
  it("initializes isolated, idempotent AUTHORING_DRAFT roots", async () => {
    const repoRoot = await mkdtemp(path.join(tmpdir(), "bp-repo-"));
    const first = await initializeBuilderHousePackage({
      repoRoot,
      houseId: "test-5kk",
    });

    assert.deepEqual(first, {
      ok: true,
      created: true,
      houseId: "test-5kk",
      packageRoot: resolveBuilderHousePackageRoot("test-5kk"),
    });
    if (!first.ok) {
      assert.fail(first.error);
    }

    const firstRoot = path.join(repoRoot, first.packageRoot);
    assert.equal(
      await readFile(path.join(firstRoot, "rooms.csv"), "utf8"),
      "floor,room,name,area\n",
    );
    assert.equal(
      await readFile(path.join(firstRoot, "gallery.csv"), "utf8"),
      "order,room,file\n",
    );
    assert.equal(
      await readFile(path.join(firstRoot, "videos.csv"), "utf8"),
      "order,room,provider,mediaId\n",
    );
    const publishReady = await importBuilderHousePackage(firstRoot);
    assert.equal(publishReady.ok, false);

    const repeated = await initializeBuilderHousePackage({
      repoRoot,
      houseId: "test-5kk",
    });
    assert.deepEqual(repeated, {
      ok: true,
      created: false,
      houseId: "test-5kk",
      packageRoot: first.packageRoot,
    });
    await writeFile(path.join(firstRoot, "rooms.csv"), "floor,room,name,area\n\n");
    const preserved = await initializeBuilderHousePackage({
      repoRoot,
      houseId: "test-5kk",
    });
    assert.equal(preserved.ok, true);
    assert.equal(
      await readFile(path.join(firstRoot, "rooms.csv"), "utf8"),
      "floor,room,name,area\n\n",
    );

    const second = await initializeBuilderHousePackage({
      repoRoot,
      houseId: "test-6kk",
    });
    assert.equal(second.ok, true);
    if (!second.ok) {
      assert.fail(second.error);
    }
    assert.notEqual(first.packageRoot, second.packageRoot);
    assert.equal(
      await readFile(path.join(repoRoot, second.packageRoot, "rooms.csv"), "utf8"),
      "floor,room,name,area\n",
    );
  });

  it("imports a schema-only AUTHORING_DRAFT with empty registries", async () => {
    const root = await createEmptyAuthoringDraft();

    const result = await importBuilderHousePackage(root, {
      validationMode: "AUTHORING_DRAFT",
    });

    assert.equal(result.ok, true);
    if (!result.ok) {
      assert.fail(JSON.stringify(result.errors));
    }
    assert.deepEqual(result.result.rooms.rooms, []);
    assert.deepEqual(result.result.gallery.entries, []);
    assert.deepEqual(result.result.videos.entries, []);
    assert.deepEqual(result.result.floors.floors, []);
    assert.deepEqual(result.result.hero.entries, []);
  });

  it("keeps PUBLISH_READY strict for the same empty draft", async () => {
    const root = await createEmptyAuthoringDraft();

    const result = await importBuilderHousePackage(root);

    assert.equal(result.ok, false);
    if (result.ok) {
      assert.fail("Expected PUBLISH_READY validation failure.");
    }
    assert.ok(result.errors.some((error) => error.code === "BP_MISSING_FILE"));
  });

  it("rejects malformed content supplied to an AUTHORING_DRAFT", async () => {
    const root = await createEmptyAuthoringDraft();
    await writeFile(
      path.join(root, "gallery.csv"),
      "order,room,file\n1,unknown,missing.webp\n",
    );

    const result = await importBuilderHousePackage(root, {
      validationMode: "AUTHORING_DRAFT",
    });

    assert.equal(result.ok, false);
    if (result.ok) {
      assert.fail("Expected malformed draft validation failure.");
    }
    assert.ok(result.errors.some((error) => error.code === "BP_UNKNOWN_ROOM"));
    assert.ok(result.errors.some((error) => error.code === "BP_ASSET_MISSING"));
  });

  it("imports fixture and generates all Runtime registries", async () => {
    const result = await importBuilderHousePackage(fixtureRoot);
    assert.equal(result.ok, true);
    if (!result.ok) {
      assert.fail(JSON.stringify(result.errors));
    }

    const { hero, gallery, rooms, floors, svg, videos, manifest } = result.result;

    assert.equal(manifest.packageFormat, BUILDER_PACKAGE_FORMAT);
    assert.equal(hero.entries.length, 1);
    assert.equal(hero.entries[0]?.path, "media/hero/hero.webp");

    assert.deepEqual(
      gallery.entries.map((e) => e.order),
      [1, 2, 3],
    );
    assert.equal(gallery.entries[0]?.roomId, "exterior");
    assert.equal(gallery.entries[0]?.path, "media/gallery/01.webp");

    assert.equal(rooms.rooms.length, 4);
    assert.equal(rooms.rooms.find((r) => r.roomId === "kitchen")?.name, "Kuchyně");

    assert.deepEqual(
      floors.floors.map((f) => f.floorId),
      ["p1", "p2"],
    );
    assert.equal(floors.floors[0]?.planPng, "media/plans/p1.webp");
    assert.equal(svg.entries[0]?.path, "media/plans/p1.author.svg");

    assert.equal(videos.entries.length, 2);
    assert.equal(videos.entries[0]?.provider, "wistia");

    assert.equal(
      gallery.entries.some((e) => e.path.includes("media/hero/")),
      false,
    );
  });

  it("fails on unknown room reference", async () => {
    const dir = await copyFixture();
    await writeFile(
      path.join(dir, "gallery.csv"),
      "order,room,file\n1,not-a-room,01.webp\n",
    );

    const result = await importBuilderHousePackage(dir);
    assert.equal(result.ok, false);
    if (result.ok) {
      assert.fail("expected failure");
    }
    assert.equal(
      result.errors.some((e) => e.code === "BP_UNKNOWN_ROOM"),
      true,
    );
  });

  it("fails when plan pair is incomplete", async () => {
    const dir = await copyFixture();
    await mkdir(path.join(dir, "media", "plans"), { recursive: true });
    await writeFile(path.join(dir, "media", "plans", "p3.webp"), "x");

    const result = await importBuilderHousePackage(dir);
    assert.equal(result.ok, false);
    if (result.ok) {
      assert.fail("expected failure");
    }
    assert.equal(
      result.errors.some(
        (e) =>
          e.code === "BP_PLAN_INCOMPLETE" ||
          e.code === "HP003_SVG_MISSING" ||
          e.code === "HP003_GEOMETRY_MISSING",
      ),
      true,
    );
  });

  it("fails when CSV room lacks geometry (HP-003)", async () => {
    const dir = await copyFixture();
    await writeFile(
      path.join(dir, "rooms.csv"),
      "floor,room,name,area\np1,exterior,Exteriér,0\np1,living-room,Obývací pokoj,32\np1,kitchen,Kuchyně,14\np1,office,Pracovna,12\np2,bedroom,Ložnice,18.4\n",
    );

    const result = await importBuilderHousePackage(dir);
    assert.equal(result.ok, false);
    if (result.ok) {
      assert.fail("expected failure");
    }
    assert.ok(result.errors.some((e) => e.code === "HP003_CSV_NO_GEOMETRY"));
  });

  it("fails when SVG room is unbound from CSV (HP-003)", async () => {
    const dir = await copyFixture();
    await writeFile(
      path.join(dir, "media", "plans", "p1.author.svg"),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" data-floor="p1" data-hp003="1">
  <rect data-room="living-room" x="10" y="10" width="40" height="30" />
  <rect data-room="kitchen" x="55" y="10" width="35" height="30" />
  <rect data-room="ghost-room" x="10" y="50" width="20" height="20" />
</svg>`,
    );

    const result = await importBuilderHousePackage(dir);
    assert.equal(result.ok, false);
    if (result.ok) {
      assert.fail("expected failure");
    }
    assert.ok(result.errors.some((e) => e.code === "HP003_ROOM_UNBOUND"));
  });

  it("fails on stub authoring SVG (HP-003)", async () => {
    const dir = await copyFixture();
    await writeFile(
      path.join(dir, "media", "plans", "p1.author.svg"),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" data-floor="p1" data-hp003="1"/>`,
    );

    const result = await importBuilderHousePackage(dir);
    assert.equal(result.ok, false);
    if (result.ok) {
      assert.fail("expected failure");
    }
    assert.ok(result.errors.some((e) => e.code === "HP003_SVG_EMPTY"));
  });

  it("fails when required CSV is missing", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "bp-empty-"));
    const result = await importBuilderHousePackage(dir);
    assert.equal(result.ok, false);
    if (result.ok) {
      assert.fail("expected failure");
    }
    assert.equal(
      result.errors.some((e) => e.code === "BP_MISSING_FILE"),
      true,
    );
  });
});
