/**
 * PT-EMBED-02A — CSS isolation policy unit checks.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CSS_ISOLATION_POLICY,
  EMBED_BOUNDARY_ATTR,
} from "./cssIsolation";

describe("CSS Isolation Policy", () => {
  it("exports the boundary attribute used on public surfaces", () => {
    assert.equal(EMBED_BOUNDARY_ATTR, "data-embed-boundary");
  });

  it("scopes reclaim rules to the boundary — never bare a/button/*", () => {
    const bareTagRules = CSS_ISOLATION_POLICY.match(
      /(?:^|\n)\s*(html|body|a|button|\*)\s*[,{]/g,
    );
    assert.equal(bareTagRules, null);

    assert.match(
      CSS_ISOLATION_POLICY,
      new RegExp(`\\[${EMBED_BOUNDARY_ATTR}\\]\\s*a`),
    );
    assert.match(
      CSS_ISOLATION_POLICY,
      new RegExp(`\\[${EMBED_BOUNDARY_ATTR}\\]\\s*button`),
    );
  });

  it("declares critical visual properties for links and CTA", () => {
    for (const prop of [
      "color",
      "background-color",
      "font-family",
      "font-size",
      "font-weight",
      "line-height",
      "text-decoration",
      "border-radius",
      "appearance",
      "cursor",
      "outline",
    ]) {
      assert.match(CSS_ISOLATION_POLICY, new RegExp(`${prop}\\s*:`));
    }
    assert.match(
      CSS_ISOLATION_POLICY,
      /a\[data-embed-hero-cta\]/,
    );
    assert.match(CSS_ISOLATION_POLICY, /button\[data-embed-close\]/);
  });
});
