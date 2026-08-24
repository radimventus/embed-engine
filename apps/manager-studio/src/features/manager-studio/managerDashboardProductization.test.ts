import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));

function read(name: string): string {
  return readFileSync(join(here, name), "utf8");
}

describe("TASK 71B Manager Intelligence productization", () => {
  it("renders the approved executive dashboard hierarchy", () => {
    const source = read("ManagerWorkCenterHome.tsx");

    assert.match(source, /Jak si projekt vede a co změnit/);
    assert.match(source, /Profily zájemce/);
    assert.match(source, /Ø Index připravenosti/);
    assert.match(source, /Vysoká připravenost/);
    assert.match(source, /Konverze/);

    assert.match(source, /Připravenost zákazníků/);
    assert.match(source, /Průměrná připravenost zájemce/);
    assert.match(source, /Rozhodovací trajektorie/);
    assert.match(source, /Index ztráty zájmu/);
    assert.match(source, /Co rozhoduje/);
    assert.match(source, /Co si klienti ověřují/);
    assert.match(source, /Engagement domu/);
    assert.match(source, /Doporučená vylepšení Experience/);
  });

  it("defines loss-of-interest as an auditable REAL-profile signal gap, not fabricated drop-off", () => {
    const source = read("ManagerWorkCenterHome.tsx");

    assert.match(source, /function lossOfInterestIndex/);
    assert.match(source, /realProfiles - signalProfiles/);
    assert.match(source, /Není interpretován jako anonymní/);
    assert.doesNotMatch(source, /dropoffRate|visitorDropoff|anonymousVisitors/);
  });

  it("keeps the sidebar IA aligned with rendered Manager sections", () => {
    const nav = read("partnerNav.ts");
    const source = read("ManagerWorkCenterHome.tsx");

    for (const id of [
      "manager-work-center",
      "manager-readiness",
      "manager-trajectory",
      "manager-interests",
      "manager-engagement",
      "manager-improvements",
    ]) {
      assert.match(nav, new RegExp(id));
      assert.match(source, new RegExp(`id="${id}"`));
    }

    assert.doesNotMatch(nav, /Místa ztráty zákazníků/);
    assert.doesNotMatch(nav, /Metriky platformy/);
    assert.doesNotMatch(nav, /Produktové poznatky/);
  });

  it("removes legacy canvases from the partner Manager page", () => {
    const page = read("ManagerStudioPage.tsx");

    assert.match(page, /ManagerWorkCenterHome/);
    assert.doesNotMatch(page, /OperationsCanvas/);
    assert.doesNotMatch(page, /OperationsCenterCanvas/);
    assert.doesNotMatch(page, /ProductLearningCanvas/);
  });

  it("keeps truthful pre-data and canonical Manager Intelligence authority", () => {
    const source = read("ManagerWorkCenterHome.tsx");

    assert.match(source, /intelligence\.preData/);
    assert.match(source, /useHouseOperationalCases/);
    assert.match(source, /managerHouseIntelligence/);
    assert.match(source, /managerProjectIntelligence/);
    assert.match(
      source,
      /Žádné metriky ani doporučení nejsou dopočítávány z reference\s+dat/,
    );
  });
});
