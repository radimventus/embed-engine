/**
 * Partner identity / commercial facts not authored in HP-002 CSVs.
 * Rooms, gallery, hero, videos, floorplans come exclusively from Builder Package.
 */
import type { BuilderHousePackageProjectionOptions } from '@embed-engine/object-house/builder-package';

export const BUILDER_RUNTIME_HOUSE_DEFAULTS: Omit<
  BuilderHousePackageProjectionOptions,
  'packagePublicRoot'
> = Object.freeze({
  identity: Object.freeze({
    id: 'house-modern-01',
    title: 'Modern 01',
    reference: 'ASTAV-M01',
  }),
  overview: Object.freeze({
    price: 6_900_000,
    usableArea: 142,
    landArea: 620,
    hasGarden: true,
  }),
  location: Object.freeze({
    city: 'Praha',
    district: 'Západ',
  }),
  metadata: Object.freeze({
    energyClass: 'B',
    construction: 'Zděná',
  }),
  documents: Object.freeze([
    Object.freeze({
      id: 'technical-document',
      title: 'Bungalov 4KK',
      url: '/reference-house/assets/documents/technical.pdf',
    }),
  ]),
});

/** Truthful non-commercial projection fields until a House is authored. */
export const AUTHORING_DRAFT_RUNTIME_HOUSE_DEFAULTS: Omit<
  BuilderHousePackageProjectionOptions,
  'packagePublicRoot'
> = Object.freeze({
  identity: Object.freeze({
    id: 'authoring-draft',
    title: 'Váš první dům',
    reference: 'AUTHORING_DRAFT',
  }),
  overview: Object.freeze({
    price: 0,
    usableArea: 0,
    landArea: 0,
    hasGarden: false,
  }),
  location: Object.freeze({
    city: '',
    district: '',
  }),
  metadata: Object.freeze({
    energyClass: '—',
    construction: 'Připravuje se',
  }),
  documents: Object.freeze([]),
});
