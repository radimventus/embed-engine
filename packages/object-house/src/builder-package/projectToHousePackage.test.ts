import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildBuilderPackageRegistries } from "./buildRegistries";
import {
  BUILDER_MEDIA_HERO_ID,
  builderFloorIdToNumber,
  galleryMediaId,
  parseGalleryMediaId,
  projectBuilderImportToHousePackage,
} from "./projectToHousePackage";

const GALLERY_CSV = `order,room,file
1,exterior,01.webp
2,exterior,02.webp
3,exterior,03.webp
4,kitchen,11.webp
`;

const ROOMS_CSV = `floor,room,name
p1,exterior,Exteriér
p1,kitchen,Kuchyně
`;

const VIDEOS_CSV = `order,room,provider,mediaId
1,exterior,wistia,abc123
2,kitchen,wistia,kit456
`;

describe("projectBuilderImportToHousePackage", () => {
  it("maps Builder floor ids to numeric Object floors", () => {
    assert.equal(builderFloorIdToNumber("p1"), 0);
    assert.equal(builderFloorIdToNumber("p2"), 1);
    assert.equal(builderFloorIdToNumber("other"), 0);
  });

  it("projects rooms and media from registries into HousePackage", () => {
    const built = buildBuilderPackageRegistries({
      packageRoot: "/house-package",
      galleryCsv: GALLERY_CSV,
      roomsCsv: ROOMS_CSV,
      videosCsv: VIDEOS_CSV,
      heroPath: "media/hero/hero.webp",
      planPairs: [
        {
          floorId: "p1",
          rasterRelativePath: "media/plans/p1.webp",
          svgRelativePath: "media/plans/p1.svg",
        },
      ],
    });
    assert.equal(built.ok, true);
    if (!built.ok) {
      return;
    }

    const house = projectBuilderImportToHousePackage(built.result, {
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
    });

    assert.equal(house.rooms.length, 2);
    assert.deepEqual(
      house.rooms.map((room) => room.id),
      ["exterior", "kitchen"],
    );
    assert.equal(house.rooms[0]?.floor, 0);
    assert.equal(house.overview.rooms, 2);

    const hero = house.media.find((asset) => asset.id === BUILDER_MEDIA_HERO_ID);
    assert.ok(hero);
    assert.equal(hero.url, "/house-package/media/hero/hero.webp");

    const exteriorGallery = house.media.filter((asset) => {
      const parsed = parseGalleryMediaId(asset.id);
      return parsed?.roomId === "exterior";
    });
    assert.equal(exteriorGallery.length, 3);
    assert.equal(exteriorGallery[0]?.id, galleryMediaId("exterior", 1));

    const kitchenVideo = house.media.find((asset) => asset.id.startsWith("video:kitchen:"));
    assert.ok(kitchenVideo);
    assert.match(kitchenVideo.url, /kit456/);

    const floorplan = house.media.find((asset) => asset.type === "floorplan");
    assert.ok(floorplan);
    assert.equal(floorplan.url, "/house-package/media/plans/p1.webp");
  });
});
