import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, cp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  BUILDER_PACKAGE_FORMAT,
  importBuilderHousePackage,
  parseCsv,
} from "./index";

const fixtureRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures/minimal-house-package",
);

async function copyFixture(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "bp-hp-"));
  await cp(fixtureRoot, dir, { recursive: true });
  return dir;
}

describe("parseCsv", () => {
  it("parses headers and rows without using filename order", () => {
    const table = parseCsv("order,room,file\n2,kitchen,02.jpg\n1,exterior,01.jpg\n");
    assert.deepEqual(table.headers, ["order", "room", "file"]);
    assert.equal(table.rows.length, 2);
    assert.equal(table.rows[0]?.order, "2");
    assert.equal(table.rows[1]?.order, "1");
  });
});

describe("importBuilderHousePackage", () => {
  it("imports fixture and generates all Runtime registries", async () => {
    const result = await importBuilderHousePackage(fixtureRoot);
    assert.equal(result.ok, true);
    if (!result.ok) {
      assert.fail(JSON.stringify(result.errors));
    }

    const { hero, gallery, rooms, floors, svg, videos, manifest } = result.result;

    assert.equal(manifest.packageFormat, BUILDER_PACKAGE_FORMAT);
    assert.equal(hero.entries.length, 1);
    assert.equal(hero.entries[0]?.file, "hero.jpg");
    assert.equal(hero.entries[0]?.path, "hero/hero.jpg");

    assert.deepEqual(
      gallery.entries.map((e) => e.order),
      [1, 2, 3],
    );
    assert.equal(gallery.entries[0]?.roomId, "exterior");
    assert.equal(gallery.entries[2]?.file, "03.jpg");

    assert.equal(rooms.rooms.length, 4);
    assert.equal(rooms.rooms.find((r) => r.roomId === "kitchen")?.name, "Kuchyně");

    assert.deepEqual(
      floors.floors.map((f) => f.floorId),
      ["P1", "P2"],
    );
    assert.equal(floors.floors[0]?.planPng, "plans/P1.png");
    assert.equal(floors.floors[0]?.planSvg, "plans/P1.svg");

    assert.equal(svg.entries.length, 2);
    assert.equal(svg.entries[0]?.path, "plans/P1.svg");

    assert.equal(videos.entries.length, 2);
    assert.equal(videos.entries[0]?.provider, "wistia");
    assert.equal(videos.entries[1]?.mediaId, "ab12cd34");

    // Hero is not part of gallery
    assert.equal(
      gallery.entries.some((e) => e.path.includes("hero/")),
      false,
    );
  });

  it("orders gallery strictly by CSV order, not filename", async () => {
    const dir = await copyFixture();
    await writeFile(
      path.join(dir, "gallery.csv"),
      "order,room,file\n10,kitchen,01.jpg\n1,exterior,03.jpg\n5,living-room,02.jpg\n",
    );

    const result = await importBuilderHousePackage(dir);
    assert.equal(result.ok, true);
    if (!result.ok) {
      assert.fail(JSON.stringify(result.errors));
    }

    assert.deepEqual(
      result.result.gallery.entries.map((e) => ({
        order: e.order,
        file: e.file,
      })),
      [
        { order: 1, file: "03.jpg" },
        { order: 5, file: "02.jpg" },
        { order: 10, file: "01.jpg" },
      ],
    );
  });

  it("fails on unknown room reference", async () => {
    const dir = await copyFixture();
    await writeFile(
      path.join(dir, "gallery.csv"),
      "order,room,file\n1,not-a-room,01.jpg\n",
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

  it("fails when plan PNG/SVG pair is incomplete", async () => {
    const dir = await copyFixture();
    await mkdir(path.join(dir, "plans"), { recursive: true });
    await writeFile(path.join(dir, "plans", "P3.png"), "x");

    const result = await importBuilderHousePackage(dir);
    assert.equal(result.ok, false);
    if (result.ok) {
      assert.fail("expected failure");
    }
    assert.equal(
      result.errors.some((e) => e.code === "BP_PLAN_INCOMPLETE"),
      true,
    );
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
