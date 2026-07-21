/**
 * Priority Domain Model §2.12 — MappingEntry.
 *
 * One House Mapping link: Experience claim → Object anchor + why.
 *
 * Open Question DM-OQ-07: encoding of explicit „k ověření“ when a fact is missing
 * (Blueprint §6 rule 1) is not fixed — do not invent a closed variant here.
 */

import type { ExperienceClaimRef } from "./ExperienceClaimRef";
import type { ObjectAnchor } from "./ObjectAnchor";

export type MappingEntry = {
  readonly claimRef: ExperienceClaimRef;
  readonly objectAnchor: ObjectAnchor;
  /** One sentence of relevance to the active priority. */
  readonly why: string;
};
