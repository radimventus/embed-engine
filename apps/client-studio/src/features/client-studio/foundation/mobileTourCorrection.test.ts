import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(resolve(here, relative), "utf8");
}

describe("TASK48A mobile TOUR corrections 1-5", () => {
  it("uses compact top journey navigation instead of a fixed bottom bar", () => {
    const nav = read("../ClientStudioMobileNav.tsx");
    assert.match(nav, /sticky top-0/);
    assert.doesNotMatch(nav, /fixed inset-x-0 bottom-0/);
    assert.match(nav, /navigateToJourneySection/);
  });

  it("does not reserve bottom-nav viewport height", () => {
    const root = read("./GuidedJourneyRoot.tsx");
    const scene = read("./JourneySceneFrame.tsx");

    assert.match(
      root,
      /--guided-journey-bottom-nav-offset'[\s\S]*'0px'/,
    );

    assert.doesNotMatch(
      scene,
      /100dvh[^"\n]*guided-journey-bottom-nav-offset/,
    );
  });

  it("keeps the mobile display 16:9 and compact", () => {
    const media = read("../sections/MediaExplorer/MediaExplorer.tsx");
    assert.match(media, /mobile:aspect-video/);
    assert.match(media, /mobile:mt-0\.5/);
  });

  it("uses RoomSelect on mobile without a mobile title spacer", () => {
    const room = read("../sections/HouseNavigator/RoomIndex.tsx");

    assert.match(room, /<RoomSelect \/>/);
    assert.match(
      room,
      /SPATIAL_TERMINAL_WALKTHROUGH_TITLE_CLASS[^}]*} mobile:hidden/,
    );
    assert.match(room, /mobile:px-0/);
  });

  it("keeps the floorplan full-width and removes the mobile title spacer", () => {
    const floor = read("../sections/HouseNavigator/FloorPlanExplorer.tsx");
    const layout = read("../sections/spatial-terminal-layout.ts");

    assert.match(
      floor,
      /SPATIAL_TERMINAL_WALKTHROUGH_TITLE_CLASS[^}]*} mobile:hidden/,
    );
    assert.match(layout, /mobile:px-1 mobile:pb-2/);
    assert.match(layout, /mobile:min-h-2/);
  });

  it("keeps the Priority bridge at normal mobile width", () => {
    const bridge = read(
      "../sections/PriorityEngine/PriorityChapterBridge.tsx",
    );

    assert.match(
      bridge,
      /w-full min-w-0 max-w-none bg-\[#FFFFFF\]/,
    );
    assert.match(bridge, /mobile:max-w-none/);
    assert.match(bridge, /mobile:grid-cols-1/);
  });

  it("keeps desktop TOUR geometry authority", () => {
    const layout = read("../sections/spatial-terminal-layout.ts");
    const room = read("../sections/HouseNavigator/RoomIndex.tsx");

    assert.match(layout, /desktop:w-\[600px\]/);
    assert.match(layout, /pl-\[20px\]/);
    assert.match(room, /tabletMax:flex desktop:flex/);
  });
});
