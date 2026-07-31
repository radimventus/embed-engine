import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { EmailAdapter } from "./EmailAdapter";
import type { LeadTransport } from "./LeadTransport";
import { LEAD_SOURCES } from "../types";

describe("EmailAdapter", () => {
  it("composes mail from fields without quiz-specific keys", () => {
    const adapter = new EmailAdapter({
      async send() {
        return { ok: true };
      },
    });
    const message = adapter.composeMessage({
      source: LEAD_SOURCES.EMBED,
      contact: { name: "Cy", email: "cy@z.cz", company: "Z" },
      fields: [
        { id: "p", label: "Nejdůležitější priorita", value: "Energetická úspornost" },
      ],
      summary: { score: 1, segment: "A", recommendation: "Wait" },
      metadata: { sessionId: "abc" },
      leadId: "L2",
    });

    assert.match(message.subject, /EMBED/);
    assert.match(message.body, /Nejdůležitější priorita: Energetická úspornost/);
    assert.doesNotMatch(message.body, /\bO1\b/);
    assert.doesNotMatch(message.body, /Quiz/i);
  });

  it("delivers composed mail through transport", async () => {
    let channel = "";
    const transport: LeadTransport = {
      async send(envelope) {
        channel = envelope.channel;
        assert.ok(envelope.email?.body.includes("Nejdůležitější priorita"));
        return { ok: true };
      },
    };
    const adapter = new EmailAdapter(transport);
    const result = await adapter.deliver({
      source: LEAD_SOURCES.CONIS_WEB,
      contact: { name: "D", email: "d@e.cz" },
      fields: [{ id: "x", label: "Nejdůležitější priorita", value: "X" }],
      metadata: {},
    });
    assert.equal(result.ok, true);
    assert.equal(channel, "email");
  });
});
