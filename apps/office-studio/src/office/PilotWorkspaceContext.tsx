/**
 * CAP-OP-01 … CAP-OP-10 — Shared Pilot Workspace context.
 * Active Case · Active Conversation · Mail Session · Conversation-only Inbox/Timeline.
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

import {
  DEFAULT_PILOT_MAILBOX_ID,
  wirePilotMailTransportSession,
  type MailSyncReport,
  type PilotMailTransportSession,
  type SystemMailDraft,
} from '../mail';
import { getConversationMailStore } from '../mail/conversationMailStore';
import type {
  PilotConversationId,
  PilotConversationMessage,
} from './pilotConversationModel';
import {
  createInitialConversationRuntimeState,
  reducePilotConversation,
  type PilotConversationRuntimeState,
} from './pilotConversationRuntime';
import { loadTimelineForCaseFromConversation } from './pilotConversationTimeline';
import type { PilotEventCatalog } from './pilotEventCatalog';
import {
  getInboxMessage,
  type PilotInboxMessage,
  type PilotInboxMessageId,
} from './pilotInboxModel';
import { conversationIdForInboxMessage } from './pilotInboxProjection';
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
import type { PilotTimelineEventId } from './pilotTimelineModel';
import {
  createEmptyTimelineRuntimeState,
  reducePilotTimeline,
  type PilotTimelineRuntimeState,
} from './pilotTimelineRuntime';
import { mockPilotEventCatalog } from './pilotTimelineStore';
import {
  buildWorkflowNavigationEvent,
  type PilotWorkflowCatalogIntegration,
} from './pilotWorkflowCatalog';
import type { PilotWorkflowStepId } from './pilotWorkflowModel';
import {
  buildWorkflowMessageEvent,
  notifyWorkflowMessageEvent,
} from './pilotWorkflowMessageEvents';
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
import { resolveCaseWithWorkflowSync } from './commercialWorkflowSync';
import { planPilotProjectActivation } from './pilotProjectActivation';

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
  readonly conversation: PilotConversationRuntimeState;
  readonly selectConversation: (
    conversationId: PilotConversationId | null,
  ) => void;
  readonly mailSessionActive: boolean;
  readonly syncMailboxTransport: (
    mailboxId?: string,
  ) => Promise<MailSyncReport>;
  readonly sendSystemMail: (
    draft: SystemMailDraft,
  ) => Promise<PilotConversationMessage>;
  readonly refreshConversationFromStore: () => void;
};

const PilotWorkspaceContext = createContext<PilotWorkspaceContextValue | null>(
  null,
);

type PilotWorkspaceProviderProps = {
  readonly children: ReactNode;
  readonly initialCaseId?: PilotWorkspaceCaseId | null;
  readonly initialTerminalView?: PilotTerminalViewId;
  readonly timelineIntegrations?: PilotInboxTimelineIntegration;
  /** @deprecated Timeline loads from Conversation only (CAP-OP-10). */
  readonly eventCatalog?: PilotEventCatalog;
  readonly workflowIntegrations?: PilotWorkflowCatalogIntegration;
  /**
   * Injected mail session. Default: wirePilotMailTransportSession(mbx-conis-contact).
   * Node may inject createEnvMailTransportSession — identical Session API.
   */
  readonly mailTransport?: PilotMailTransportSession;
  readonly defaultMailboxId?: string;
};

