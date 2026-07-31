import type { LeadPayload } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LeadValidationResult =
  | { readonly ok: true; readonly payload: LeadPayload }
  | { readonly ok: false; readonly error: string };

/**
 * Pure validation — no destination knowledge.
 */
export function validateLeadPayload(input: unknown): LeadValidationResult {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Lead payload must be an object." };
  }

  const body = input as Partial<LeadPayload>;
  const source = String(body.source ?? "").trim();
  if (!source) {
    return { ok: false, error: "Lead payload requires source." };
  }

  const contact = body.contact;
  if (!contact || typeof contact !== "object") {
    return { ok: false, error: "Lead payload requires contact." };
  }

  const name = String(contact.name ?? "").trim();
  const email = String(contact.email ?? "").trim();
  const company =
    contact.company === undefined ? undefined : String(contact.company).trim();
  const phone =
    contact.phone === undefined ? undefined : String(contact.phone).trim();

  if (!name) {
    return { ok: false, error: "Contact name is required." };
  }
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Valid contact email is required." };
  }

  if (!Array.isArray(body.fields)) {
    return { ok: false, error: "Lead payload requires fields array." };
  }

  const fields = body.fields.map((field, index) => {
    const id = String(field?.id ?? `field-${index}`).trim() || `field-${index}`;
    const label = String(field?.label ?? "").trim() || id;
    return { id, label, value: field?.value };
  });

  const metadata =
    body.metadata && typeof body.metadata === "object" ? body.metadata : {};

  const payload: LeadPayload = {
    source,
    contact: {
      name,
      email,
      ...(company ? { company } : {}),
      ...(phone ? { phone } : {}),
    },
    fields,
    metadata: {
      ...(metadata.url ? { url: String(metadata.url) } : {}),
      ...(metadata.referrer ? { referrer: String(metadata.referrer) } : {}),
      ...(metadata.sessionId ? { sessionId: String(metadata.sessionId) } : {}),
      ...(metadata.utm && typeof metadata.utm === "object"
        ? { utm: { ...metadata.utm } }
        : {}),
    },
    ...(body.summary && typeof body.summary === "object"
      ? { summary: { ...body.summary } }
      : {}),
    ...(body.leadId ? { leadId: String(body.leadId) } : {}),
    ...(body.timestamp ? { timestamp: String(body.timestamp) } : {}),
  };

  return { ok: true, payload };
}
