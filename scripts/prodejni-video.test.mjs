import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const html = readFileSync(new URL("../docs/prodejni-video/index.html", import.meta.url), "utf8");

test("prodejni-video page keeps the approved offer contract", () => {
  assert.match(html, /Prodejní video pro váš web/);
  assert.match(html, /a sociální sítě/);
  assert.match(html, /14 970 Kč/);
  assert.match(html, /9 970 Kč/);
  assert.match(html, /DO 31\. 10\. 2026/);
  assert.equal((html.match(/data-wistia-id=/g) || []).length, 3);
});

test("prodejni-video checkout uses the canonical Realivideo authority", () => {
  assert.match(html, /const API="https:\/\/api\.conis\.cz"/);
  assert.match(html, /offerSlug:"realivideo"/);
  assert.match(html, /id:"prodejni-video-9970-intro"/);
  assert.match(html, /price:9970/);
  assert.match(html, /priceCzk:PRODUCT\.price/);
  assert.match(html, /\/local-pilot\/orders/);
  assert.match(html, /\/proforma/);
  assert.match(html, /QRCode\.toDataURL/);
});

test("prodejni-video links the current Realivideo legal documents", () => {
  assert.match(html, /01-obchodni-podminky-realivideo\.pdf/);
  assert.match(html, /02-ramcova-smlouva-realivideo\.pdf/);
  assert.match(html, /id="terms" type="checkbox" required/);
});

test("prodejni-video form has exactly the requested customer fields", () => {
  for (const id of ["company", "ico", "person", "email", "phone"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.doesNotMatch(html, /id="web"/);
  assert.doesNotMatch(html, /id="note"/);
});
