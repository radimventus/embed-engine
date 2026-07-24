/// <reference types="vite/client" />

/** Injected at distribution build time from `.build/fingerprint.json`. */
declare const __EMBED_RUNTIME_BUILD__:
  | {
      readonly commit: string;
      readonly builtAt: string;
      readonly runtimeSource: string;
      readonly marker: string;
    }
  | undefined;
