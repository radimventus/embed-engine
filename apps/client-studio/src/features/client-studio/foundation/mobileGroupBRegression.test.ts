import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (relative: string) =>
  readFileSync(new URL(relative, import.meta.url), "utf8");

test("11 keeps the media display 16:9 and exactly three mobile thumbnails", () => {
  const media = read("../sections/MediaExplorer/MediaExplorer.tsx");
  const rail = read("../sections/MediaExplorer/ThumbnailRail.tsx");
  const layout = read("../sections/spatial-terminal-layout.ts");

  assert.match(media, /mobile:aspect-video/);
  assert.match(rail, /MOBILE_VISIBLE_SLOTS = 3/);

  assert.match(layout, /pt-\[20px\] mobile:pt-1/);
  assert.match(rail, /DESKTOP_THUMB_GAP_PX = 16/);
  assert.match(rail, /MOBILE_THUMB_GAP_PX = 6/);
  assert.match(rail, /mobile:h-14/);
});

test("21 keeps desktop column but uses compact horizontal mobile copy", () => {
  const bridge = read(
    "../../../../../../packages/ui/src/welcome-bridge/WelcomeBridge.tsx",
  );

  assert.match(bridge, /flex-direction: column/);
  assert.match(bridge, /@media \(max-width: 767px\)/);
  assert.match(bridge, /flex-direction: row/);
  assert.match(bridge, /flex-wrap: nowrap/);
  assert.match(bridge, /flex: 0 1 auto/);
  assert.match(bridge, /font-size: 12px !important/);
  assert.match(bridge, /justifyContent: "center"/);
});
