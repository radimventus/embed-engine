import { useEffect, useMemo, useState } from 'react';

import {
  createHousePackageEditSession,
  type HousePackageEditSession,
  type HousePackageEditSnapshot,
} from './housePackageEditSession';
import { useHousePackageMount } from './useHousePackageMount';

export type HousePackageEditController = {
  readonly mountStatus: ReturnType<typeof useHousePackageMount>;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly session: HousePackageEditSession | null;
  readonly apply: (next: HousePackageEditSnapshot) => void;
};

/**
 * CAP-BLD-03 — mount HP then expose in-memory edit session.
 */
export function useHousePackageEditController(): HousePackageEditController {
  const mountStatus = useHousePackageMount();
  const session = useMemo(() => {
    if (mountStatus.status !== 'ready') {
      return null;
    }
    return createHousePackageEditSession(mountStatus.mount);
  }, [mountStatus]);

  const [snapshot, setSnapshot] = useState<HousePackageEditSnapshot | null>(
    null,
  );

  useEffect(() => {
    if (session === null) {
      setSnapshot(null);
      return;
    }
    setSnapshot(session.snapshot());
  }, [session]);

  return {
    mountStatus,
    snapshot,
    session,
    apply(next) {
      setSnapshot(next);
    },
  };
}
