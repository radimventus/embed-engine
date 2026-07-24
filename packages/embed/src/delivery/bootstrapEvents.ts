/**
 * Local bootstrap event bus for Embed package unit tests / tsc.
 * Identical contract to Client Studio `bootstrapEvents.ts`.
 * Production IIFE/ESM resolve the Client Studio module via Vite alias
 * (`@client-studio/bootstrap-events`) so Provider and Reveal share one instance.
 */

export const BOOTSTRAP_EVENTS = [
  "BOOTSTRAP_STARTED",
  "BOOTSTRAP_LOADING",
  "RUNTIME_READY",
  "EXPERIENCE_READY",
  "REVEAL_READY",
] as const;

export type BootstrapEventName = (typeof BOOTSTRAP_EVENTS)[number];

const ONCE_PER_SESSION: ReadonlySet<BootstrapEventName> = new Set([
  "BOOTSTRAP_STARTED",
  "BOOTSTRAP_LOADING",
  "RUNTIME_READY",
  "EXPERIENCE_READY",
  "REVEAL_READY",
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

    on(event: BootstrapEventName, listener: Listener): () => void {
      getBucket(event).add(listener);
      return () => {
        listeners.get(event)?.delete(listener);
      };
    },

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

    hasEmitted(event: BootstrapEventName): boolean {
      return emitted.has(event);
    },

    waitFor(event: BootstrapEventName, signal?: AbortSignal): Promise<void> {
      if (emitted.has(event)) {
        return Promise.resolve();
      }
      if (signal?.aborted) {
        return Promise.reject(
          new DOMException("Bootstrap wait aborted", "AbortError"),
        );
      }

      return new Promise((resolve, reject) => {
        let settled = false;
        let unsub: () => void = () => undefined;
        const cleanup = (): void => {
          unsub();
          signal?.removeEventListener("abort", onAbort);
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
          reject(new DOMException("Bootstrap wait aborted", "AbortError"));
        };

        unsub = bus.once(event, finish);
        signal?.addEventListener("abort", onAbort);
      });
    },

    reset(): void {
      emitted.clear();
      listeners.clear();
    },
  };

  return bus;
}

export const bootstrapEvents = createBootstrapEventBus();

export type BootstrapEventBus = typeof bootstrapEvents;
