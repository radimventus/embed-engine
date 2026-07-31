import { useEffect, useState } from 'react';

import {
  mountHousePackage,
  type HousePackageMount,
} from './mountHousePackage';

export type HousePackageMountState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly mount: HousePackageMount }
  | { readonly status: 'error'; readonly message: string };

/**
 * CAP-BLD-02 — mount HP-002 once on Builder open (read-only).
 */
export function useHousePackageMount(): HousePackageMountState {
  const [state, setState] = useState<HousePackageMountState>({
    status: 'loading',
  });

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

  return state;
}
