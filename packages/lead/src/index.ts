export type {
  LeadAdapterResult,
  LeadContact,
  LeadField,
  LeadIntegrationAdapter,
  LeadMetadata,
  LeadPayload,
  LeadResult,
  LeadSourceId,
  LeadSummary,
  LeadUtm,
} from "./types";
export { LEAD_SOURCES } from "./types";

export { LeadService } from "./LeadService";
export { validateLeadPayload } from "./validateLeadPayload";
export { createLeadService } from "./createLeadService";

export { GoogleSheetsAdapter } from "./adapters/GoogleSheetsAdapter";
export { EmailAdapter } from "./adapters/EmailAdapter";
export { AppsScriptLeadAdapter } from "./adapters/AppsScriptLeadAdapter";
export { AppsScriptTransport } from "./adapters/AppsScriptTransport";
export type {
  LeadTransport,
  LeadTransportEnvelope,
  LeadTransportResult,
} from "./adapters/LeadTransport";
export type { LeadEmailMessage } from "./adapters/EmailAdapter";
