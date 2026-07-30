import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { extractFloorPlanGeometryFromSvg } from "./extractFloorPlanGeometry";
import { validateFloorPlanGeometryAgainstRooms } from "./validateFloorPlanGeometry";

const SAMPLE = `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" data-floor="p1" data-hp003="1">
  <rect data-room="living-room" x="10" y="10" width="80" height="40" />
  <polygon data-room="kitchen" points="100,10 180,10 180,50 100,50" />
</svg>`;

describe("HP-003 extractFloorPlanGeometryFromSvg", () => {
  it("extracts rect and polygon rooms with bbox + polygon", () => {
    const result = extractFloorPlanGeometryFromSvg(SAMPLE, "p1");
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }
    assert.equal(result.geometry.floorId, "p1");
    assert.deepEqual(result.geometry.viewBox, { width: 200, height: 100 });
    assert.equal(result.geometry.rooms.length, 2);
    const living = result.geometry.rooms.find((r) => r.roomId === "living-room");
    assert.ok(living);
    assert.deepEqual(living!.bbox, { x: 10, y: 10, width: 80, height: 40 });
  });

  it("fails on stub SVG without data-room", () => {
    const result = extractFloorPlanGeometryFromSvg(
      `<svg viewBox="0 0 100 100" data-floor="p1" data-hp003="1"/>`,
      "p1",
    );
    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.ok(result.errors.some((e) => e.code === "HP003_SVG_EMPTY"));
  });

  it("fails when geometry room missing from CSV (area>0)", () => {
    const extracted = extractFloorPlanGeometryFromSvg(SAMPLE, "p1");
    assert.equal(extracted.ok, true);
    if (!extracted.ok) {
      return;
    }
    const errors = validateFloorPlanGeometryAgainstRooms({
      geometry: extracted.geometry,
      rooms: [
        { floor: "p1", room: "living-room", name: "L", area: 32 },
        { floor: "p1", room: "office", name: "O", area: 12 },
      ],
    });
    assert.ok(errors.some((e) => e.code === "HP003_CSV_NO_GEOMETRY"));
  });

  it("fails when geometry room not in CSV", () => {
    const extracted = extractFloorPlanGeometryFromSvg(SAMPLE, "p1");
    assert.equal(extracted.ok, true);
    if (!extracted.ok) {
      return;
    }
    const errors = validateFloorPlanGeometryAgainstRooms({
      geometry: extracted.geometry,
      rooms: [{ floor: "p1", room: "living-room", name: "L", area: 32 }],
    });
    assert.ok(errors.some((e) => e.code === "HP003_ROOM_UNBOUND"));
  });
});
