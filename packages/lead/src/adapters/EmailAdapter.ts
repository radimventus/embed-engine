import type { LeadAdapterResult, LeadIntegrationAdapter, LeadPayload } from "../types";
import { formatLeadFieldValue } from "./formatLeadFieldValue";
import type { LeadTransport } from "./LeadTransport";

export type LeadEmailMessage = {
  readonly subject: string;
  readonly body: string;
};

/**
 * Composes notification e-mail from a universal LeadPayload.
 * No Quiz / Experience knowledge — only contact, fields, summary, metadata.
 */
export class EmailAdapter implements LeadIntegrationAdapter {
  readonly id = "email";

  constructor(private readonly transport: LeadTransport) {}

  composeMessage(payload: LeadPayload): LeadEmailMessage {
    const fieldLines = payload.fields.map(
      (field) => `${field.label}: ${formatLeadFieldValue(field.value)}`,
    );

    const body = [
      "Nový lead",
      "",
      `Source: ${payload.source}`,
      `Lead ID: ${payload.leadId ?? "—"}`,
      `Datum: ${payload.timestamp ?? "—"}`,
      "",
      "Kontakt",
      `Jméno: ${payload.contact.name}`,
      `Firma: ${payload.contact.company ?? "—"}`,
      `E-mail: ${payload.contact.email}`,
      `Telefon: ${payload.contact.phone ?? "—"}`,
      "",
      "Shrnutí",
      `Skóre: ${payload.summary?.score ?? "—"}`,
      `Segment: ${payload.summary?.segment ?? "—"}`,
      `Doporučení: ${payload.summary?.recommendation ?? "—"}`,
      "",
      "Pole",
      fieldLines.length > 0 ? fieldLines.join("\n") : "—",
      "",
      `URL: ${payload.metadata.url ?? "—"}`,
      `Referrer: ${payload.metadata.referrer ?? "—"}`,
      `Session ID: ${payload.metadata.sessionId ?? "—"}`,
      `UTM: ${JSON.stringify(payload.metadata.utm ?? {})}`,
    ].join("\n");

    const subject = `Nový lead (${payload.source}) — ${payload.contact.company || payload.contact.name}`;

    return { subject, body };
  }

  async deliver(payload: LeadPayload): Promise<LeadAdapterResult> {
    const email = this.composeMessage(payload);
    const result = await this.transport.send({
      channel: "email",
      leadId: payload.leadId,
      source: payload.source,
      email,
      payload,
    });

    return {
      adapterId: this.id,
      ok: result.ok,
      detail: result.detail,
    };
  }
}
