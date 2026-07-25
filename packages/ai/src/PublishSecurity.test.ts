import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");

/**
 * CAP-AI-PUBLISH-01 — Experience and Release must stay secret-free.
 */
describe("CAP-AI-PUBLISH-01 security audit", () => {
  it("Experience bootstrap never reads or passes API keys", () => {
    const bootstrap = readFileSync(
      join(
        repoRoot,
        "apps/client-studio/src/features/client-studio/sections/AIAdvisor/embedAIService.ts",
      ),
      "utf8",
    );
    assert.doesNotMatch(bootstrap, /VITE_OPENAI|OPENAI_API_KEY|apiKey|sk-/);
    assert.doesNotMatch(bootstrap, /OpenAIAdapter|OpenAIProvider/);
    assert.match(bootstrap, /createEmbedAIDelivery\(\)/);
  });

  it("AIService Runtime never mentions API keys", () => {
    const source = readFileSync(
      join(repoRoot, "packages/ai/src/services/AIService.ts"),
      "utf8",
    );
    assert.doesNotMatch(source, /API_KEY|apiKey|sk-|OPENAI_/);
  });

  it("sterile Embed Vite define forces empty OpenAI key", () => {
    const viteShared = readFileSync(
      join(repoRoot, "packages/embed/vite.shared.ts"),
      "utf8",
    );
    assert.match(
      viteShared,
      /VITE_OPENAI_API_KEY["']:\s*JSON\.stringify\(""\)/,
    );
  });

  it("Delivery host binding config has no secret fields", () => {
    const source = readFileSync(
      join(repoRoot, "packages/ai/src/delivery/createEmbedAIDelivery.ts"),
      "utf8",
    );
    assert.doesNotMatch(source, /OPENAI_API_KEY|sk-[A-Za-z0-9]/);
    assert.doesNotMatch(source, /\bapiKey\b/);
    assert.match(source, /deliveryUrl/);
    assert.match(source, /published|local|disabled/);
  });
});
