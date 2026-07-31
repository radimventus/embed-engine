import type { LeadAdapterResult, LeadIntegrationAdapter, LeadPayload } from "../types";
import { EmailAdapter } from "./EmailAdapter";
import { GoogleSheetsAdapter } from "./GoogleSheetsAdapter";
import type { LeadTransport } from "./LeadTransport";

/**
 * Single Apps Script POST that carries both Sheets columns and e-mail body.
 * Avoids duplicate rows when Sheets + Email share one Web App.
 */
export class AppsScriptLeadAdapter implements LeadIntegrationAdapter {
  readonly id = "apps-script";

  private readonly sheets: GoogleSheetsAdapter;
  private readonly email: EmailAdapter;
  private readonly transport: LeadTransport;

  constructor(transport: LeadTransport) {
    this.transport = transport;
    this.sheets = new GoogleSheetsAdapter(transport);
    this.email = new EmailAdapter(transport);
  }

  /** Expose mappers for hosts that need column/mail previews. */
  get sheetsAdapter(): GoogleSheetsAdapter {
    return this.sheets;
  }

  get emailAdapter(): EmailAdapter {
    return this.email;
  }

  async deliver(payload: LeadPayload): Promise<LeadAdapterResult> {
    const sheetColumns = this.sheets.mapToColumns(payload);
    const email = this.email.composeMessage(payload);
    const result = await this.transport.send({
      channel: "combined",
      leadId: payload.leadId,
      source: payload.source,
      sheetColumns,
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
