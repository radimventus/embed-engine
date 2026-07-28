import type {
  CreateSessionInput,
  RuntimeSession,
  SessionEvent,
  SessionHistoryEntry,
} from '../../model';
import { createSessionNavigator } from './session-navigator';
import { createSessionValidator } from './session-validator';

const MAX_HISTORY = 40;

export type RuntimeSessionEngine = {
  createSession(input: CreateSessionInput): RuntimeSession;
  start(sessionId: string): RuntimeSession;
  nextMove(sessionId: string): RuntimeSession;
  previousMove(sessionId: string): RuntimeSession;
  complete(sessionId: string): RuntimeSession;
  dispose(sessionId: string): RuntimeSession;
  load(sessionId: string): RuntimeSession | null;
  preview(sessionId: string): RuntimeSession | null;
  getEvents(sessionId?: string): readonly SessionEvent[];
  getHistory(sessionId?: string): readonly SessionEvent[];
  list(): readonly RuntimeSession[];
};

/**
 * RuntimeSessionEngine (EPIC-BLD-19).
 * Executes Decision Story for one visitor session — no Story rewrite, rules, or AI.
 */
export function createRuntimeSessionEngine(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
}): RuntimeSessionEngine {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const validator = createSessionValidator({ now });
  const sessions = new Map<string, RuntimeSession>();
  const events: SessionEvent[] = [];

  const pushEvent = (
    type: SessionEvent['type'],
    sessionId: string,
    storyId: string,
    moveId: string | null,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('session-event'),
      type,
      sessionId,
      storyId,
      moveId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requireSession = (sessionId: string): RuntimeSession => {
    const current = sessions.get(sessionId);
    if (current === undefined) {
      throw new Error(`RuntimeSession not found: ${sessionId}`);
    }
    return current;
  };

  const appendHistory = (
    session: RuntimeSession,
    entry: SessionHistoryEntry,
  ): readonly SessionHistoryEntry[] => [...session.history, entry];

  const write = (next: RuntimeSession): RuntimeSession => {
    sessions.set(next.id, next);
    return next;
  };

  const enterMove = (
    session: RuntimeSession,
    moveId: string,
    action: SessionHistoryEntry['action'],
    note: string,
    emitCompleted: boolean,
  ): RuntimeSession => {
    const stamp = now().toISOString();
    if (emitCompleted && session.currentMoveId !== null) {
      pushEvent(
        'MoveCompleted',
        session.id,
        session.storyId,
        session.currentMoveId,
        `Completed move ${session.currentMoveId}`,
      );
    }

    const next: RuntimeSession = {
      ...session,
      currentMoveId: moveId,
      history: appendHistory(session, {
        moveId,
        timestamp: stamp,
        action,
        metadata: { note },
      }),
      timestamps: {
        createdAt: session.timestamps.createdAt,
        updatedAt: stamp,
      },
    };
    write(next);
    pushEvent(
      'MoveEntered',
      next.id,
      next.storyId,
      moveId,
      `Entered move ${moveId}`,
    );
    return next;
  };

  return {
    createSession(input) {
      const storyIssues = validator.validateStory(input);
      if (storyIssues.some((item) => item.severity === 'error')) {
        throw new Error(storyIssues.map((item) => item.message).join(' '));
      }

      const id = `session-${input.storyId}`;
      const existing = sessions.get(id);
      if (existing !== undefined && existing.status !== 'Disposed') {
        return existing;
      }

      const stamp = now().toISOString();
      const created: RuntimeSession = {
        id,
        runtimeId: input.runtimeId,
        storyId: input.storyId,
        status: 'Created',
        currentMoveId: null,
        moveIds: [...input.moveIds],
        history: [
          {
            moveId: null,
            timestamp: stamp,
            action: 'created',
            metadata: { note: 'Session created from Decision Story.' },
          },
        ],
        metadata: {
          title: input.title?.trim() || 'Runtime Session',
          description:
            'Visitor pass through Decision Story — no adaptation, AI, or rule evaluation.',
        },
        timestamps: { createdAt: stamp, updatedAt: stamp },
        validation: null,
      };

      write(created);
      pushEvent(
        'SessionCreated',
        created.id,
        created.storyId,
        null,
        `Session created for story ${created.storyId}`,
      );
      return created;
    },

    start(sessionId) {
      const current = requireSession(sessionId);
      if (current.status === 'Disposed') {
        throw new Error(`Cannot start disposed session: ${sessionId}`);
      }
      if (current.status === 'Completed') {
        throw new Error(`Cannot start completed session: ${sessionId}`);
      }
      if (current.moveIds.length === 0) {
        throw new Error(`Session has no moves: ${sessionId}`);
      }

      const stamp = now().toISOString();
      const firstMoveId = current.moveIds[0]!;
      let next: RuntimeSession = {
        ...current,
        status: 'Running',
        history: appendHistory(current, {
          moveId: firstMoveId,
          timestamp: stamp,
          action: 'started',
          metadata: { note: 'Session started.' },
        }),
        timestamps: {
          createdAt: current.timestamps.createdAt,
          updatedAt: stamp,
        },
        validation: validator.validate({
          ...current,
          status: 'Running',
          currentMoveId: firstMoveId,
        }),
      };
      write(next);
      pushEvent(
        'SessionStarted',
        next.id,
        next.storyId,
        firstMoveId,
        'Session started',
      );
      next = enterMove(next, firstMoveId, 'entered', 'Entered first move.', false);
      return next;
    },

    nextMove(sessionId) {
      const current = requireSession(sessionId);
      if (current.status !== 'Running' && current.status !== 'Paused') {
        throw new Error(
          `Cannot advance session in status ${current.status}: ${sessionId}`,
        );
      }
      const navigator = createSessionNavigator(
        current.moveIds,
        current.currentMoveId,
      );
      const target = navigator.next();
      const navIssues = validator.validateNavigation(current, target);
      if (navIssues.some((item) => item.severity === 'error')) {
        throw new Error(navIssues.map((item) => item.message).join(' '));
      }
      return enterMove(
        { ...current, status: 'Running' },
        target!,
        'navigated-next',
        'Navigated to next move.',
        true,
      );
    },

    previousMove(sessionId) {
      const current = requireSession(sessionId);
      if (current.status !== 'Running' && current.status !== 'Paused') {
        throw new Error(
          `Cannot rewind session in status ${current.status}: ${sessionId}`,
        );
      }
      const navigator = createSessionNavigator(
        current.moveIds,
        current.currentMoveId,
      );
      const target = navigator.previous();
      const navIssues = validator.validateNavigation(current, target);
      if (navIssues.some((item) => item.severity === 'error')) {
        throw new Error(navIssues.map((item) => item.message).join(' '));
      }
      return enterMove(
        { ...current, status: 'Running' },
        target!,
        'navigated-previous',
        'Navigated to previous move.',
        true,
      );
    },

    complete(sessionId) {
      const current = requireSession(sessionId);
      if (current.status === 'Disposed') {
        throw new Error(`Cannot complete disposed session: ${sessionId}`);
      }
      const stamp = now().toISOString();
      if (current.currentMoveId !== null) {
        pushEvent(
          'MoveCompleted',
          current.id,
          current.storyId,
          current.currentMoveId,
          `Completed move ${current.currentMoveId}`,
        );
      }
      const next: RuntimeSession = {
        ...current,
        status: 'Completed',
        history: appendHistory(current, {
          moveId: current.currentMoveId,
          timestamp: stamp,
          action: 'completed',
          metadata: { note: 'Session completed.' },
        }),
        timestamps: {
          createdAt: current.timestamps.createdAt,
          updatedAt: stamp,
        },
      };
      write(next);
      pushEvent(
        'SessionCompleted',
        next.id,
        next.storyId,
        next.currentMoveId,
        'Session completed',
      );
      return next;
    },

    dispose(sessionId) {
      const current = requireSession(sessionId);
      const stamp = now().toISOString();
      const next: RuntimeSession = {
        ...current,
        status: 'Disposed',
        history: appendHistory(current, {
          moveId: current.currentMoveId,
          timestamp: stamp,
          action: 'disposed',
          metadata: { note: 'Session disposed.' },
        }),
        timestamps: {
          createdAt: current.timestamps.createdAt,
          updatedAt: stamp,
        },
      };
      write(next);
      pushEvent(
        'SessionDisposed',
        next.id,
        next.storyId,
        next.currentMoveId,
        'Session disposed',
      );
      return next;
    },

    load(sessionId) {
      return sessions.get(sessionId) ?? null;
    },

    preview(sessionId) {
      return sessions.get(sessionId) ?? null;
    },

    getEvents(sessionId) {
      if (sessionId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.sessionId === sessionId);
    },

    getHistory(sessionId) {
      return this.getEvents(sessionId);
    },

    list() {
      return Array.from(sessions.values());
    },
  };
}
