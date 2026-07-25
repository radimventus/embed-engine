/**
 * AI Delivery boundary (AID-01 / CAP-AI-PUBLISH-01).
 *
 * Vendor-neutral Delivery Port, Direct Adapter, Remote (Published) client,
 * and Embed host binding (Local vs Published vs disabled).
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
  RemoteDelivery,
  createRemoteDelivery,
  type RemoteDeliveryOptions,
} from "./RemoteDelivery";

export {
  createNotConfiguredDelivery,
} from "./NotConfiguredDelivery";

export {
  createEmbedAIDelivery,
  resolveEmbedAIDeliveryBinding,
  type EmbedAIDeliveryConfig,
  type EmbedAIDeliveryMode,
  type EmbedAIDeliveryBinding,
} from "./createEmbedAIDelivery";
