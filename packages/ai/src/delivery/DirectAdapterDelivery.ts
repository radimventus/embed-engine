/**
 * Direct Adapter Delivery — wraps today's Adapter port (LLMProvider).
 *
 * Default Delivery mode for Local/tests until ACC-01 wire + Gateway exist.
 * Runtime depends on AIDelivery only; this module may know LLMProvider.
 */

import type { ChatRequest } from "../models/ChatRequest";
import type { ChatResponse } from "../models/ChatResponse";
import type { LLMProvider } from "../providers/LLMProvider";
import type { AIDelivery } from "./AIDelivery";

export class DirectAdapterDelivery implements AIDelivery {
  readonly id: string;
  readonly model: string | null;

  constructor(readonly adapter: LLMProvider) {
    const meta = adapter as LLMProvider & {
      readonly id?: unknown;
      readonly model?: unknown;
    };
    this.id = typeof meta.id === "string" ? meta.id : "direct-adapter";
    this.model = typeof meta.model === "string" ? meta.model : null;
  }

  chat(request: ChatRequest): Promise<ChatResponse> {
    return this.adapter.chat(request);
  }
}

export function createDirectAdapterDelivery(
  adapter: LLMProvider,
): DirectAdapterDelivery {
  return new DirectAdapterDelivery(adapter);
}

export function isDirectAdapterDelivery(
  delivery: AIDelivery,
): delivery is DirectAdapterDelivery {
  return delivery instanceof DirectAdapterDelivery;
}
