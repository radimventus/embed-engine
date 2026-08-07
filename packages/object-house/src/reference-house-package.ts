import type { HousePackage } from "./HousePackage";

/** Reference House Package for MVP experiences. */
export const REFERENCE_HOUSE_PACKAGE: HousePackage = {
  identity: {
    id: "house-modern-01",
    title: "Modern 01",
    reference: "ASTAV-M01",
  },
  overview: {
    price: 6_900_000,
    usableArea: 142,
    landArea: 620,
    rooms: 5,
    hasGarden: true,
  },
  media: [
    {
      id: "media-exterior",
      type: "image",
      title: "Exteriér",
      url: "/media/house-modern-01/exterior.jpg",
    },
    {
      id: "media-floorplan",
      type: "floorplan",
      title: "Půdorys",
      url: "/media/house-modern-01/floorplan.svg",
    },
  ],
  rooms: [
    { id: "room-living", name: "Obývací pokoj", area: 32, floor: 0 },
    { id: "room-kitchen", name: "Kuchyně", area: 14, floor: 0 },
    { id: "room-children", name: "Dětský pokoj", area: 16, floor: 1 },
    { id: "room-bedroom", name: "Ložnice", area: 18, floor: 1 },
    { id: "room-bath", name: "Koupelna", area: 8, floor: 1 },
  ],
  location: {
    city: "Praha",
    district: "Západ",
  },
  metadata: {
    energyClass: "B",
    construction: "Zděná",
  },
};
