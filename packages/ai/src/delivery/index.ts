/**
 * AI Delivery boundary (AID-01).
 *
 * WP-B: Delivery Port + Direct Adapter Delivery + Embed bootstrap.
 * Concrete Adapters remain under `src/providers/` until extract CAP.
 */

export const AI_DELIVERY_BOUNDARY = "AID-01/delivery" as const;

export type { AIDelivery, AIDeliveryMeta } from "./AIDelivery";
export { readDeliveryMeta } from "./AIDelivery";

export {
  DirectAdapterDelivery,
  createDirectAdapterDelivery,
  isDirectAdapterDelivery,
} from "./DirectAdapterDelivery";

export {
  createEmbedAIDelivery,
  type EmbedAIDeliveryConfig,
} from "./createEmbedAIDelivery";
