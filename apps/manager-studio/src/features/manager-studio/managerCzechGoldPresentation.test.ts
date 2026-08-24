import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function read(name: string): string {
  return readFileSync(
    join(process.cwd(), "src/features/manager-studio", name),
    "utf8",
  );
}

describe("TASK 71E Manager Czech + gold presentation", () => {
  it("uses Czech Manager navigation copy", () => {
    const nav = read("partnerNav.ts");

    assert.match(nav, /Přehled/);
    assert.match(nav, /Připravenost klientů/);
    assert.match(nav, /Rozhodovací trajektorie/);
    assert.match(nav, /Aktivita v prohlídce/);

    assert.doesNotMatch(nav, /label: "Dashboard"/);
    assert.doesNotMatch(nav, /Engagement domu/);
    assert.doesNotMatch(nav, /label: "INTELLIGENCE"/);
  });

  it("uses Czech visible dashboard copy", () => {
    const home = read("ManagerWorkCenterHome.tsx");

    const required = [
      "Manažerský přehled",
      "Kvalita zájemců",
      "Nejsilnější:",
      "Aktivita v prohlídce",
      "Doporučená vylepšení zákaznické zkušenosti",
      "Měsíc",
      "Čtvrtletí",
      "Rok",
      "Stav bez dat",
      "referenčních",
    ];

    for (const value of required) {
      assert.match(home, new RegExp(value));
    }

    for (const forbidden of [
      /title="Manager Intelligence"/,
      />\s*Manager Intelligence\s*</,
      /Kvalita pipeline/,
      /Top:/,
      /title="Engagement domu"/,
      /Doporučená vylepšení Experience/,
      /Client Experience/,
      /návštěvnický funnel/,
      /sekvenční drop-off/,
      />\s*MTD\s/,
      />\s*QTD\s/,
      />\s*YTD\s/,
    ]) {
      assert.doesNotMatch(home, forbidden);
    }
  });

  it("renders Czech trajectory and loss-index labels", () => {
    const home = read("ManagerWorkCenterHome.tsx");

    for (const label of [
      "PROHLÍDKA",
      "PRIORITY",
      "OTÁZKY",
      "KONVERZACE",
      "Návrat",
      "Konverze",
      "Návrat do prohlídky",
    ]) {
      assert.match(home, new RegExp(label));
    }

    assert.doesNotMatch(home, /\["TOUR", intelligence\.trajectory/);
    assert.doesNotMatch(home, /\["FAQ", intelligence\.trajectory/);
    assert.doesNotMatch(home, /\["Chat", intelligence\.trajectory/);

    assert.doesNotMatch(home, /label: "TOUR"/);
    assert.doesNotMatch(home, /label: "FAQ"/);
    assert.doesNotMatch(home, /label: "Chat"/);
  });

  it("uses canonical gold for active Manager language", () => {
    const sidebar = read("ManagerStudioSidebar.tsx");
    const home = read("ManagerWorkCenterHome.tsx");

    assert.match(sidebar, /isActive/);
    assert.match(sidebar, /border-\[var\(--platform-accent\)\]/);

    assert.match(home, /index < 2[\s\S]*platform-accent/);

    assert.match(home, /index === 3[\s\S]*platform-accent/);

    assert.match(home, /label === "OTÁZKY" \|\| label === "Konverze"/);
  });

  it("preserves canonical Studio product names", () => {
    const all = [
      read("ManagerWorkCenterHome.tsx"),
      read("ManagerStudioPage.tsx"),
      read("ManagerStudioSidebar.tsx"),
      read("partnerNav.ts"),
    ].join("\n");

    assert.doesNotMatch(all, /Manažerské studio/);
    assert.doesNotMatch(all, /Prodejní studio/);
    assert.doesNotMatch(all, /Klientské studio/);
    assert.doesNotMatch(all, /Stavitelské studio/);
  });
});
