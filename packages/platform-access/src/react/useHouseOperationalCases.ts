import { useCallback, useEffect, useMemo, useState } from 'react';

import { listWorkspaceHouses } from '../domain/workspaceHouseProjection';
import { acceptHouseOperationalLead } from '../api/acceptHouseOperationalLead';
import { fetchReadinessCatalogsByHouseId } from '../api/houseRoomNamesClient';
import { fetchHouseOperationalLeads } from '../api/houseOperationalLeadsClient';
import { fetchHouseOperationalSessions } from '../api/houseOperationalSessionsClient';
import { aggregateHouseOperations } from '../operations/aggregateHouseOperations';
import {
  selectScopedOperationalCases,
} from '../operations/selectHouseOperationalCases';
import type { ReadinessCatalog } from '../readiness/readinessTypes';
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
  readonly acceptLead: (input: {
    readonly leadId: string;
    readonly houseId: string;
  }) => Promise<boolean>;
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
  const [catalogsByHouseId, setCatalogsByHouseId] = useState<
    Readonly<
      Record<
        string,
        {
          readonly roomNames: Readonly<Record<string, string>>;
          readonly catalog: ReadinessCatalog;
        }
      >
    >
  >({});
  const [refreshToken, setRefreshToken] = useState(0);

  const acceptLead = useCallback(
    async (input: { readonly leadId: string; readonly houseId: string }) => {
      if (companyId === null || projectId === null) {
        return false;
      }
      const ok = await acceptHouseOperationalLead({
        leadId: input.leadId,
        companyId,
        projectId,
        houseId: input.houseId,
      });
      if (ok) {
        setDurableLeads((current) =>
          current.map((lead) =>
            lead.leadId === input.leadId && lead.houseId === input.houseId
              ? { ...lead, processingStatus: 'accepted' as const }
              : lead,
          ),
        );
        setRefreshToken((value) => value + 1);
      }
      return ok;
    },
    [companyId, projectId],
  );

  useEffect(() => {
    if (companyId === null || projectId === null) {
      setDurableLeads([]);
      setDurableSessions([]);
      setCatalogsByHouseId({});
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
      fetchReadinessCatalogsByHouseId({ houses }),
    ]).then(([leads, sessions, catalogs]) => {
      if (!cancelled) {
        setDurableLeads(leads);
        setDurableSessions(sessions);
        setCatalogsByHouseId(catalogs);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeHouseId, companyId, projectId, refreshToken]);

  const projected = useMemo(() => {
    if (companyId === null || projectId === null) {
      return {
        cases: [] as readonly HouseOperationalCase[],
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
      roomNames: catalogsByHouseId[house.houseId]?.roomNames,
      readinessCatalog: catalogsByHouseId[house.houseId]?.catalog,
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
  }, [activeHouseId, companyId, durableLeads, durableSessions, projectId, catalogsByHouseId]);

  return {
    ...projected,
    acceptLead,
  };
}
