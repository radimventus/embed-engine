import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { LeadService } from "./LeadService";
import { LEAD_SOURCES, type LeadIntegrationAdapter, type LeadPayload } from "./types";

function samplePayload(overrides: Partial<LeadPayload> = {}): LeadPayload {
  return {
    source: LEAD_SOURCES.CONIS_WEB,
    contact: {
      name: "Ada",
      email: "ada@example.com",
      company: "Conis",
    },
    fields: [
      { id: "q1", label: "Kolik domů ročně prodáváte?", value: "20–100" },
      { id: "priority", label: "Nejdůležitější priorita", value: "Energetická úspornost" },
    ],
    summary: { score: 2, segment: "B", recommendation: "Review" },
    metadata: { url: "https://conis.cz/", sessionId: "s1" },
    ...overrides,
  };
}

describe("LeadService", () => {
  it("rejects invalid payloads without calling adapters", async () => {
    let called = false;
    const adapter: LeadIntegrationAdapter = {
      id: "spy",
      async deliver() {
        called = true;
        return { adapterId: "spy", ok: true };
      },
    };
    const service = new LeadService([adapter]);
    const result = await service.submitLead(
      samplePayload({ contact: { name: "", email: "bad" } }),
    );
    assert.equal(result.ok, false);
    assert.equal(called, false);
  });

  it("forwards the same payload to every adapter", async () => {
    const seen: string[] = [];
    const adapters: LeadIntegrationAdapter[] = [
      {
        id: "a",
        async deliver(payload) {
          seen.push(`a:${payload.source}`);
          return { adapterId: "a", ok: true };
        },
      },
      {
        id: "b",
        async deliver(payload) {
          seen.push(`b:${payload.fields.length}`);
          return { adapterId: "b", ok: true };
        },
      },
    ];
    const service = new LeadService(adapters);
    const result = await service.submitLead(samplePayload({ source: LEAD_SOURCES.EMBED }));
    assert.equal(result.ok, true);
    assert.ok(result.leadId.length > 0);
    assert.deepEqual(seen, ["a:EMBED", "b:2"]);
  });

  it("accepts a new source string without code changes", async () => {
    const service = new LeadService([
      {
        id: "ok",
        async deliver() {
          return { adapterId: "ok", ok: true };
        },
      },
    ]);
    const result = await service.submitLead(
      samplePayload({ source: "SALES_STUDIO" }),
    );
    assert.equal(result.ok, true);
  });
});
