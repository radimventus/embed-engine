/**
 * Create Decision Session Runtime from a HousePackage (unit tests / fixtures).
 * Production Embed does not call this — Provider bootstraps Builder Package.
 */
import type { HousePackage } from "@embed-engine/object-house";
import { type DecisionSessionRuntime } from "@embed-engine/runtime";
export declare function createDeliveryRuntime(housePackage: HousePackage): DecisionSessionRuntime;
//# sourceMappingURL=createDeliveryRuntime.d.ts.map