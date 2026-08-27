import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(url: URL): string {
  return readFileSync(url, "utf8");
}

const inlineDelivery = read(
  new URL("./mountClientStudioDelivery.ts", import.meta.url),
);
const launcherDelivery = read(
  new URL("./launchExperience.ts", import.meta.url),
);
const advisor = read(
  new URL(
    "../../../../apps/client-studio/src/features/client-studio/sections/AIAdvisor/AIAdvisor.tsx",
    import.meta.url,
  ),
);
const service = read(
  new URL(
    "../../../../apps/client-studio/src/features/client-studio/sections/AIAdvisor/embedAIService.ts",
    import.meta.url,
  ),
);
const embedBuild = read(
  new URL("../../scripts/build-distribution.mjs", import.meta.url),
);
const studioPublish = read(
  new URL("../../../../scripts/publish-studio-platform.mjs", import.meta.url),
);

describe("TASK-64 Workspace / Embed Chat parity", () => {
  it("mounts the same Client Studio implementation in both Embed modes", () => {
    assert.match(inlineDelivery, /mountClientStudio/);
    assert.match(launcherDelivery, /mountClientStudio/);
  });

  it("keeps AI Advisor on the shared Embed AIService path", () => {
    assert.match(advisor, /getEmbedAIService\(\)\.sendMessage/);
    assert.match(service, /createAIServiceFromDelivery/);
    assert.match(service, /createEmbedAIDelivery\(\)/);
  });



  it("locks the public AI Delivery binding into every production publish path", () => {
    const deliveryUrl =
      "https://embed-engineai-delivery-edge-production.up.railway.app";

    assert.match(embedBuild, /VITE_AI_DELIVERY_URL/);
    assert.match(embedBuild, new RegExp(deliveryUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

    assert.match(studioPublish, /VITE_AI_DELIVERY_URL/);
    assert.match(studioPublish, new RegExp(deliveryUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });

  it("does not introduce browser direct OpenAI credentials", () => {
    for (const source of [
      inlineDelivery,
      launcherDelivery,
      advisor,
      service,
    ]) {
      assert.doesNotMatch(source, /OPENAI_API_KEY\s*=/);
      assert.doesNotMatch(source, /sk-[A-Za-z0-9_-]{20,}/);
    }
  });
});
