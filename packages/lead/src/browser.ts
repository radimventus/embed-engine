/**
 * Browser IIFE entry — exposes universal Lead Service for static hosts.
 * Does not import Quiz / Client Studio / Embed.
 */
import {
  LEAD_SOURCES,
  createLeadService,
  LeadService,
  GoogleSheetsAdapter,
  EmailAdapter,
  AppsScriptLeadAdapter,
  AppsScriptTransport,
  validateLeadPayload,
} from "./index";

export {
  LEAD_SOURCES,
  createLeadService,
  LeadService,
  GoogleSheetsAdapter,
  EmailAdapter,
  AppsScriptLeadAdapter,
  AppsScriptTransport,
  validateLeadPayload,
};
