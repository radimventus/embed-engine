import type {
  ExperienceHighlight,
  ExperienceHouseRoom,
} from "@embed-engine/model";
import type { HousePackage } from "@embed-engine/object-house";

import type { DecisionFilter } from "./DecisionFilter";

const LIVING_ROOM_IDS = new Set(["room-living"]);
const CHILDREN_ROOM_IDS = new Set(["room-children"]);

export type HouseInterpretation = {
  readonly highlights: readonly ExperienceHighlight[];
  readonly recommendedRooms: readonly ExperienceHouseRoom[];
};

/**
 * House Object Package interpretation for the MVP.
 * DecisionFilter × HousePackage → highlights + recommended room order.
 */
export function interpretHouseHighlights(
  filter: DecisionFilter,
  house: HousePackage,
): HouseInterpretation {
  const highlights: ExperienceHighlight[] = [];
  const recommendedRooms: ExperienceHouseRoom[] = [];

  if (filter.preferPrice) {
    highlights.push({
      target: "price",
      label: "Cena",
      reason: "Preferujete cenu",
    });
  }

  if (filter.preferSpace) {
    highlights.push({
      target: "layout",
      label: "Dispozice",
      reason: "Preferujete prostor",
    });

    const living = house.rooms.find((room) => LIVING_ROOM_IDS.has(room.id));
    const children = house.rooms.find((room) => CHILDREN_ROOM_IDS.has(room.id));

    if (living) {
      recommendedRooms.push({
        id: living.id,
        name: living.name,
        area: living.area,
        floor: living.floor,
      });
    }
    if (children) {
      recommendedRooms.push({
        id: children.id,
        name: children.name,
        area: children.area,
        floor: children.floor,
      });
    }
  }

  if (filter.preferGarden) {
    highlights.push({
      target: "garden",
      label: "Zahrada",
      reason: "Zahrada je pro vás důležitá",
    });
  }

  return { highlights, recommendedRooms };
}
