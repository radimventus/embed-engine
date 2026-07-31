import type {
  LeadTransport,
  LeadTransportEnvelope,
  LeadTransportResult,
} from "./LeadTransport";
import { formatLeadFieldValue } from "./formatLeadFieldValue";

export type AppsScriptTransportOptions = {
  readonly endpoint: string;
  /** Optional fetch impl (tests / Node polyfills). */
  readonly fetchImpl?: typeof fetch;
};

/**
 * Posts a universal envelope to Google Apps Script Web App.
 * Uses text/plain to avoid CORS preflight on partner / static hosts.
 *
 * Sends a dual payload:
 * - CAP-CORE-01: sheetColumns + mail + channel + nested payload
 * - CAP-WEB-01 legacy: flat contact + answersByTitle (string `email`)
 */
export class AppsScriptTransport implements LeadTransport {
  private readonly endpoint: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: AppsScriptTransportOptions) {
    const endpoint = options.endpoint.trim();
    if (!endpoint) {
      throw new Error("AppsScriptTransport requires endpoint URL.");
    }
    this.endpoint = endpoint;
    this.fetchImpl = options.fetchImpl ?? fetch.bind(globalThis);
  }

  async send(envelope: LeadTransportEnvelope): Promise<LeadTransportResult> {
    const payload = envelope.payload;
    const answersByTitle: Record<string, string> = {};
    for (const field of payload.fields) {
      answersByTitle[field.label] = formatLeadFieldValue(field.value);
    }

    const body = {
      channel: envelope.channel,
      leadId: envelope.leadId ?? payload.leadId,
      source: envelope.source,
      sheetColumns: envelope.sheetColumns,
      mail: envelope.email,
      emailMessage: envelope.email,
      payload,
      name: payload.contact.name,
      company: payload.contact.company ?? "",
      email: payload.contact.email,
      phone: payload.contact.phone ?? "",
      answersByTitle,
      score: payload.summary?.score,
      segment: payload.summary?.segment,
      recommendation: payload.summary?.recommendation,
      status: payload.summary?.segment,
      url: payload.metadata.url ?? "",
      referrer: payload.metadata.referrer ?? "",
      utmSource: payload.metadata.utm?.source ?? "",
      utmMedium: payload.metadata.utm?.medium ?? "",
      utmCampaign: payload.metadata.utm?.campaign ?? "",
      sessionId: payload.metadata.sessionId ?? "",
      timestamp: payload.timestamp,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "lead-service",
    };

    const response = await this.fetchImpl(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
      redirect: "follow",
    });

    let parsed: { ok?: boolean; error?: string; leadId?: string } = {};
    try {
      parsed = (await response.json()) as typeof parsed;
    } catch {
      parsed = {};
    }

    if (!response.ok || parsed.ok === false) {
      return {
        ok: false,
        detail: parsed.error || `Apps Script HTTP ${response.status}`,
        leadId: parsed.leadId,
      };
    }

    return {
      ok: true,
      detail: "delivered",
      leadId: parsed.leadId,
    };
  }
}
