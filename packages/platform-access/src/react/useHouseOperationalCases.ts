import { useEffect, useMemo, useState } from 'react';

import { listWorkspaceHouses } from '../domain/workspaceHouseProjection';
import { fetchHouseOperationalLeads } from '../api/houseOperationalLeadsClient';
import { fetchHouseOperationalSessions } from '../api/houseOperationalSessionsClient';
import { fetchRoomNamesByHouseId } from '../api/houseRoomNamesClient';
import { aggregateHouseOperations } from '../operations/aggregateHouseOperations';
import {
  selectScopedOperationalCases,
} from '../operations/selectHouseOperationalCases';
import type {
  HouseOperationalAggregate,
  HouseOperationalCase,
  OperationalDecisionSnapshot,
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
  const [durableSessions, setDurableSessions] = useState<
    readonly OperationalDecisionSnapshot[]
  >([]);
  const [roomNamesByHouseId, setRoomNamesByHouseId] = useState<
    Readonly<Record<string, Readonly<Record<string, string>>>>
  >({});

  useEffect(() => {
    if (companyId === null || projectId === null) {
      setDurableLeads([]);
      setDurableSessions([]);
      setRoomNamesByHouseId({});
      return;
    }
    let cancelled = false;
    const houses = listWorkspaceHouses(projectId);
    void Promise.all([
      fetchHouseOperationalLeads({
        companyId,
        projectId,
        houseId: activeHouseId,
      }),
      fetchHouseOperationalSessions({
        companyId,
        projectId,
        houseId: activeHouseId,
      }),
      fetchRoomNamesByHouseId({ houses }),
    ]).then(([leads, sessions, roomNames]) => {
      if (!cancelled) {
        setDurableLeads(leads);
        setDurableSessions(sessions);
        setRoomNamesByHouseId(roomNames);
      }
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
      roomNames: roomNamesByHouseId[house.houseId],
    }));
    const cases = selectScopedOperationalCases({
      companyId,
      projectId,
      activeHouseId,
      houses,
      durableLeads,
      durableSessions,
    });
    return {
      cases,
      aggregate: aggregateHouseOperations(cases),
      companyId,
      projectId,
      activeHouseId,
    };
  }, [activeHouseId, companyId, durableLeads, durableSessions, projectId, roomNamesByHouseId]);
}
