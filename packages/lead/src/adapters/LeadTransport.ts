import type { LeadPayload } from "../types";
import type { LeadEmailMessage } from "./EmailAdapter";

export type LeadTransportEnvelope = {
  readonly channel: "sheets" | "email" | "combined";
  readonly leadId?: string;
  readonly source: string;
  readonly sheetColumns?: Record<string, string>;
  readonly email?: LeadEmailMessage;
  readonly payload: LeadPayload;
};

export type LeadTransportResult = {
  readonly ok: boolean;
  readonly detail?: string;
  readonly leadId?: string;
};

/**
 * Destination transport port (HTTP / queue / …).
 * Adapters depend on this — LeadService does not.
 */
export type LeadTransport = {
  send(envelope: LeadTransportEnvelope): Promise<LeadTransportResult>;
};
