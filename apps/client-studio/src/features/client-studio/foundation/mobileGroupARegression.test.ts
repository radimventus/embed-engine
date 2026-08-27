import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (relative: string) =>
  readFileSync(new URL(relative, import.meta.url), "utf8");

test("04 MobileNav is before ClientStudioPage inside AppShell", () => {
  const app = read("../ClientStudioApp.tsx");

  const nav = app.indexOf("<ClientStudioMobileNav");
  const page = app.indexOf("<ClientStudioPage");
  const shellEnd = app.indexOf("</AppShell>");

  assert.ok(nav >= 0);
  assert.ok(page >= 0);
  assert.ok(shellEnd >= 0);

  assert.ok(nav < page);
  assert.ok(page < shellEnd);
});

test("05 visible bridge removes ghost mobile grid gap", () => {
  const frame = read("./JourneySceneFrame.tsx");

  assert.match(
    frame,
    /mobile:grid-cols-1 mobile:gap-0/,
  );

  assert.match(
    frame,
    /grid-cols-\[minmax\(0,1fr\)_auto\]/,
  );

  assert.match(
    frame,
    /isFooterLeadingVisible \? "mobile:hidden" : ""/,
  );
});

test("02 Client Studio mobile identity remains House-only internally", () => {
  const header = read("../ClientStudioHeader.tsx");

  assert.match(header, /mobileHouseTitle/);
  assert.match(header, /mobile:hidden">\{title\}/);
  assert.match(
    header,
    /hidden mobile:inline">\{mobileHouseTitle\}/,
  );
});
