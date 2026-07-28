import type { PlatformEvent, PlatformEventType } from '../../model';

export type PlatformEventBus = {
  publish(
    type: PlatformEventType,
    projectId: string,
    message: string,
  ): PlatformEvent;
  subscribe(
    listener: (event: PlatformEvent) => void,
  ): () => void;
  getHistory(projectId?: string): readonly PlatformEvent[];
  clear(): void;
};

const MAX_EVENTS = 50;

/**
 * In-memory platform event bus (EPIC-BLD-06).
 * Session only — no persistence.
 */
export function createPlatformEventBus(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
}): PlatformEventBus {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const history: PlatformEvent[] = [];
  const listeners = new Set<(event: PlatformEvent) => void>();

  return {
    publish(type, projectId, message) {
      const event: PlatformEvent = {
        eventId: createId('platform-event'),
        type,
        projectId,
        at: now().toISOString(),
        message,
      };
      history.unshift(event);
      if (history.length > MAX_EVENTS) {
        history.length = MAX_EVENTS;
      }
      for (const listener of listeners) {
        listener(event);
      }
      return event;
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    getHistory(projectId) {
      if (projectId === undefined) {
        return [...history];
      }
      return history.filter((item) => item.projectId === projectId);
    },

    clear() {
      history.length = 0;
    },
  };
}

export function toTimelineEntries(
  events: readonly PlatformEvent[],
): readonly import('../../model').TimelineEntry[] {
  return events.map((event) => ({
    entryId: event.eventId,
    at: event.at,
    eventType: event.type,
    label: timelineLabel(event),
  }));
}

function timelineLabel(event: PlatformEvent): string {
  switch (event.type) {
    case 'ProjectCreated':
      return 'Created';
    case 'BuildFinished':
      return 'Build';
    case 'PublishFinished':
      return 'Publish';
    case 'PreviewOpened':
      return 'Preview';
    case 'ProjectArchived':
      return 'Archived';
  }
}
