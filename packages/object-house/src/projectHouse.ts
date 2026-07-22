import type { ExperienceHouse } from "@embed-engine/model";

import type { HousePackage } from "./HousePackage";

/**
 * Projects Object Package → ExperienceHouse.
 * Renderer never receives HousePackage directly (ADR-006 / PT-001 P5).
 */
export function projectHouse(house: HousePackage | null): ExperienceHouse | null {
  if (house === null) {
    return null;
  }

  return {
    id: house.identity.id,
    title: house.identity.title,
    reference: house.identity.reference,
    price: house.overview.price,
    usableArea: house.overview.usableArea,
    landArea: house.overview.landArea,
    roomCount: house.overview.rooms,
    hasGarden: house.overview.hasGarden,
    city: house.location.city,
    district: house.location.district,
    energyClass: house.metadata.energyClass,
    construction: house.metadata.construction,
    media: house.media.map((asset) => ({
      id: asset.id,
      type: asset.type,
      title: asset.title,
      url: asset.url,
    })),
    rooms: house.rooms.map((room) => ({
      id: room.id,
      name: room.name,
      area: room.area,
      floor: room.floor,
    })),
  };
}
