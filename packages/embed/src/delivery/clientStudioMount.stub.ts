/**
 * Node / `tsc` stub for `@client-studio/embed-mount`.
 * Vite overrides this alias to `apps/client-studio/src/embed/mountClientStudio.tsx`.
 */

import type { DecisionSessionRuntime } from "@embed-engine/runtime";

export type MountClientStudioOptions = {
  readonly target: HTMLElement;
  readonly runtime: DecisionSessionRuntime;
};

export type ClientStudioMountHandle = {
  readonly dispose: () => void;
  readonly rootElement: HTMLElement;
};

export function mountClientStudio(
  _options: MountClientStudioOptions,
): ClientStudioMountHandle {
  throw new Error(
    "Client Studio mount requires the Embed Vite bundle (stub loaded in Node tests).",
  );
}
