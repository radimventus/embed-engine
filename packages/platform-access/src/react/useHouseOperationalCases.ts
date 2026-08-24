import { useCallback, useEffect, useMemo, useState } from "react";

import { listWorkspaceHouses } from "../domain/workspaceHouseProjection";
import { acceptHouseOperationalLead } from "../api/acceptHouseOperationalLead";
import {
  acceptOperationalReferenceCase,
  fetchOperationalCaseProcessing,
} from "../api/operationalCaseProcessingClient";
import { fetchReadinessCatalogsByHouseId } from "../api/houseRoomNamesClient";
import { fetchHouseOperationalLeads } from "../api/houseOperationalLeadsClient";
import { fetchHouseOperationalSessions } from "../api/houseOperationalSessionsClient";
import { aggregateHouseOperations } from "../operations/aggregateHouseOperations";
import { applyReferenceCaseProcessing } from "../operations/applyReferenceCaseProcessing";
import { selectScopedOperationalCases } from "../operations/selectHouseOperationalCases";
import type { ReadinessCatalog } from "../readiness/readinessTypes";
import type {
  HouseOperationalAggregate,
  HouseOperationalCase,
  OperationalDecisionSnapshot,
  OperationalHouseScope,
  OperationalLeadRecord,
} from "../operations/operationalTypes";
import type { OperationalCaseProcessingRecord } from "../operations/applyReferenceCaseProcessing";
import { usePlatformSession } from "./SessionProvider";

export type HouseOperationalCasesState = {
  readonly cases: readonly HouseOperationalCase[];
  readonly projectLeads: readonly OperationalLeadRecord[];
  readonly decisionSessions: readonly OperationalDecisionSnapshot[];
  readonly houses: readonly OperationalHouseScope[];
  readonly aggregate: HouseOperationalAggregate;
  readonly companyId: string | null;
  readonly projectId: string | null;
  readonly activeHouseId: string | null;
  readonly activeHouseName: string | null;
  readonly acceptLead: (input: {
    readonly leadId: string;
    readonly houseId: string;
  }) => Promise<boolean>;
  readonly acceptReferenceCase: (input: {
    readonly caseId: string;
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
  const [caseProcessing, setCaseProcessing] = useState<
    readonly OperationalCaseProcessingRecord[]
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
              ? { ...lead, processingStatus: "accepted" as const }
              : lead,
          ),
        );
        setRefreshToken((value) => value + 1);
      }
      return ok;
    },
    [companyId, projectId],
  );

  const acceptReferenceCase = useCallback(
    async (input: { readonly caseId: string; readonly houseId: string }) => {
      if (companyId === null || projectId === null) {
        return false;
      }
      const ok = await acceptOperationalReferenceCase({
        caseId: input.caseId,
        companyId,
        projectId,
        houseId: input.houseId,
      });
      if (ok) {
        setCaseProcessing((current) => {
          const next: OperationalCaseProcessingRecord = {
            caseId: input.caseId,
            companyId,
            projectId,
            houseId: input.houseId,
            processingStatus: "accepted",
          };
          const index = current.findIndex(
            (item) => item.caseId === input.caseId,
          );
          if (index < 0) {
            return [...current, next];
          }
          const copy = [...current];
          copy[index] = next;
          return copy;
        });
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
      setCaseProcessing([]);
      setCatalogsByHouseId({});
      return;
    }
    let cancelled = false;
    const houses = listWorkspaceHouses(projectId);
    void Promise.all([
      fetchHouseOperationalLeads({
        companyId,
        projectId,
      }),
      fetchHouseOperationalSessions({
        companyId,
        projectId,
        houseId: activeHouseId,
      }),
      fetchOperationalCaseProcessing({
        companyId,
        projectId,
      }),
      fetchReadinessCatalogsByHouseId({ houses }),
    ]).then(([leads, sessions, processing, catalogs]) => {
      if (!cancelled) {
        setDurableLeads(leads);
        setDurableSessions(sessions);
        setCaseProcessing(processing);
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
        projectLeads: [] as readonly OperationalLeadRecord[],
        decisionSessions: [] as readonly OperationalDecisionSnapshot[],
        houses: [] as readonly OperationalHouseScope[],
        aggregate: aggregateHouseOperations([]),
        companyId,
        projectId,
        activeHouseId,
        activeHouseName: null,
      };
    }
    const houses: readonly OperationalHouseScope[] = listWorkspaceHouses(
      projectId,
    ).map((house) => ({
      houseId: house.houseId,
      houseName: house.name,
      dataMode: house.dataMode,
      roomNames: catalogsByHouseId[house.houseId]?.roomNames,
      readinessCatalog: catalogsByHouseId[house.houseId]?.catalog,
    }));
    const cases = applyReferenceCaseProcessing(
      selectScopedOperationalCases({
        companyId,
        projectId,
        activeHouseId,
        houses,
        durableLeads,
        durableSessions,
      }),
      caseProcessing,
    );
    return {
      cases,
      projectLeads: durableLeads,
      decisionSessions: durableSessions,
      houses,
      aggregate: aggregateHouseOperations(cases),
      companyId,
      projectId,
      activeHouseId,
      activeHouseName:
        activeHouseId === null
          ? null
          : (houses.find((house) => house.houseId === activeHouseId)
              ?.houseName ?? null),
    };
  }, [
    activeHouseId,
    caseProcessing,
    catalogsByHouseId,
    companyId,
    durableLeads,
    durableSessions,
    projectId,
  ]);

  return {
    ...projected,
    acceptLead,
    acceptReferenceCase,
  };
}
