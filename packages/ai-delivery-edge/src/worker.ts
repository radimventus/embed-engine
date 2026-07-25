/**
 * Cloudflare Worker entry — production AI Delivery Edge (PT-OPS-AI-EDGE-01).
 *
 * Holds OPENAI_API_KEY as a Worker secret. Browser never sees the key.
 */

import {
  createDeliveryEdgeContext,
  handleDeliveryRequest,
  type DeliveryEdgeEnv,
} from "./handler";

export type WorkerEnv = DeliveryEdgeEnv;

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    try {
      const ctx = createDeliveryEdgeContext(env);
      return await handleDeliveryRequest(request, ctx);
    } catch (error) {
      console.error("ai-delivery-edge: unhandled", error);
      return new Response(JSON.stringify({ error: "internal_error" }), {
        status: 500,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }
  },
};
