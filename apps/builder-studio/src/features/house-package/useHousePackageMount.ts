import { useCallback, useEffect, useState } from 'react';

import {
  mountHousePackage,
  type HousePackageMount,
} from './mountHousePackage';

export type HousePackageMountState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly mount: HousePackageMount }
  | { readonly status: 'error'; readonly message: string };

export type UseHousePackageMountResult = {
  readonly state: HousePackageMountState;
  readonly remount: () => Promise<HousePackageMount>;
};

/**
 * CAP-BLD-02/04 — mount HP-002; remount after persist.
 */
export function useHousePackageMount(): UseHousePackageMountResult {
  const [state, setState] = useState<HousePackageMountState>({
    status: 'loading',
  });

  const remount = useCallback(async (): Promise<HousePackageMount> => {
    setState({ status: 'loading' });
    try {
      const mount = await mountHousePackage();
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
  }, []);

  useEffect(() => {
    let cancelled = false;

    void mountHousePackage()
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
  }, []);

  return { state, remount };
}
