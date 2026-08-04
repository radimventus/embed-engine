/**
 * PT-13 — Business Automation Foundation public API.
 * Shared commercial orchestration — not Decision Runtime · not UI.
 */

export type {
  BusinessEvent,
  BusinessEventKind,
  BusinessEventPayload,
  BusinessEventSource,
} from './domain/businessEvents';
export {
  BUSINESS_EVENT_KINDS,
  buildBusinessEvent,
  createBusinessEventId,
  isBusinessEventKind,
} from './domain/businessEvents';

export type {
  AutomationActionId,
  AutomationActionPlanItem,
  AutomationActionStatus,
} from './domain/automationActions';
export {
  AUTOMATION_ACTION_IDS,
  DEFAULT_EVENT_ACTION_BINDINGS,
  isAutomationActionId,
  planActionsForEvent,
} from './domain/automationActions';

export type {
  AutomationActionContext,
  AutomationActionHandler,
  AutomationActionRegistry,
} from './registry/actionRegistry';
export {
  createActionRegistry,
  createStubActionHandler,
} from './registry/actionRegistry';

export type {
  AutomationIntegrationPorts,
  ConversationAutomationPort,
  DocumentAutomationPort,
  MailSessionAutomationPort,
  WorkflowAutomationPort,
} from './ports/integrationPorts';

export type {
  AutomationDispatchRecord,
  AutomationRuntime,
  AutomationRuntimeOptions,
  AutomationRuntimeState,
} from './runtime/automationRuntime';
export { createAutomationRuntime } from './runtime/automationRuntime';

export type {
  OfferAutomationIntegrationSurface,
  OfferAutomationTimelineLike,
} from './adapters/offerBridge';
export {
  createOfferAutomationIntegrations,
  mapOfferTimelineToBusinessEvents,
} from './adapters/offerBridge';

export type {
  OfficeWorkflowAutomationSurface,
  OfficeWorkflowMessageEventLike,
} from './adapters/officeWorkflowBridge';
export {
  createOfficeWorkflowAutomationBridge,
  mapWorkflowMessageToBusinessEvent,
} from './adapters/officeWorkflowBridge';
