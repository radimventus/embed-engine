/**
 * Priority Domain Model §2.5 — ConfirmedDecisionContext.
 *
 * Snapshot of intent after Confirmation — input to Interpretation.
 * No Interpretation may be produced for Priority Journey without this context.
 */

import type { ObjectRef } from "./ObjectRef";
import type { PriorityDefinition } from "./PriorityDefinition";
import type { PrioritySelection } from "./PrioritySelection";

export type ConfirmedDecisionContext = {
  readonly object: ObjectRef;
  readonly selection: PrioritySelection;
  /** Active PriorityDefinition binding for the dominant lens. */
  readonly priorityDefinition: PriorityDefinition;
};
