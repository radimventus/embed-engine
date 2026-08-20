import { useEffect, useMemo, useState } from 'react';

import { listWorkspaceHouses } from '../domain/workspaceHouseProjection';
import { fetchHouseOperationalLeads } from '../api/houseOperationalLeadsClient';
import { aggregateHouseOperations } from '../operations/aggregateHouseOperations';
import {
  selectScopedOperationalCases,
} from '../operations/selectHouseOperationalCases';
import type {
  HouseOperationalAggregate,
  HouseOperationalCase,
  OperationalLeadRecord,
} from '../operations/operationalTypes';
import { usePlatformSession } from './SessionProvider';

export type HouseOperationalCasesState = {
  readonly cases: readonly HouseOperationalCase[];
  readonly aggregate: HouseOperationalAggregate;
  readonly companyId: string | null;
  readonly projectId: string | null;
  readonly activeHouseId: string | null;
};

export function useHouseOperationalCases(): HouseOperationalCasesState {
  const { session } = usePlatformSession();
  const companyId = session?.companyId?.trim() || null;
  const projectId = session?.projectId?.trim() || null;
  const activeHouseId = session?.activeHouseId?.trim() || null;
  const [durableLeads, setDurableLeads] = useState<
    readonly OperationalLeadRecord[]
  >([]);

  useEffect(() => {
    if (companyId === null || projectId === null) {
      setDurableLeads([]);
      return;
    }
    let cancelled = false;
    void fetchHouseOperationalLeads({
      companyId,
      projectId,
      houseId: activeHouseId,
    }).then((leads) => {
      if (!cancelled) setDurableLeads(leads);
    });
    return () => {
      cancelled = true;
    };
  }, [activeHouseId, companyId, projectId]);

  return useMemo(() => {
    if (companyId === null || projectId === null) {
      return {
        cases: [],
        aggregate: aggregateHouseOperations([]),
        companyId,
        projectId,
        activeHouseId,
      };
    }
    const houses = listWorkspaceHouses(projectId).map((house) => ({
      houseId: house.houseId,
      houseName: house.name,
      dataMode: house.dataMode,
    }));
    const cases = selectScopedOperationalCases({
      companyId,
      projectId,
      activeHouseId,
      houses,
      durableLeads,
    });
    return {
      cases,
      aggregate: aggregateHouseOperations(cases),
      companyId,
      projectId,
      activeHouseId,
    };
  }, [activeHouseId, companyId, durableLeads, projectId]);
}
