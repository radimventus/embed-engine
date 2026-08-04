/**
 * CAP-OP-01 / PT-04 — Shared active commercial-case context (in-memory).
 * No persistence — PT-05 can consume without refactoring the Provider API.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  createPlaceholderCase,
  getPilotWorkspaceCase,
  PILOT_TERMINAL_DEFAULT_VIEW,
  PILOT_WORKSPACE_DEMO_CASES,
  type PilotTerminalViewId,
  type PilotWorkspaceCase,
  type PilotWorkspaceCaseId,
} from './pilotWorkspaceModel';

export type PilotWorkspaceContextValue = {
  readonly cases: readonly PilotWorkspaceCase[];
  readonly activeCaseId: PilotWorkspaceCaseId | null;
  readonly activeCase: PilotWorkspaceCase | null;
  readonly terminalView: PilotTerminalViewId;
  readonly selectCase: (caseId: PilotWorkspaceCaseId | null) => void;
  readonly setTerminalView: (view: PilotTerminalViewId) => void;
  readonly createCasePlaceholder: () => void;
};

const PilotWorkspaceContext = createContext<PilotWorkspaceContextValue | null>(
  null,
);

type PilotWorkspaceProviderProps = {
  readonly children: ReactNode;
  readonly initialCaseId?: PilotWorkspaceCaseId | null;
  readonly initialTerminalView?: PilotTerminalViewId;
};

/**
 * Provides active obchodní případ + terminal view for Pilot Workspace shell.
 */
export function PilotWorkspaceProvider({
  children,
  initialCaseId = PILOT_WORKSPACE_DEMO_CASES[0]?.id ?? null,
  initialTerminalView = PILOT_TERMINAL_DEFAULT_VIEW,
}: PilotWorkspaceProviderProps) {
  const [activeCaseId, setActiveCaseId] = useState<PilotWorkspaceCaseId | null>(
    initialCaseId,
  );
  const [terminalView, setTerminalView] =
    useState<PilotTerminalViewId>(initialTerminalView);
  const [extraCases, setExtraCases] = useState<readonly PilotWorkspaceCase[]>(
    [],
  );

  const cases = useMemo(
    () => [...PILOT_WORKSPACE_DEMO_CASES, ...extraCases],
    [extraCases],
  );

  const activeCase = useMemo(() => {
    if (activeCaseId === null) return null;
    return (
      cases.find((item) => item.id === activeCaseId) ??
      getPilotWorkspaceCase(activeCaseId)
    );
  }, [activeCaseId, cases]);

  const selectCase = useCallback((caseId: PilotWorkspaceCaseId | null) => {
    setActiveCaseId(caseId);
  }, []);

  const createCasePlaceholder = useCallback(() => {
    const next = createPlaceholderCase();
    setExtraCases((current) => [...current, next]);
    setActiveCaseId(next.id);
  }, []);

  const value = useMemo<PilotWorkspaceContextValue>(
    () => ({
      cases,
      activeCaseId,
      activeCase,
      terminalView,
      selectCase,
      setTerminalView,
      createCasePlaceholder,
    }),
    [
      activeCase,
      activeCaseId,
      cases,
      createCasePlaceholder,
      selectCase,
      terminalView,
    ],
  );

  return (
    <PilotWorkspaceContext.Provider value={value}>
      {children}
    </PilotWorkspaceContext.Provider>
  );
}

export function usePilotWorkspaceContext(): PilotWorkspaceContextValue {
  const value = useContext(PilotWorkspaceContext);
  if (value === null) {
    throw new Error(
      'usePilotWorkspaceContext must be used within PilotWorkspaceProvider',
    );
  }
  return value;
}
