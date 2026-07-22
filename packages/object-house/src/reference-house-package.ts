import type { HousePackage } from "./HousePackage";

/**
 * Browser / Runtime fixture mirroring `packages/reference-house`.
 * URLs are root-absolute under `/reference-house/` (Client Studio `public/`).
 * Keep in sync with `packages/reference-house/house.json` + published assets.
 */
const PUBLIC_ROOT = "/reference-house";

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
    rooms: 8,
    hasGarden: true,
  },
  media: [
    {
      id: "hero-image",
      type: "image",
      title: "Hero",
      url: `${PUBLIC_ROOT}/assets/media/hero/hero.webp`,
    },
    {
      id: "media-floorplan",
      type: "floorplan",
      title: "Půdorys",
      url: `${PUBLIC_ROOT}/assets/floorplans/pudorys.webp`,
    },
    {
      id: "intro-video",
      type: "video",
      title: "Intro video",
      url: "https://fast.wistia.net/embed/iframe/sxe3yw702e",
    },
    {
      id: "gallery-01",
      type: "image",
      title: "Galerie 01",
      url: `${PUBLIC_ROOT}/assets/media/gallery/01.webp`,
    },
    {
      id: "gallery-02",
      type: "image",
      title: "Galerie 02",
      url: `${PUBLIC_ROOT}/assets/media/gallery/02.webp`,
    },
    {
      id: "gallery-03",
      type: "image",
      title: "Galerie 03",
      url: `${PUBLIC_ROOT}/assets/media/gallery/03.webp`,
    },
    {
      id: "gallery-11",
      type: "image",
      title: "Galerie 11",
      url: `${PUBLIC_ROOT}/assets/media/gallery/11.webp`,
    },
    {
      id: "gallery-12",
      type: "image",
      title: "Galerie 12",
      url: `${PUBLIC_ROOT}/assets/media/gallery/12.webp`,
    },
    {
      id: "gallery-13",
      type: "image",
      title: "Galerie 13",
      url: `${PUBLIC_ROOT}/assets/media/gallery/13.webp`,
    },
    {
      id: "gallery-14",
      type: "image",
      title: "Galerie 14",
      url: `${PUBLIC_ROOT}/assets/media/gallery/14.webp`,
    },
    {
      id: "gallery-15",
      type: "image",
      title: "Galerie 15",
      url: `${PUBLIC_ROOT}/assets/media/gallery/15.webp`,
    },
    {
      id: "gallery-16",
      type: "image",
      title: "Galerie 16",
      url: `${PUBLIC_ROOT}/assets/media/gallery/16.webp`,
    },
    {
      id: "gallery-17",
      type: "image",
      title: "Galerie 17",
      url: `${PUBLIC_ROOT}/assets/media/gallery/17.webp`,
    },
    {
      id: "gallery-18",
      type: "image",
      title: "Galerie 18",
      url: `${PUBLIC_ROOT}/assets/media/gallery/18.webp`,
    },
    {
      id: "gallery-19",
      type: "image",
      title: "Galerie 19",
      url: `${PUBLIC_ROOT}/assets/media/gallery/19.webp`,
    },
    {
      id: "gallery-20",
      type: "image",
      title: "Galerie 20",
      url: `${PUBLIC_ROOT}/assets/media/gallery/20.webp`,
    },
    {
      id: "gallery-21",
      type: "image",
      title: "Galerie 21",
      url: `${PUBLIC_ROOT}/assets/media/gallery/21.webp`,
    },
    {
      id: "gallery-22",
      type: "image",
      title: "Galerie 22",
      url: `${PUBLIC_ROOT}/assets/media/gallery/22.webp`,
    },
  ],
  rooms: [
    { id: "room-living", name: "Obývací pokoj", area: 32, floor: 0 },
    { id: "room-kitchen", name: "Kuchyně", area: 14, floor: 0 },
    { id: "room-bedroom", name: "Ložnice", area: 18, floor: 0 },
    { id: "room-children", name: "Dětský pokoj", area: 16, floor: 0 },
    { id: "room-bath", name: "Koupelna", area: 8, floor: 0 },
    { id: "room-office", name: "Pracovna", area: 12, floor: 0 },
    { id: "room-toilet", name: "WC", area: 3, floor: 0 },
    {
      id: "room-hallway-entrance",
      name: "Vstupní chodba",
      area: 10,
      floor: 0,
    },
  ],
  location: {
    city: "Praha",
    district: "Západ",
  },
  metadata: {
    energyClass: "B",
    construction: "Zděná",
  },
  documents: [
    {
      id: "technical-document",
      title: "Bungalov 4KK",
      url: `${PUBLIC_ROOT}/assets/documents/Bungalov%204KK.pdf`,
    },
  ],
};
