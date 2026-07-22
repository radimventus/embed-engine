import type { ExperienceHouse } from "@embed-engine/model";
import type { HousePackage } from "@embed-engine/object-house";
import { projectHouse as projectHouseFromObject } from "@embed-engine/object-house";

/**
 * Projects Object Package → ExperienceHouse.
 * Owned by object-house; re-exported here for decision pipeline composition.
 */
export function projectHouse(house: HousePackage | null): ExperienceHouse | null {
  return projectHouseFromObject(house);
}
