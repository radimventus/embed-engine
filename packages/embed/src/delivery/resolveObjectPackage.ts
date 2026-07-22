/**
 * Resolve Object Package for production Embed delivery.
 * Presentation/delivery only — does not invent Experience semantics.
 */

import {
  REFERENCE_HOUSE_PACKAGE,
  type HousePackage,
} from "@embed-engine/object-house";

/** Pilot Object Package id (canonical Gen1). */
export const DEFAULT_OBJECT_ID = REFERENCE_HOUSE_PACKAGE.identity.id;

const PACKAGES_BY_ID: Readonly<Record<string, HousePackage>> = Object.freeze({
  [REFERENCE_HOUSE_PACKAGE.identity.id]: REFERENCE_HOUSE_PACKAGE,
});

/**
 * Load the Object Package requested by the host.
 * Unknown ids fail closed — never fall back to Garden fixtures.
 */
export function resolveObjectPackage(objectId?: string): HousePackage {
  const id =
    objectId === undefined || objectId.trim().length === 0
      ? DEFAULT_OBJECT_ID
      : objectId.trim();

  const pack = PACKAGES_BY_ID[id];
  if (pack === undefined) {
    throw new Error(
      `Embed.mount: unknown objectId "${id}". Known: ${Object.keys(PACKAGES_BY_ID).join(", ")}`,
    );
  }
  return pack;
}
