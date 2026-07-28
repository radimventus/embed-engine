import type {
  PreviewEvent,
  PreviewSnapshot,
  PublishedPackage,
  RuntimeAdapter,
  RuntimeSession,
} from '../../model';
import { createStubRuntimeAdapter } from './stub-runtime-adapter';

const MAX_HISTORY = 20;

export type RuntimePreviewService = {
  openPreview(packageId: string): RuntimeSession;
  closePreview(): RuntimeSession | null;
  refreshPreview(): RuntimeSession | null;
  getPreviewState(): PreviewSnapshot;
  getActiveSession(): RuntimeSession | null;
  getPreviewHistory(): readonly PreviewEvent[];
};

/**
 * RuntimePreviewService (EPIC-BLD-05).
 * Orchestrates Preview against PublishedPackage via RuntimeAdapter.
 * Never reads Project. Never implements Runtime interpretation.
 */
export function createRuntimePreviewService(options: {
  readonly getPublishedPackage: (
    packageId: string,
  ) => PublishedPackage | null;
  readonly adapter?: RuntimeAdapter;
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
}): RuntimePreviewService {
  const adapter = options.adapter ?? createStubRuntimeAdapter();
  const now = options.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      sequence += 1;
      const stamp = now().toISOString().replace(/[:.]/g, '-');
      return `${prefix}-${stamp}-${String(sequence).padStart(4, '0')}`;
    });

  let session: RuntimeSession | null = null;
  let lastError: string | null = null;
  const history: PreviewEvent[] = [];

  const pushEvent = (
    type: PreviewEvent['type'],
    active: RuntimeSession,
    message: string | null,
  ): void => {
    history.unshift({
      eventId: createId('preview-event'),
      type,
      sessionId: active.sessionId,
      packageId: active.packageId,
      at: now().toISOString(),
      message,
    });
    if (history.length > MAX_HISTORY) {
      history.length = MAX_HISTORY;
    }
  };

  const snapshot = (): PreviewSnapshot => ({
    state: session?.previewState ?? 'Idle',
    session,
    runtimeVersion: adapter.getStatus().runtimeVersion,
    loadedPackageId: adapter.getStatus().packageId,
    lastError,
  });

  return {
    openPreview(packageId: string): RuntimeSession {
      const published = options.getPublishedPackage(packageId);
      const startedAt = now().toISOString();
      const sessionId = createId('preview-session');

      if (published === null) {
        lastError = `PublishedPackage not found: ${packageId}`;
        session = {
          sessionId,
          packageId,
          previewState: 'Error',
          startedAt,
          refreshedAt: null,
          runtimeVersion: adapter.getStatus().runtimeVersion,
          errorMessage: lastError,
        };
        pushEvent('PreviewFailed', session, lastError);
        return session;
      }

      session = {
        sessionId,
        packageId,
        previewState: 'Preparing',
        startedAt,
        refreshedAt: null,
        runtimeVersion: adapter.getStatus().runtimeVersion,
        errorMessage: null,
      };

      session = {
        ...session,
        previewState: 'Loading',
      };

      const status = adapter.loadPackage({
        packageId: published.packageId,
        runtimeEntry: published.runtimeEntry,
        publishVersion: published.version,
      });

      if (status.state === 'error') {
        lastError = status.message ?? 'RuntimeAdapter load failed.';
        session = {
          ...session,
          previewState: 'Error',
          runtimeVersion: status.runtimeVersion,
          errorMessage: lastError,
        };
        pushEvent('PreviewFailed', session, lastError);
        return session;
      }

      lastError = null;
      session = {
        ...session,
        previewState: 'Ready',
        runtimeVersion: status.runtimeVersion,
        errorMessage: null,
      };
      pushEvent('PreviewOpened', session, null);
      return session;
    },

    closePreview(): RuntimeSession | null {
      if (session === null) {
        adapter.unload();
        return null;
      }
      const closed: RuntimeSession = {
        ...session,
        previewState: 'Idle',
        errorMessage: null,
      };
      adapter.unload();
      pushEvent('PreviewClosed', closed, null);
      session = null;
      lastError = null;
      return closed;
    },

    refreshPreview(): RuntimeSession | null {
      if (session === null) {
        return null;
      }

      const published = options.getPublishedPackage(session.packageId);
      if (published === null) {
        lastError = `PublishedPackage not found: ${session.packageId}`;
        session = {
          ...session,
          previewState: 'Error',
          refreshedAt: now().toISOString(),
          errorMessage: lastError,
        };
        pushEvent('PreviewFailed', session, lastError);
        return session;
      }

      session = {
        ...session,
        previewState: 'Loading',
        refreshedAt: now().toISOString(),
        errorMessage: null,
      };

      const status = adapter.reload({
        packageId: published.packageId,
        runtimeEntry: published.runtimeEntry,
        publishVersion: published.version,
      });

      if (status.state === 'error') {
        lastError = status.message ?? 'RuntimeAdapter reload failed.';
        session = {
          ...session,
          previewState: 'Error',
          runtimeVersion: status.runtimeVersion,
          errorMessage: lastError,
        };
        pushEvent('PreviewFailed', session, lastError);
        return session;
      }

      lastError = null;
      session = {
        ...session,
        previewState: 'Ready',
        runtimeVersion: status.runtimeVersion,
        errorMessage: null,
      };
      pushEvent('PreviewReloaded', session, null);
      return session;
    },

    getPreviewState(): PreviewSnapshot {
      return snapshot();
    },

    getActiveSession(): RuntimeSession | null {
      return session;
    },

    getPreviewHistory(): readonly PreviewEvent[] {
      return [...history];
    },
  };
}
