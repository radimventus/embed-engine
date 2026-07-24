/**
 * Experience bootstrap lifecycle events (PT-BOOTSTRAP-READY-01).
 *
 * Single in-memory bus shared by Client Studio Provider (emit) and Embed Reveal (wait).
 * No DOM polling — readiness is explicit and once-per-session.
 */

export const BOOTSTRAP_EVENTS = [
  'BOOTSTRAP_STARTED',
  'BOOTSTRAP_LOADING',
  'RUNTIME_READY',
  'EXPERIENCE_READY',
  'REVEAL_READY',
] as const;

export type BootstrapEventName = (typeof BOOTSTRAP_EVENTS)[number];

/** Events that may fire at most once until `reset()`. */
const ONCE_PER_SESSION: ReadonlySet<BootstrapEventName> = new Set([
  'BOOTSTRAP_STARTED',
  'BOOTSTRAP_LOADING',
  'RUNTIME_READY',
  'EXPERIENCE_READY',
  'REVEAL_READY',
]);

type Listener = () => void;

function createBootstrapEventBus() {
  const listeners = new Map<BootstrapEventName, Set<Listener>>();
  const emitted = new Set<BootstrapEventName>();

  function getBucket(event: BootstrapEventName): Set<Listener> {
    let bucket = listeners.get(event);
    if (bucket === undefined) {
      bucket = new Set();
      listeners.set(event, bucket);
    }
    return bucket;
  }

  const bus = {
    /**
     * Emit a lifecycle event. Once-per-session events are ignored if already emitted.
     */
    emit(event: BootstrapEventName): void {
      if (ONCE_PER_SESSION.has(event) && emitted.has(event)) {
        return;
      }
      emitted.add(event);
      const bucket = listeners.get(event);
      if (bucket === undefined || bucket.size === 0) {
        return;
      }
      for (const listener of [...bucket]) {
        listener();
      }
    },

    /** Subscribe; returns unsubscribe. */
    on(event: BootstrapEventName, listener: Listener): () => void {
      getBucket(event).add(listener);
      return () => {
        listeners.get(event)?.delete(listener);
      };
    },

    /**
     * Subscribe for a single delivery. If the event already fired this session,
     * invokes `listener` synchronously.
     */
    once(event: BootstrapEventName, listener: Listener): () => void {
      if (emitted.has(event)) {
        listener();
        return () => undefined;
      }
      const bucket = getBucket(event);
      const wrap: Listener = () => {
        bucket.delete(wrap);
        listener();
      };
      bucket.add(wrap);
      return () => {
        bucket.delete(wrap);
      };
    },

    /** True if this session has already emitted `event`. */
    hasEmitted(event: BootstrapEventName): boolean {
      return emitted.has(event);
    },

    /**
     * Resolve when `event` has fired (or already did). Rejects on abort.
     * Uses listener registration only — never polls.
     */
    waitFor(event: BootstrapEventName, signal?: AbortSignal): Promise<void> {
      if (emitted.has(event)) {
        return Promise.resolve();
      }
      if (signal?.aborted) {
        return Promise.reject(
          new DOMException('Bootstrap wait aborted', 'AbortError'),
        );
      }

      return new Promise((resolve, reject) => {
        let settled = false;
        let unsub: () => void = () => undefined;
        const cleanup = (): void => {
          unsub();
          signal?.removeEventListener('abort', onAbort);
        };
        const finish = (): void => {
          if (settled) {
            return;
          }
          settled = true;
          cleanup();
          resolve();
        };
        const onAbort = (): void => {
          if (settled) {
            return;
          }
          settled = true;
          cleanup();
          reject(new DOMException('Bootstrap wait aborted', 'AbortError'));
        };

        unsub = bus.once(event, finish);
        signal?.addEventListener('abort', onAbort);
      });
    },

    /** Clear session state — call at the start of each Experience launch. */
    reset(): void {
      emitted.clear();
      listeners.clear();
    },
  };

  return bus;
}

export const bootstrapEvents = createBootstrapEventBus();

export type BootstrapEventBus = typeof bootstrapEvents;
