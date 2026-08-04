/**
 * CAP-OP-04 / PT-07 — Timeline Runtime (in-memory projection + selection).
 */

import type { PilotEventCatalog } from './pilotEventCatalog';
import type { PilotWorkspaceCaseId } from './pilotWorkspaceModel';
import {
  groupTimelineEventsByDay,
  type PilotTimelineDayGroup,
  type PilotTimelineEvent,
  type PilotTimelineEventId,
} from './pilotTimelineModel';
import { mockPilotEventCatalog } from './pilotTimelineStore';

export type PilotTimelineRuntimeState = {
  readonly caseId: PilotWorkspaceCaseId | null;
  readonly events: readonly PilotTimelineEvent[];
  readonly groups: readonly PilotTimelineDayGroup[];
  readonly selectedEventId: PilotTimelineEventId | null;
  readonly selectedEvent: PilotTimelineEvent | null;
};

export type PilotTimelineRuntimeAction =
  | {
      readonly type: 'load-case';
      readonly caseId: PilotWorkspaceCaseId | null;
      readonly events: readonly PilotTimelineEvent[];
    }
  | {
      readonly type: 'select-event';
      readonly eventId: PilotTimelineEventId | null;
    }
  | { readonly type: 'clear-selection' };

export function createEmptyTimelineRuntimeState(): PilotTimelineRuntimeState {
  return {
    caseId: null,
    events: [],
    groups: [],
    selectedEventId: null,
    selectedEvent: null,
  };
}

export function reducePilotTimeline(
  state: PilotTimelineRuntimeState,
  action: PilotTimelineRuntimeAction,
): PilotTimelineRuntimeState {
  switch (action.type) {
    case 'load-case': {
      const events = action.events;
      const selectedStillVisible =
        state.selectedEventId !== null &&
        events.some((event) => event.id === state.selectedEventId);
      const selectedEventId = selectedStillVisible
        ? state.selectedEventId
        : null;
      return {
        caseId: action.caseId,
        events,
        groups: groupTimelineEventsByDay(events),
        selectedEventId,
        selectedEvent:
          selectedEventId === null
            ? null
            : (events.find((event) => event.id === selectedEventId) ?? null),
      };
    }
    case 'select-event': {
      if (action.eventId === null) {
        return {
          ...state,
          selectedEventId: null,
          selectedEvent: null,
        };
      }
      const selectedEvent =
        state.events.find((event) => event.id === action.eventId) ?? null;
      return {
        ...state,
        selectedEventId: selectedEvent?.id ?? null,
        selectedEvent,
      };
    }
    case 'clear-selection':
      return {
        ...state,
        selectedEventId: null,
        selectedEvent: null,
      };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

export async function loadTimelineForCase(
  caseId: PilotWorkspaceCaseId | null,
  catalog: PilotEventCatalog = mockPilotEventCatalog,
): Promise<readonly PilotTimelineEvent[]> {
  if (caseId === null) return [];
  return catalog.listEventsForCase({ caseId });
}
