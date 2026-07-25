/**
 * Local bootstrap event bus for Embed package unit tests / tsc.
 * Identical contract to Client Studio `bootstrapEvents.ts`.
 * Production IIFE/ESM resolve the Client Studio module via Vite alias
 * (`@client-studio/bootstrap-events`) so Provider and Reveal share one instance.
 */
export declare const BOOTSTRAP_EVENTS: readonly ["BOOTSTRAP_STARTED", "BOOTSTRAP_LOADING", "RUNTIME_READY", "EXPERIENCE_READY", "REVEAL_READY"];
export type BootstrapEventName = (typeof BOOTSTRAP_EVENTS)[number];
type Listener = () => void;
export declare const bootstrapEvents: {
    emit(event: BootstrapEventName): void;
    on(event: BootstrapEventName, listener: Listener): () => void;
    once(event: BootstrapEventName, listener: Listener): () => void;
    hasEmitted(event: BootstrapEventName): boolean;
    waitFor(event: BootstrapEventName, signal?: AbortSignal): Promise<void>;
    reset(): void;
};
export type BootstrapEventBus = typeof bootstrapEvents;
export {};
//# sourceMappingURL=bootstrapEvents.d.ts.map