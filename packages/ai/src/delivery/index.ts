/**
 * AI Delivery boundary (AID-01).
 *
 * Vendor-neutral Delivery Port + Direct Adapter Delivery.
 * Concrete Adapters and Embed bootstrap live under `src/adapter/`.
 */

export const AI_DELIVERY_BOUNDARY = "AID-01/delivery" as const;

export type { AIDelivery, AIDeliveryMeta } from "./AIDelivery";
export { readDeliveryMeta } from "./AIDelivery";

export {
  DirectAdapterDelivery,
  createDirectAdapterDelivery,
  isDirectAdapterDelivery,
} from "./DirectAdapterDelivery";
