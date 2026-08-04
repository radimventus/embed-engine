/**
 * PT-16 — Office Task registry (in-memory, project-scoped).
 * Created by Business Automation — Office displays / completes only.
 */

import type { BusinessEvent } from '@embed-engine/business-automation';

import {
  OFFICE_TASK_KIND_LABELS,
  type OfficeTask,
  type OfficeTaskKind,
  type OfficeTaskStatus,
} from './officeTaskModel';

const tasks: OfficeTask[] = [];

function allocateTaskId(kind: OfficeTaskKind, stamp = Date.now()): string {
  const rand = Math.random().toString(36).slice(2, 7);
  return `task-${kind}-${stamp.toString(36)}-${rand}`;
}

export function resolveProjectIdFromEvent(event: BusinessEvent): string {
  return String(
    event.payload.caseId ??
      event.payload.projectId ??
      event.correlationId ??
      event.payload.orderId ??
      '',
  );
}

/**
 * Map commercial events → waiting Office Tasks.
 */
export function officeTaskKindsForEvent(input: {
  readonly eventKind: string;
  readonly actionId: string;
}): readonly OfficeTaskKind[] {
  if (input.actionId === 'CreateBuilderTask') {
    return ['waiting_builder'];
  }

  switch (input.eventKind) {
    case 'OfferAccepted':
      return ['waiting_review'];
    case 'OrderConfirmed':
      return ['waiting_send'];
    case 'ProformaGenerated':
      return ['waiting_payment'];
    case 'PaymentConfirmed':
      return ['waiting_builder'];
    case 'PilotReady':
      return ['waiting_builder'];
    case 'WorkflowMessageReceived':
      return ['waiting_review'];
    default:
      return [];
  }
}

export function createOfficeTasksForEvent(input: {
  readonly event: BusinessEvent;
  readonly actionId: string;
}): readonly OfficeTask[] {
  const projectId = resolveProjectIdFromEvent(input.event);
  if (projectId.length === 0) return [];

  const kinds = officeTaskKindsForEvent({
    eventKind: input.event.kind,
    actionId: input.actionId,
  });

  const created: OfficeTask[] = [];
  for (const kind of kinds) {
    const existingOpen = tasks.find(
      (task) =>
        task.projectId === projectId &&
        task.kind === kind &&
        task.status === 'open',
    );
    if (existingOpen !== undefined) {
      created.push(existingOpen);
      continue;
    }

    const task: OfficeTask = {
      id: allocateTaskId(kind),
      projectId,
      kind,
      label: OFFICE_TASK_KIND_LABELS[kind],
      status: 'open',
      sourceEventKind: input.event.kind,
      sourceEventId: input.event.id,
      sourceActionId: input.actionId,
      createdAt: input.event.occurredAt,
    };
    tasks.push(task);
    created.push(task);
  }
  return created;
}

export function listOfficeTasksForProject(
  projectId: string,
): readonly OfficeTask[] {
  return tasks
    .filter((task) => task.projectId === projectId)
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function listOpenOfficeTasksForProject(
  projectId: string,
): readonly OfficeTask[] {
  return listOfficeTasksForProject(projectId).filter(
    (task) => task.status === 'open',
  );
}

export function updateOfficeTaskStatus(
  taskId: string,
  status: OfficeTaskStatus,
): OfficeTask | null {
  const index = tasks.findIndex((task) => task.id === taskId);
  if (index < 0) return null;
  const current = tasks[index]!;
  const next = { ...current, status };
  tasks[index] = next;
  return next;
}

export function resetOfficeTaskRegistryForTests(): void {
  tasks.length = 0;
}
