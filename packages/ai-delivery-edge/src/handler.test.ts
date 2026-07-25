import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createDeliveryEdgeContext,
  handleDeliveryRequest,
} from "./handler";

describe("AI Delivery edge fetch handler", () => {
  it("health reports configured=false without key", async () => {
    const ctx = createDeliveryEdgeContext({}, { apiKey: "" });
    const response = await handleDeliveryRequest(
      new Request("https://edge.test/health"),
      ctx,
    );
    assert.equal(response.status, 200);
    const body = (await response.json()) as { ok: boolean; configured: boolean };
    assert.equal(body.ok, true);
    assert.equal(body.configured, false);
  });

  it("allows CORS for GitHub Pages origin", async () => {
    const ctx = createDeliveryEdgeContext({}, {
      apiKey: "",
      chat: async () => ({
        content: "ok",
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        finishReason: "stop",
      }),
    });
    const response = await handleDeliveryRequest(
      new Request("https://edge.test/v1/chat", {
        method: "POST",
        headers: {
          origin: "https://radimventus.github.io",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sessionId: "s1",
          systemPrompt: { content: "x" },
          context: {},
          messages: [{ role: "user", content: "hi" }],
        }),
      }),
      ctx,
    );
    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get("access-control-allow-origin"),
      "https://radimventus.github.io",
    );
  });
});
