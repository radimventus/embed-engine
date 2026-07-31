/**
 * @legacy CAP-BLD-07 quarantine — Stub Runtime Adapter.
 * NOT Shared Runtime. NOT used by BuilderStudioApp.
 * Kept only for legacy unit tests (`pnpm test:legacy`).
 * See `src/legacy/README.md`.
 */

import type { RuntimeAdapter, RuntimeAdapterStatus } from '../../model';

const STUB_RUNTIME_VERSION = 'adapter-stub-1.0.0';

export function createStubRuntimeAdapter(options?: {
  readonly runtimeVersion?: string;
  readonly failOnLoad?: boolean;
}): RuntimeAdapter {
  const runtimeVersion = options?.runtimeVersion ?? STUB_RUNTIME_VERSION;
  let status: RuntimeAdapterStatus = {
    state: 'idle',
    packageId: null,
    runtimeVersion,
    message: null,
  };

  return {
    loadPackage(input) {
      if (options?.failOnLoad === true) {
        status = {
          state: 'error',
          packageId: input.packageId,
          runtimeVersion,
          message: 'Stub adapter failed to load package.',
        };
        return status;
      }
      status = {
        state: 'loaded',
        packageId: input.packageId,
        runtimeVersion,
        message: `Loaded entry ${input.runtimeEntry}`,
      };
      return status;
    },

    unload() {
      status = {
        state: 'idle',
        packageId: null,
        runtimeVersion,
        message: null,
      };
      return status;
    },

    reload(input) {
      return this.loadPackage(input);
    },

    getStatus() {
      return status;
    },
  };
}
