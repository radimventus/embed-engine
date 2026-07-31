import type { LeadAdapterResult, LeadIntegrationAdapter, LeadPayload } from "../types";
import { formatLeadFieldValue } from "./formatLeadFieldValue";
import type { LeadTransport } from "./LeadTransport";

/**
 * Maps LeadPayload fields → Google Sheets columns (label → cell).
 * Owns all Sheets mapping. LeadService never sees column names.
 */
export class GoogleSheetsAdapter implements LeadIntegrationAdapter {
  readonly id = "google-sheets";

  constructor(private readonly transport: LeadTransport) {}

  /** Pure mapping used by tests and by the transport envelope. */
  mapToColumns(payload: LeadPayload): Record<string, string> {
    const columns: Record<string, string> = {
      "Lead ID": payload.leadId ?? "",
      "Datum a čas": payload.timestamp ?? "",
      Source: String(payload.source),
      Jméno: payload.contact.name,
      Firma: payload.contact.company ?? "",
      "E-mail": payload.contact.email,
      Telefon: payload.contact.phone ?? "",
    };

    for (const field of payload.fields) {
      columns[field.label] = formatLeadFieldValue(field.value);
    }

    if (payload.summary?.score !== undefined) {
      columns["Skóre"] = String(payload.summary.score);
    }
    if (payload.summary?.segment) {
      columns.Segment = payload.summary.segment;
    }
    if (payload.summary?.recommendation) {
      columns.Doporučení = payload.summary.recommendation;
    }

    columns.URL = payload.metadata.url ?? "";
    columns.Referrer = payload.metadata.referrer ?? "";
    columns["UTM Source"] = payload.metadata.utm?.source ?? "";
    columns["UTM Medium"] = payload.metadata.utm?.medium ?? "";
    columns["UTM Campaign"] = payload.metadata.utm?.campaign ?? "";
    columns["UTM Term"] = payload.metadata.utm?.term ?? "";
    columns["UTM Content"] = payload.metadata.utm?.content ?? "";
    columns["Session ID"] = payload.metadata.sessionId ?? "";
    columns["JSON Payload"] = JSON.stringify(payload);

    return columns;
  }

  async deliver(payload: LeadPayload): Promise<LeadAdapterResult> {
    const sheetColumns = this.mapToColumns(payload);
    const result = await this.transport.send({
      channel: "sheets",
      leadId: payload.leadId,
      source: payload.source,
      sheetColumns,
      payload,
    });

    return {
      adapterId: this.id,
      ok: result.ok,
      detail: result.detail,
    };
  }
}
