import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { publishFloorPlanGeometry } from "./node";

describe("generateAuthorSvgFromRoomSvgs", () => {
  it("builds p1.author.svg from room SVG inputs during publish", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "hp003-room-svg-"));
    await mkdir(path.join(dir, "media", "plans", "p1.rooms"), { recursive: true });
    await writeFile(
      path.join(dir, "rooms.csv"),
      "floor,room,name,area\np1,living-room,Obývací pokoj,32\np1,kitchen,Kuchyně,14\n",
    );
    await writeFile(path.join(dir, "gallery.csv"), "order,room,file\n1,living-room,01.webp\n");
    await writeFile(
      path.join(dir, "videos.csv"),
      "order,room,provider,mediaId\n1,living-room,wistia,abc\n",
    );
    await writeFile(
      path.join(dir, "media", "plans", "p1.rooms", "room-living-room.svg"),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80">
  <rect x="10" y="10" width="40" height="30" />
</svg>`,
    );
    await writeFile(
      path.join(dir, "media", "plans", "p1.rooms", "room-kitchen.svg"),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80">
  <polygon points="55,10 90,10 90,40 55,40" />
</svg>`,
    );

    const result = await publishFloorPlanGeometry({ packageRoot: dir, floorId: "p1" });
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }

    const authorSvg = await readFile(
      path.join(dir, "media", "plans", "p1.author.svg"),
      "utf8",
    );
    const geometry = JSON.parse(
      await readFile(path.join(dir, "media", "plans", "p1.geometry.json"), "utf8"),
    ) as { floorId: string; rooms: readonly unknown[] };

    assert.match(authorSvg, /Generated from media\/plans\/p1\.rooms\/room-\*\.svg/);
    assert.match(authorSvg, /data-room="kitchen"/);
    assert.match(authorSvg, /data-room="living-room"/);
    assert.equal(geometry.floorId, "p1");
    assert.equal(geometry.rooms.length, 2);
    assert.ok(
      result.warnings.some((warning) => warning.includes("Generated media/plans/p1.author.svg")),
    );
  });
});
