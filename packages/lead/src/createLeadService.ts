import { AppsScriptLeadAdapter } from "./adapters/AppsScriptLeadAdapter";
import { AppsScriptTransport } from "./adapters/AppsScriptTransport";
import { LeadService } from "./LeadService";

export type CreateLeadServiceOptions = {
  /** Google Apps Script Web App URL. */
  readonly endpoint: string;
  readonly fetchImpl?: typeof fetch;
};

/**
 * Production factory — one Apps Script deployment for Sheets + e-mail.
 */
export function createLeadService(options: CreateLeadServiceOptions): LeadService {
  const transport = new AppsScriptTransport({
    endpoint: options.endpoint,
    fetchImpl: options.fetchImpl,
  });
  return new LeadService([new AppsScriptLeadAdapter(transport)]);
}
