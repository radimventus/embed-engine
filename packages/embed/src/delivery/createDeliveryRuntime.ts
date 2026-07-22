/**
 * Create the single Decision Session Runtime for production Embed delivery.
 * Runtime is owned by the delivery session and passed into Client Studio.
 */

import type { HousePackage } from "@embed-engine/object-house";
import {
  createDecisionSessionRuntime,
  createSystemClock,
  type DecisionSessionRuntime,
} from "@embed-engine/runtime";

export function createDeliveryRuntime(
  housePackage: HousePackage,
): DecisionSessionRuntime {
  return createDecisionSessionRuntime({
    housePackage,
    clock: createSystemClock(),
    now: 1,
  });
}
