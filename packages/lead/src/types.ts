/**
 * Universal lead capture types (CAP-CORE-01).
 * Source-agnostic — no Quiz / Client Studio / Embed knowledge.
 */

/** Built-in source identifiers. New sources need no LeadService changes. */
export const LEAD_SOURCES = Object.freeze({
  CONIS_WEB: "CONIS_WEB",
  CLIENT_STUDIO: "CLIENT_STUDIO",
  EMBED: "EMBED",
} as const);

export type LeadSourceId = (typeof LEAD_SOURCES)[keyof typeof LEAD_SOURCES] | string;

export type LeadField = {
  readonly id: string;
  readonly label: string;
  readonly value: unknown;
};

export type LeadContact = {
  readonly name: string;
  readonly company?: string;
  readonly email: string;
  readonly phone?: string;
};

export type LeadSummary = {
  readonly score?: number;
  readonly segment?: string;
  readonly recommendation?: string;
};

export type LeadUtm = {
  readonly source?: string;
  readonly medium?: string;
  readonly campaign?: string;
  readonly term?: string;
  readonly content?: string;
};

export type LeadMetadata = {
  readonly url?: string;
  readonly referrer?: string;
  readonly sessionId?: string;
  readonly utm?: LeadUtm;
};

export type LeadPayload = {
  readonly source: LeadSourceId;
  readonly contact: LeadContact;
  readonly fields: ReadonlyArray<LeadField>;
  readonly summary?: LeadSummary;
  readonly metadata: LeadMetadata;
  /** Optional client-generated id; adapters may mint one if absent. */
  readonly leadId?: string;
  readonly timestamp?: string;
};

export type LeadAdapterResult = {
  readonly adapterId: string;
  readonly ok: boolean;
  readonly detail?: string;
};

export type LeadResult = {
  readonly ok: boolean;
  readonly leadId: string;
  readonly adapters: ReadonlyArray<LeadAdapterResult>;
  readonly error?: string;
};

/**
 * Integration port — LeadService only talks to this.
 * Adapters own destination-specific mapping (Sheets columns, e-mail body, …).
 */
export type LeadIntegrationAdapter = {
  readonly id: string;
  deliver(payload: LeadPayload): Promise<LeadAdapterResult>;
};
