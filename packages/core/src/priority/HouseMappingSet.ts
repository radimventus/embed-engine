/**
 * Priority Domain Model §2.13 — HouseMappingSet.
 *
 * Set of MappingEntry for current Experience + Object.
 * Must not mutate Experience meaning or invent a new hypothesis.
 */

import type { ObjectRef } from "./ObjectRef";
import type { MappingEntry } from "./MappingEntry";

export type HouseMappingSet = {
  readonly object: ObjectRef;
  readonly entries: readonly MappingEntry[];
};
