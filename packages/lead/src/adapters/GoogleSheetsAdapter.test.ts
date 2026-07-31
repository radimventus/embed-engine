import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GoogleSheetsAdapter } from "./GoogleSheetsAdapter";
import type { LeadTransport } from "./LeadTransport";
import { LEAD_SOURCES, type LeadPayload } from "../types";

describe("GoogleSheetsAdapter", () => {
  it("maps field labels to sheet columns (not technical ids)", () => {
    const transport: LeadTransport = {
      async send() {
        return { ok: true };
      },
    };
    const adapter = new GoogleSheetsAdapter(transport);
    const payload: LeadPayload = {
      source: LEAD_SOURCES.CLIENT_STUDIO,
      contact: { name: "Bo", email: "bo@x.cz", company: "X" },
      fields: [
        { id: "o1", label: "Kolik domů ročně prodáváte?", value: "15–30" },
        { id: "layout", label: "Vybraná dispozice", value: "4+kk" },
      ],
      summary: { score: 3, segment: "C", recommendation: "Pilot" },
      metadata: { url: "https://example.com" },
      leadId: "L1",
      timestamp: "2026-07-31T00:00:00Z",
    };

    const columns = adapter.mapToColumns(payload);
    assert.equal(columns["Kolik domů ročně prodáváte?"], "15–30");
    assert.equal(columns["Vybraná dispozice"], "4+kk");
    assert.equal(columns.Source, "CLIENT_STUDIO");
    assert.equal(columns.Jméno, "Bo");
    assert.equal(columns.Skóre, "3");
    assert.equal(Object.hasOwn(columns, "o1"), false);
  });

  it("delivers mapped columns through transport", async () => {
    let received: unknown;
    const transport: LeadTransport = {
      async send(envelope) {
        received = envelope;
        return { ok: true };
      },
    };
    const adapter = new GoogleSheetsAdapter(transport);
    const result = await adapter.deliver({
      source: LEAD_SOURCES.CONIS_WEB,
      contact: { name: "A", email: "a@b.cz" },
      fields: [{ id: "f", label: "Priorita", value: "Zahrada" }],
      metadata: {},
      leadId: "x",
    });
    assert.equal(result.ok, true);
    assert.equal((received as { channel: string }).channel, "sheets");
    assert.equal(
      (received as { sheetColumns: Record<string, string> }).sheetColumns
        .Priorita,
      "Zahrada",
    );
  });
});
