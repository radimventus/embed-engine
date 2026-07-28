/**
 * Runtime Preview model (EPIC-BLD-05).
 * Builder orchestration only — no Runtime interpretation.
 * Preview consumes PublishedPackage exclusively.
 */

export type PreviewState =
  | 'Idle'
  | 'Preparing'
  | 'Loading'
  | 'Ready'
  | 'Error';

export type PreviewEventType =
  | 'PreviewOpened'
  | 'PreviewClosed'
  | 'PreviewReloaded'
  | 'PreviewFailed';

export type RuntimeSession = {
  readonly sessionId: string;
  readonly packageId: string;
  readonly previewState: PreviewState;
  readonly startedAt: string;
  readonly refreshedAt: string | null;
  readonly runtimeVersion: string;
  readonly errorMessage: string | null;
};

export type PreviewEvent = {
  readonly eventId: string;
  readonly type: PreviewEventType;
  readonly sessionId: string;
  readonly packageId: string;
  readonly at: string;
  readonly message: string | null;
};

export type RuntimeAdapterStatus = {
  readonly state: 'idle' | 'loaded' | 'error';
  readonly packageId: string | null;
  readonly runtimeVersion: string;
  readonly message: string | null;
};

/**
 * Stable integration contract for any Runtime implementation.
 * Not bound to Embed Runtime.
 */
export type RuntimeAdapter = {
  loadPackage(input: {
    readonly packageId: string;
    readonly runtimeEntry: string;
    readonly publishVersion: string;
  }): RuntimeAdapterStatus;
  unload(): RuntimeAdapterStatus;
  reload(input: {
    readonly packageId: string;
    readonly runtimeEntry: string;
    readonly publishVersion: string;
  }): RuntimeAdapterStatus;
  getStatus(): RuntimeAdapterStatus;
};

export type PreviewSnapshot = {
  readonly state: PreviewState;
  readonly session: RuntimeSession | null;
  readonly runtimeVersion: string;
  readonly loadedPackageId: string | null;
  readonly lastError: string | null;
};
