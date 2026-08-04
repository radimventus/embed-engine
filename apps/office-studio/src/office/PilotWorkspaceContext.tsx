/**
 * CAP-OP-01 / CAP-OP-03 / CAP-OP-04 / CAP-OP-06 — Shared Pilot Workspace context.
 * Inbox · Timeline · Workflow Runtime · in-memory · no persistence.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { PilotEventCatalog } from './pilotEventCatalog';
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
  createEmptyTimelineRuntimeState,
  loadTimelineForCase,
  reducePilotTimeline,
  type PilotTimelineRuntimeState,
} from './pilotTimelineRuntime';
import type { PilotTimelineEventId } from './pilotTimelineModel';
import { mockPilotEventCatalog } from './pilotTimelineStore';
import {
  buildWorkflowNavigationEvent,
  type PilotWorkflowCatalogIntegration,
} from './pilotWorkflowCatalog';
import type { PilotWorkflowStepId } from './pilotWorkflowModel';
import {
  createInitialWorkflowRuntimeState,
  reducePilotWorkflow,
  type PilotWorkflowRuntimeState,
} from './pilotWorkflowRuntime';
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
  readonly timeline: PilotTimelineRuntimeState;
  readonly selectTimelineEvent: (eventId: PilotTimelineEventId | null) => void;
  readonly clearTimelineSelection: () => void;
  readonly workflow: PilotWorkflowRuntimeState;
  readonly navigateWorkflowStep: (stepId: PilotWorkflowStepId) => void;
};

const PilotWorkspaceContext = createContext<PilotWorkspaceContextValue | null>(
  null,
);

type PilotWorkspaceProviderProps = {
  readonly children: ReactNode;
  readonly initialCaseId?: PilotWorkspaceCaseId | null;
  readonly initialTerminalView?: PilotTerminalViewId;
  readonly timelineIntegrations?: PilotInboxTimelineIntegration;
  readonly eventCatalog?: PilotEventCatalog;
  readonly workflowIntegrations?: PilotWorkflowCatalogIntegration;
};

/**
 * Provides active obchodní případ, Inbox, Timeline and Workflow Runtime.
 * Workflow navigates Working Terminal tabs without owning commercial data.
 */
export function PilotWorkspaceProvider({
  children,
  initialCaseId = PILOT_WORKSPACE_DEMO_CASES[0]?.id ?? null,
  initialTerminalView = PILOT_TERMINAL_DEFAULT_VIEW,
  timelineIntegrations = {},
  eventCatalog = mockPilotEventCatalog,
  workflowIntegrations = {},
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
  const [timeline, setTimeline] = useState<PilotTimelineRuntimeState>(
    createEmptyTimelineRuntimeState,
  );
  const [workflow, setWorkflow] = useState<PilotWorkflowRuntimeState>(() =>
    createInitialWorkflowRuntimeState(
      initialCaseId !== null ? getPilotWorkspaceCase(initialCaseId) : null,
    ),
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

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const events = await loadTimelineForCase(activeCaseId, eventCatalog);
      if (cancelled) return;
      const nextCase =
        activeCaseId === null
          ? null
          : (cases.find((item) => item.id === activeCaseId) ??
            getPilotWorkspaceCase(activeCaseId));
      setTimeline((current) =>
        reducePilotTimeline(current, {
          type: 'load-case',
          caseId: activeCaseId,
          events,
        }),
      );
      setWorkflow((current) =>
        reducePilotWorkflow(current, {
          type: 'project-case',
          activeCase: nextCase,
          events,
          projector: workflowIntegrations.projector,
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [activeCaseId, cases, eventCatalog, workflowIntegrations.projector]);

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

  const selectTimelineEvent = useCallback(
    (eventId: PilotTimelineEventId | null) => {
      setTimeline((current) =>
        reducePilotTimeline(current, { type: 'select-event', eventId }),
      );
    },
    [],
  );

  const clearTimelineSelection = useCallback(() => {
    setTimeline((current) =>
      reducePilotTimeline(current, { type: 'clear-selection' }),
    );
  }, []);

  const navigateWorkflowStep = useCallback(
    (stepId: PilotWorkflowStepId) => {
      const step = workflow.steps.find((item) => item.id === stepId);
      if (step === undefined) return;
      setWorkflow((current) =>
        reducePilotWorkflow(current, {
          type: 'highlight-step',
          stepId,
        }),
      );
      setTerminalView(step.terminalView);
      void workflowIntegrations.emitNavigationEvent?.(
        buildWorkflowNavigationEvent({
          stepId,
          caseId: activeCaseId,
          terminalView: step.terminalView,
        }),
      );
    },
    [activeCaseId, workflow.steps, workflowIntegrations],
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
      timeline,
      selectTimelineEvent,
      clearTimelineSelection,
      workflow,
      navigateWorkflowStep,
    }),
    [
      activeCase,
      activeCaseId,
      assignInboxCase,
      cases,
      clearTimelineSelection,
      createCasePlaceholder,
      inbox,
      navigateWorkflowStep,
      selectCase,
      selectInboxMessage,
      selectTimelineEvent,
      selectedInboxMessage,
      terminalView,
      timeline,
      unassignInboxCase,
      workflow,
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
