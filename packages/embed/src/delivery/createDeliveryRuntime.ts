/**
 * Create Decision Session Runtime from a HousePackage (unit tests / fixtures).
 * Production Embed does not call this — Provider bootstraps Builder Package.
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
