/**
 * CAP-OP-01 / CAP-OP-03 — Shared Pilot Workspace + Inbox Runtime context.
 * In-memory only — no persistence.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  getInboxMessage,
  type PilotInboxMessage,
  type PilotInboxMessageId,
} from './pilotInboxModel';
import {
  createInitialInboxRuntimeState,
  reducePilotInbox,
  type PilotInboxRuntimeState,
} from './pilotInboxRuntime';
import {
  buildInboxMessageAssignedEvent,
  buildInboxMessageSelectedEvent,
  buildInboxMessageUnassignedEvent,
  notifyInboxTimeline,
  type PilotInboxTimelineIntegration,
} from './pilotInboxTimeline';
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
  readonly inbox: PilotInboxRuntimeState;
  readonly selectedInboxMessage: PilotInboxMessage | null;
  readonly selectInboxMessage: (messageId: PilotInboxMessageId | null) => void;
  readonly assignInboxCase: (
    messageId: PilotInboxMessageId,
    caseId: PilotWorkspaceCaseId,
  ) => void;
  readonly unassignInboxCase: (messageId: PilotInboxMessageId) => void;
};

const PilotWorkspaceContext = createContext<PilotWorkspaceContextValue | null>(
  null,
);

type PilotWorkspaceProviderProps = {
  readonly children: ReactNode;
  readonly initialCaseId?: PilotWorkspaceCaseId | null;
  readonly initialTerminalView?: PilotTerminalViewId;
  readonly timelineIntegrations?: PilotInboxTimelineIntegration;
};

/**
 * Provides active obchodní případ, terminal view and Inbox Runtime.
 * Selecting / assigning a message updates the shared case context.
 */
export function PilotWorkspaceProvider({
  children,
  initialCaseId = PILOT_WORKSPACE_DEMO_CASES[0]?.id ?? null,
  initialTerminalView = PILOT_TERMINAL_DEFAULT_VIEW,
  timelineIntegrations = {},
}: PilotWorkspaceProviderProps) {
  const [activeCaseId, setActiveCaseId] = useState<PilotWorkspaceCaseId | null>(
    initialCaseId,
  );
  const [terminalView, setTerminalView] =
    useState<PilotTerminalViewId>(initialTerminalView);
  const [extraCases, setExtraCases] = useState<readonly PilotWorkspaceCase[]>(
    [],
  );
  const [inbox, setInbox] = useState<PilotInboxRuntimeState>(
    createInitialInboxRuntimeState,
  );
  const inboxRef = useRef(inbox);
  inboxRef.current = inbox;

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

  const selectedInboxMessage = useMemo(
    () => getInboxMessage(inbox.messages, inbox.selectedMessageId),
    [inbox.messages, inbox.selectedMessageId],
  );

  const selectCase = useCallback((caseId: PilotWorkspaceCaseId | null) => {
    setActiveCaseId(caseId);
  }, []);

  const createCasePlaceholder = useCallback(() => {
    const next = createPlaceholderCase();
    setExtraCases((current) => [...current, next]);
    setActiveCaseId(next.id);
  }, []);

  const selectInboxMessage = useCallback(
    (messageId: PilotInboxMessageId | null) => {
      const next = reducePilotInbox(inboxRef.current, {
        type: 'select-message',
        messageId,
      });
      setInbox(next);
      const message = getInboxMessage(next.messages, next.selectedMessageId);
      if (message !== null) {
        if (message.caseId !== null) {
          setActiveCaseId(message.caseId);
        }
        void notifyInboxTimeline(
          timelineIntegrations,
          buildInboxMessageSelectedEvent({
            messageId: message.id,
            caseId: message.caseId,
            category: message.category,
            subject: message.subject,
          }),
        );
      }
    },
    [timelineIntegrations],
  );

  const assignInboxCase = useCallback(
    (messageId: PilotInboxMessageId, caseId: PilotWorkspaceCaseId) => {
      const next = reducePilotInbox(inboxRef.current, {
        type: 'assign-case',
        messageId,
        caseId,
      });
      setInbox(next);
      setActiveCaseId(caseId);
      const message = getInboxMessage(next.messages, messageId);
      if (message !== null) {
        void notifyInboxTimeline(
          timelineIntegrations,
          buildInboxMessageAssignedEvent({
            messageId,
            caseId,
            category: message.category,
            subject: message.subject,
          }),
        );
      }
    },
    [timelineIntegrations],
  );

  const unassignInboxCase = useCallback(
    (messageId: PilotInboxMessageId) => {
      const next = reducePilotInbox(inboxRef.current, {
        type: 'unassign-case',
        messageId,
      });
      setInbox(next);
      const message = getInboxMessage(next.messages, messageId);
      if (message !== null) {
        void notifyInboxTimeline(
          timelineIntegrations,
          buildInboxMessageUnassignedEvent({
            messageId,
            category: message.category,
            subject: message.subject,
          }),
        );
      }
    },
    [timelineIntegrations],
  );

  const value = useMemo<PilotWorkspaceContextValue>(
    () => ({
      cases,
      activeCaseId,
      activeCase,
      terminalView,
      selectCase,
      setTerminalView,
      createCasePlaceholder,
      inbox,
      selectedInboxMessage,
      selectInboxMessage,
      assignInboxCase,
      unassignInboxCase,
    }),
    [
      activeCase,
      activeCaseId,
      assignInboxCase,
      cases,
      createCasePlaceholder,
      inbox,
      selectCase,
      selectInboxMessage,
      selectedInboxMessage,
      terminalView,
      unassignInboxCase,
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
