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

/**
 * CAP-BLD-02/04/08 — mount active HP-002; remount after persist / project switch.
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
    let cancelled = false;
    if (diskRoot === null) {
      setState({
        status: 'error',
        message: 'No active workspace project. Open a project in Workspace.',
      });
      return;
    }

    setState({ status: 'loading' });
    void mountHousePackage({ diskRoot })
      .then((mount) => {
        if (!cancelled) {
          setState({ status: 'ready', mount });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'House Package mount failed.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [diskRoot]);

  return { state, remount };
}
