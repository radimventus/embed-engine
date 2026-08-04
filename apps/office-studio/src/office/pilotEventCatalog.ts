/**
 * CAP-OP-04 / PT-07 — Event Catalog interface for Pilot Timeline.
 * Future catalog adapters plug here without Timeline UI refactor.
 */

import type { PilotWorkspaceCaseId } from './pilotWorkspaceModel';
import type {
  PilotTimelineEvent,
  PilotTimelineEventId,
} from './pilotTimelineModel';

export type PilotEventCatalogQuery = {
  readonly caseId: PilotWorkspaceCaseId;
};

export type PilotEventCatalog = {
  readonly listEventsForCase: (
    query: PilotEventCatalogQuery,
  ) => Promise<readonly PilotTimelineEvent[]> | readonly PilotTimelineEvent[];
  readonly getEventById?: (
    eventId: PilotTimelineEventId,
  ) => Promise<PilotTimelineEvent | null> | PilotTimelineEvent | null;
  readonly appendEvent?: (
    event: PilotTimelineEvent,
  ) => Promise<void> | void;
};

export type PilotEventCatalogSource = 'mock' | 'office-catalog' | 'remote';

export type PilotEventCatalogDescriptor = {
  readonly source: PilotEventCatalogSource;
  readonly catalog: PilotEventCatalog;
};
