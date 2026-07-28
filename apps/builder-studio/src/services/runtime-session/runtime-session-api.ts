import type { CreateSessionInput, RuntimeSession } from '../../model';
import type { RuntimeSessionEngine } from './runtime-session-engine';

/**
 * Public Runtime Session API (EPIC-BLD-19).
 */
export type RuntimeSessionApi = {
  createSession(input: CreateSessionInput): RuntimeSession;
  startSession(sessionId: string): RuntimeSession;
  nextMove(sessionId: string): RuntimeSession;
  previousMove(sessionId: string): RuntimeSession;
  completeSession(sessionId: string): RuntimeSession;
  previewSession(sessionId: string): RuntimeSession | null;
};

export function createRuntimeSessionApi(
  engine: RuntimeSessionEngine,
): RuntimeSessionApi {
  return {
    createSession(input) {
      return engine.createSession(input);
    },
    startSession(sessionId) {
      return engine.start(sessionId);
    },
    nextMove(sessionId) {
      return engine.nextMove(sessionId);
    },
    previousMove(sessionId) {
      return engine.previousMove(sessionId);
    },
    completeSession(sessionId) {
      return engine.complete(sessionId);
    },
    previewSession(sessionId) {
      return engine.preview(sessionId);
    },
  };
}
