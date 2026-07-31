import type {
  LeadIntegrationAdapter,
  LeadPayload,
  LeadResult,
} from "./types";
import { validateLeadPayload } from "./validateLeadPayload";

function mintLeadId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `lead-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Universal Lead Service (CAP-CORE-01).
 *
 * Accepts a structured LeadPayload and forwards it to integration adapters.
 * Does not know Quiz, Client Studio, Embed, or Google Sheets.
 */
export class LeadService {
  private readonly adapters: readonly LeadIntegrationAdapter[];

  constructor(adapters: readonly LeadIntegrationAdapter[]) {
    if (!adapters.length) {
      throw new Error("LeadService requires at least one integration adapter.");
    }
    this.adapters = adapters;
  }

  async submitLead(payload: LeadPayload): Promise<LeadResult> {
    const checked = validateLeadPayload(payload);
    if (!checked.ok) {
      return {
        ok: false,
        leadId: payload.leadId ?? "",
        adapters: [],
        error: checked.error,
      };
    }

    const leadId = checked.payload.leadId?.trim() || mintLeadId();
    const timestamp =
      checked.payload.timestamp?.trim() || new Date().toISOString();

    const normalized: LeadPayload = {
      ...checked.payload,
      leadId,
      timestamp,
    };

    const adapterResults = await Promise.all(
      this.adapters.map(async (adapter) => {
        try {
          return await adapter.deliver(normalized);
        } catch (error) {
          return {
            adapterId: adapter.id,
            ok: false,
            detail:
              error instanceof Error ? error.message : "Adapter delivery failed.",
          };
        }
      }),
    );

    const ok = adapterResults.every((result) => result.ok);
    return {
      ok,
      leadId,
      adapters: adapterResults,
      ...(ok
        ? {}
        : {
            error: adapterResults
              .filter((result) => !result.ok)
              .map((result) => result.detail || result.adapterId)
              .join("; "),
          }),
    };
  }
}
