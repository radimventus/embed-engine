import { useCallback, useEffect, useState } from 'react';

import {
  mountHousePackage,
  type HousePackageMount,
} from './mountHousePackage';
import { HOUSE_PACKAGE_DISK_ROOT } from './housePackagePaths';

export type HousePackageMountState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly mount: HousePackageMount }
  | { readonly status: 'error'; readonly message: string };

export type UseHousePackageMountResult = {
  readonly state: HousePackageMountState;
  readonly remount: () => Promise<HousePackageMount>;
};

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  );
}

/**
 * CAP-BLD-02/04/08 — mount active HP-002; abort in-flight fetch on switch (PR-003B).
 */
export function useHousePackageMount(
  diskRoot: string | null = HOUSE_PACKAGE_DISK_ROOT,
): UseHousePackageMountResult {
  const [state, setState] = useState<HousePackageMountState>({
    status: 'loading',
  });

  const remount = useCallback(async (): Promise<HousePackageMount> => {
    if (diskRoot === null) {
      const message = 'No active workspace project.';
      setState({ status: 'error', message });
      throw new Error(message);
    }
    setState({ status: 'loading' });
    try {
      const mount = await mountHousePackage({ diskRoot });
      setState({ status: 'ready', mount });
      return mount;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'House Package mount failed.';
      setState({ status: 'error', message });
      throw error instanceof Error ? error : new Error(message);
    }
  }, [diskRoot]);

  useEffect(() => {
    if (diskRoot === null) {
      setState({
        status: 'error',
        message: 'No active workspace project. Open a project in Workspace.',
      });
      return;
    }

    const abort = new AbortController();
    setState({ status: 'loading' });
    void mountHousePackage({ diskRoot, signal: abort.signal })
      .then((mount) => {
        if (!abort.signal.aborted) {
          setState({ status: 'ready', mount });
        }
      })
      .catch((error: unknown) => {
        if (abort.signal.aborted || isAbortError(error)) {
          return;
        }
        setState({
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'House Package mount failed.',
        });
      });

    return () => {
      abort.abort();
    };
  }, [diskRoot]);

  return { state, remount };
}
