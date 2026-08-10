/**
 * PT-PDM-03 — Public Builder House Package projection (sync path for tests).
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { projectPublicBuilderHousePackageFromCsvTexts } from "./loadPublicBuilderHousePackage";

const MIN_GALLERY = `order,room,file
1,living-room,01.webp
`;

const MIN_ROOMS = `floor,room,name,area
p1,living-room,Obývací pokoj,28
`;

const MIN_VIDEOS = `order,room,provider,mediaId
1,living-room,wistia,demo123
`;

describe("loadPublicBuilderHousePackage (sync projection)", () => {
  it("projects identity from Shared Project bind options", () => {
    const hp = projectPublicBuilderHousePackageFromCsvTexts({
      packagePublicRoot: "/house-packages/harmony-124",
      galleryCsv: MIN_GALLERY,
      roomsCsv: MIN_ROOMS,
      videosCsv: MIN_VIDEOS,
      identity: {
        id: "harmony-124",
        title: "Harmony 124",
        reference: "harmony-124",
      },
    });
    assert.equal(hp.identity.id, "harmony-124");
    assert.equal(hp.identity.title, "Harmony 124");
    assert.ok(hp.rooms.length >= 1);
  });
});
