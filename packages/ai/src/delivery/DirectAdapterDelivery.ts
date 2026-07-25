/**
 * Direct Adapter Delivery — wraps AIAdapter behind AIDelivery.
 *
 * Default Delivery mode for Local/tests until ACC-01 wire + Gateway exist.
 * Runtime depends on AIDelivery only; this module may know AIAdapter port only.
 */

import type { ChatRequest } from "../models/ChatRequest";
import type { ChatResponse } from "../models/ChatResponse";
import type { AIAdapter } from "../adapter/port";
import type { AIDelivery } from "./AIDelivery";

export class DirectAdapterDelivery implements AIDelivery {
  readonly id: string;
  readonly model: string | null;

  constructor(readonly adapter: AIAdapter) {
    const meta = adapter as AIAdapter & {
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
  adapter: AIAdapter,
): DirectAdapterDelivery {
  return new DirectAdapterDelivery(adapter);
}

export function isDirectAdapterDelivery(
  delivery: AIDelivery,
): delivery is DirectAdapterDelivery {
  return delivery instanceof DirectAdapterDelivery;
}
