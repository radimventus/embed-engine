import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { persistBuilderHousePackage } from "./persistBuilderHousePackage";

describe("persistBuilderHousePackage (CAP-BLD-04)", () => {
  it("writes only provided HP-002 files", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "hp-persist-"));
    await writeFile(path.join(dir, "rooms.csv"), "floor,room,name,area\n");
    await writeFile(path.join(dir, "gallery.csv"), "order,room,file\n");

    const result = await persistBuilderHousePackage({
      packageRoot: dir,
      files: {
        roomsCsv: "floor,room,name,area\np1,kitchen,Kuchyně,14\n",
        videosCsv: "order,room,provider,mediaId\n1,kitchen,wistia,x\n",
      },
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual([...result.written].sort(), ["rooms.csv", "videos.csv"]);
    assert.match(
      await readFile(path.join(dir, "rooms.csv"), "utf8"),
      /Kuchyně/,
    );
    assert.match(
      await readFile(path.join(dir, "videos.csv"), "utf8"),
      /wistia/,
    );
    assert.equal(
      await readFile(path.join(dir, "gallery.csv"), "utf8"),
      "order,room,file\n",
    );
  });

  it("leaves package unchanged when there is nothing to write", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "hp-persist-empty-"));
    await writeFile(path.join(dir, "rooms.csv"), "KEEP\n");
    const result = await persistBuilderHousePackage({
      packageRoot: dir,
      files: {},
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(result.written, []);
    assert.equal(await readFile(path.join(dir, "rooms.csv"), "utf8"), "KEEP\n");
  });
});
