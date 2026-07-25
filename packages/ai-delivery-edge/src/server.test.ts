import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { startAiDeliveryEdge } from "./server";

describe("CAP-AI-PUBLISH-01 AI Delivery edge", () => {
  it("reports not_configured when no API key is present", async () => {
    const edge = await startAiDeliveryEdge({
      port: 0,
      apiKey: "",
    });
    try {
      const health = await fetch(`${edge.url}/health`);
      assert.equal(health.status, 200);
      const healthBody = (await health.json()) as {
        ok: boolean;
        configured: boolean;
      };
      assert.equal(healthBody.ok, true);
      assert.equal(healthBody.configured, false);

      const chat = await fetch(`${edge.url}/v1/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId: "s1",
          systemPrompt: { content: "x" },
          context: {},
          messages: [{ role: "user", content: "hi" }],
        }),
      });
      assert.equal(chat.status, 503);
      const chatBody = (await chat.json()) as { error: string };
      assert.equal(chatBody.error, "not_configured");
    } finally {
      await edge.close();
    }
  });
});