export function PilotWorkspaceProvider({
  children,
  initialCaseId = PILOT_WORKSPACE_DEMO_CASES[0]?.id ?? null,
  initialTerminalView = PILOT_TERMINAL_DEFAULT_VIEW,
  timelineIntegrations = {},
  eventCatalog: _eventCatalog = mockPilotEventCatalog,
  workflowIntegrations = {},
  mailTransport,
  defaultMailboxId = DEFAULT_PILOT_MAILBOX_ID,
}: PilotWorkspaceProviderProps) {
  void _eventCatalog;

  const sessionRef = useRef<PilotMailTransportSession | null>(null);
  if (sessionRef.current === null) {
    sessionRef.current =
      mailTransport ??
      wirePilotMailTransportSession({ mailboxId: defaultMailboxId });
  }
  if (mailTransport !== undefined) {
    sessionRef.current = mailTransport;
  }

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
  const [conversation, setConversation] =
    useState<PilotConversationRuntimeState>(() =>
      createInitialConversationRuntimeState(initialCaseId),
    );
  const inboxRef = useRef(inbox);
  inboxRef.current = inbox;

  const cases = useMemo(
    () => [...PILOT_WORKSPACE_DEMO_CASES, ...extraCases],
    [extraCases],
  );

  const activeCase = useMemo(() => {
    if (activeCaseId === null) return null;
    const found =
      cases.find((item) => item.id === activeCaseId) ??
      getPilotWorkspaceCase(activeCaseId);
    return found === null ? null : resolveCaseWithWorkflowSync(found);
  }, [activeCaseId, cases]);

  const selectedInboxMessage = useMemo(
    () => getInboxMessage(inbox.messages, inbox.selectedMessageId),
    [inbox.messages, inbox.selectedMessageId],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const events = await loadTimelineForCaseFromConversation(activeCaseId);
      if (cancelled) return;
      const nextCase =
        activeCaseId === null
          ? null
          : (cases.find((item) => item.id === activeCaseId) ??
            getPilotWorkspaceCase(activeCaseId));
      const projected =
        nextCase === null ? null : resolveCaseWithWorkflowSync(nextCase);
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
          activeCase: projected,
          events,
          projector: workflowIntegrations.projector,
        }),
      );
      setInbox((current) => {
        const refreshed = reducePilotInbox(current, {
          type: 'refresh-from-conversation',
        });
        const selectedStillVisible =
          refreshed.selectedMessageId !== null &&
          refreshed.messages.some(
            (message) =>
              message.id === refreshed.selectedMessageId &&
              (activeCaseId === null || message.caseId === activeCaseId),
          );
        return {
          ...refreshed,
          selectedMessageId: selectedStillVisible
            ? refreshed.selectedMessageId
            : null,
        };
      });
      setConversation((current) =>
        reducePilotConversation(current, {
          type: 'load-for-case',
          caseId: activeCaseId,
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [activeCaseId, cases, workflowIntegrations.projector]);

  /**
   * R-001 — Select Project activates the full working environment synchronously.
   * Working Terminal · Workflow · Conversation · Inbox · Timeline · Detail.
   */
  const selectCase = useCallback(
    (caseId: PilotWorkspaceCaseId | null) => {
      const plan = planPilotProjectActivation({
        caseId,
        cases,
        lookup: getPilotWorkspaceCase,
        inbox: inboxRef.current,
      });
      setActiveCaseId(plan.activeCaseId);
      setTerminalView(plan.terminalView);
      setWorkflow(plan.workflow);
      setConversation(plan.conversation);
      setTimeline(plan.timeline);
      setInbox((current) => ({
        ...reducePilotInbox(current, { type: 'refresh-from-conversation' }),
        selectedMessageId: plan.inboxSelectedMessageId,
      }));
    },
    [cases],
  );

  const createCasePlaceholder = useCallback(() => {
    const next = createPlaceholderCase();
    setExtraCases((current) => [...current, next]);
    const plan = planPilotProjectActivation({
      caseId: next.id,
      cases: [...PILOT_WORKSPACE_DEMO_CASES, ...extraCases, next],
      lookup: (id) =>
        id === next.id ? next : getPilotWorkspaceCase(id),
      inbox: inboxRef.current,
    });
    setActiveCaseId(plan.activeCaseId);
    setTerminalView(plan.terminalView);
    setWorkflow(plan.workflow);
    setConversation(plan.conversation);
    setTimeline(plan.timeline);
    setInbox((current) => ({
      ...reducePilotInbox(current, { type: 'refresh-from-conversation' }),
      selectedMessageId: plan.inboxSelectedMessageId,
    }));
  }, [extraCases]);

  const selectInboxMessage = useCallback(
    (messageId: PilotInboxMessageId | null) => {
      const next = reducePilotInbox(inboxRef.current, {
        type: 'select-message',
        messageId,
      });
      setInbox(next);
      const message = getInboxMessage(next.messages, next.selectedMessageId);
      if (message === null) return;

      if (message.caseId !== null) {
        setActiveCaseId(message.caseId);
      }
      const conversationId = conversationIdForInboxMessage(message.id);
      if (conversationId !== null) {
        setConversation((current) =>
          reducePilotConversation(current, {
            type: 'select-conversation',
            conversationId,
          }),
        );
      }
      const storeMessage = getConversationMailStore().messages.find(
        (item) => item.id === message.id,
      );
      if (storeMessage !== undefined) {
        void notifyWorkflowMessageEvent(
          workflowIntegrations,
          buildWorkflowMessageEvent({
            direction: storeMessage.direction,
            messageId: storeMessage.id,
            conversationId: storeMessage.conversationId,
            caseId: message.caseId,
            subject: storeMessage.subject,
            occurredAt: storeMessage.createdAt,
          }),
        );
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
    },
    [timelineIntegrations, workflowIntegrations],
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
      setConversation((current) =>
        reducePilotConversation(current, {
          type: 'refresh-from-store',
          caseId,
        }),
      );
      void loadTimelineForCaseFromConversation(caseId).then((events) => {
        setTimeline((current) =>
          reducePilotTimeline(current, {
            type: 'load-case',
            caseId,
            events,
          }),
        );
      });
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
      setConversation((current) =>
        reducePilotConversation(current, {
          type: 'refresh-from-store',
          caseId: activeCaseId,
        }),
      );
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
    [activeCaseId, timelineIntegrations],
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

  const selectConversation = useCallback(
    (conversationId: PilotConversationId | null) => {
      setConversation((current) =>
        reducePilotConversation(current, {
          type: 'select-conversation',
          conversationId,
        }),
      );
    },
    [],
  );

  const refreshConversationFromStore = useCallback(() => {
    setInbox((current) =>
      reducePilotInbox(current, { type: 'refresh-from-conversation' }),
    );
    setConversation((current) =>
      reducePilotConversation(current, {
        type: 'refresh-from-store',
        caseId: activeCaseId,
      }),
    );
    void loadTimelineForCaseFromConversation(activeCaseId).then((events) => {
      setTimeline((current) =>
        reducePilotTimeline(current, {
          type: 'load-case',
          caseId: activeCaseId,
          events,
        }),
      );
    });
  }, [activeCaseId]);

  const syncMailboxTransport = useCallback(
    async (mailboxId = defaultMailboxId) => {
      const report = await sessionRef.current!.syncMailbox(mailboxId);
      setInbox((current) =>
        reducePilotInbox(current, { type: 'refresh-from-conversation' }),
      );
      setConversation((current) =>
        reducePilotConversation(current, {
          type: 'refresh-from-store',
          caseId: activeCaseId,
        }),
      );
      const events = await loadTimelineForCaseFromConversation(activeCaseId);
      setTimeline((current) =>
        reducePilotTimeline(current, {
          type: 'load-case',
          caseId: activeCaseId,
          events,
        }),
      );
      for (const message of report.messages) {
        void notifyWorkflowMessageEvent(
          workflowIntegrations,
          buildWorkflowMessageEvent({
            direction: message.direction,
            messageId: message.id,
            conversationId: message.conversationId,
            caseId:
              getConversationMailStore().conversations.find(
                (item) => item.id === message.conversationId,
              )?.caseId ?? null,
            subject: message.subject,
            occurredAt: message.createdAt,
          }),
        );
      }
      return report;
    },
    [activeCaseId, defaultMailboxId, workflowIntegrations],
  );

  const sendSystemMail = useCallback(
    async (draft: SystemMailDraft) => {
      const message = await sessionRef.current!.sendSystemMail(draft);
      const caseId = draft.caseId ?? activeCaseId;
      setInbox((current) =>
        reducePilotInbox(current, { type: 'refresh-from-conversation' }),
      );
      setConversation((current) =>
        reducePilotConversation(current, {
          type: 'refresh-from-store',
          caseId,
        }),
      );
      const events = await loadTimelineForCaseFromConversation(caseId);
      setTimeline((current) =>
        reducePilotTimeline(current, {
          type: 'load-case',
          caseId,
          events,
        }),
      );
      void notifyWorkflowMessageEvent(
        workflowIntegrations,
        buildWorkflowMessageEvent({
          direction: 'outgoing',
          messageId: message.id,
          conversationId: message.conversationId,
          caseId,
          subject: message.subject,
          occurredAt: message.createdAt,
        }),
      );
      return message;
    },
    [activeCaseId, workflowIntegrations],
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
      conversation,
      selectConversation,
      mailSessionActive: true,
      syncMailboxTransport,
      sendSystemMail,
      refreshConversationFromStore,
    }),
    [
      activeCase,
      activeCaseId,
      assignInboxCase,
      cases,
      clearTimelineSelection,
      conversation,
      createCasePlaceholder,
      inbox,
      navigateWorkflowStep,
      refreshConversationFromStore,
      selectCase,
      selectConversation,
      selectInboxMessage,
      selectTimelineEvent,
      selectedInboxMessage,
      sendSystemMail,
      syncMailboxTransport,
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
