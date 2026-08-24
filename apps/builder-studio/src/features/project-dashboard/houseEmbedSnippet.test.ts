import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const panel = readFileSync(
  new URL("./HouseEmbedSnippetPanel.tsx", import.meta.url),
  "utf8",
);

const actionPanel = readFileSync(
  new URL("./ProjectActionPanel.tsx", import.meta.url),
  "utf8",
);

const builder = readFileSync(
  new URL("../builder-studio/BuilderStudioApp.tsx", import.meta.url),
  "utf8",
);

describe("TASK-64 Builder House Embed snippet", () => {
  it("uses the canonical shared snippet generator", () => {
    assert.match(
      panel,
      /@embed-engine\/embed\/partner-snippet/,
    );
    assert.match(panel, /buildOfficialPartnerSnippet/);
  });

  it("binds the exact active House without manual identity editing", () => {
    assert.match(builder, /houseId=\{activeHouseId\}/);
    assert.match(actionPanel, /HouseEmbedSnippetPanel houseId=\{houseId\}/);
    assert.match(panel, /houseId,/);
    assert.doesNotMatch(panel, /house-modern-01/);
  });

  it("provides the complete generated snippet to clipboard", () => {
    assert.match(panel, /navigator\.clipboard\.writeText\(snippet\)/);
    assert.match(panel, /Kopírovat kód/);
    assert.match(panel, /value=\{snippet\}/);
  });

  it("contains no Experience or Social Proof corpus", () => {
    for (const forbidden of [
      "lidí požádalo",
      "zájemců označilo",
      "právě prohlížejí",
      "Rodinný dům, kde to dýchá štěstím",
    ]) {
      assert.equal(panel.includes(forbidden), false, forbidden);
    }
  });
});
