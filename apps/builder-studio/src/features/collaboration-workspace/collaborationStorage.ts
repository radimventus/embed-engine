/**
 * EPIC-BX-08 — Collaboration persistence (local UX store, no backend).
 */

import {
  COLLABORATION_STORAGE_KEY,
  createDefaultCollaborationState,
  type ActivityEvent,
  type AreaWorkflow,
  type CollaborationComment,
  type CollaborationTask,
  type CommentTargetId,
  type ModuleReview,
  type ProjectCollaborationState,
  type ReviewDecision,
  type ReviewModuleId,
  type SoftLock,
  type WorkflowStage,
} from './collaborationTypes';

export type CollaborationStore = {
  readonly byProjectId: Readonly<Record<string, ProjectCollaborationState>>;
};

let memoryStore: CollaborationStore = { byProjectId: {} };

function canUseLocalStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function emptyStore(): CollaborationStore {
  return { byProjectId: {} };
}

export function loadCollaborationStore(): CollaborationStore {
  if (!canUseLocalStorage()) {
    return memoryStore;
  }
  try {
    const raw = localStorage.getItem(COLLABORATION_STORAGE_KEY);
    if (raw === null || raw.length === 0) {
      return emptyStore();
    }
    const parsed = JSON.parse(raw) as CollaborationStore;
    if (parsed?.byProjectId == null) {
      return emptyStore();
    }
    return parsed;
  } catch {
    return emptyStore();
  }
}

export function saveCollaborationStore(store: CollaborationStore): void {
  memoryStore = store;
  if (!canUseLocalStorage()) {
    return;
  }
  localStorage.setItem(COLLABORATION_STORAGE_KEY, JSON.stringify(store));
}

export function loadProjectCollaboration(
  projectId: string,
): ProjectCollaborationState {
  const store = loadCollaborationStore();
  return store.byProjectId[projectId] ?? createDefaultCollaborationState(projectId);
}

function persistProject(state: ProjectCollaborationState): ProjectCollaborationState {
  const next = { ...state, updatedAt: new Date().toISOString() };
  const store = loadCollaborationStore();
  saveCollaborationStore({
    byProjectId: {
      ...store.byProjectId,
      [state.projectId]: next,
    },
  });
  return next;
}

function pushActivity(
  state: ProjectCollaborationState,
  actor: string,
  summary: string,
): ProjectCollaborationState {
  const event: ActivityEvent = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    actor,
    summary,
  };
  return {
    ...state,
    activity: [event, ...state.activity].slice(0, 100),
  };
}

export function setModuleReview(
  projectId: string,
  moduleId: ReviewModuleId,
  decision: ReviewDecision,
  note: string,
  actor = 'Vy',
): ProjectCollaborationState {
  const state = loadProjectCollaboration(projectId);
  const reviews: ModuleReview[] = state.reviews.map((item) =>
    item.moduleId === moduleId
      ? {
          ...item,
          decision,
          note,
          updatedAt: new Date().toISOString(),
          updatedBy: actor,
        }
      : item,
  );
  const label =
    decision === 'needs-review'
      ? 'Needs Review'
      : decision === 'approved'
        ? 'Approved'
        : 'Rejected';
  return persistProject(
    pushActivity(
      { ...state, reviews },
      actor,
      `${label}: ${moduleId}`,
    ),
  );
}

export function addComment(
  projectId: string,
  targetId: CommentTargetId,
  body: string,
  author = 'Vy',
): ProjectCollaborationState {
  const state = loadProjectCollaboration(projectId);
  const comment: CollaborationComment = {
    id: `cmt-${Date.now()}`,
    targetId,
    body: body.trim(),
    author,
    createdAt: new Date().toISOString(),
    resolved: false,
  };
  return persistProject(
    pushActivity(
      { ...state, comments: [comment, ...state.comments] },
      author,
      `Komentář na ${targetId}`,
    ),
  );
}

export function resolveComment(
  projectId: string,
  commentId: string,
  actor = 'Vy',
): ProjectCollaborationState {
  const state = loadProjectCollaboration(projectId);
  return persistProject(
    pushActivity(
      {
        ...state,
        comments: state.comments.map((item) =>
          item.id === commentId ? { ...item, resolved: true } : item,
        ),
      },
      actor,
      'Komentář vyřešen',
    ),
  );
}

export function addTask(
  projectId: string,
  input: {
    readonly title: string;
    readonly assignee: string;
    readonly dueDate: string;
  },
  actor = 'Vy',
): ProjectCollaborationState {
  const state = loadProjectCollaboration(projectId);
  const task: CollaborationTask = {
    id: `task-${Date.now()}`,
    title: input.title.trim(),
    assignee: input.assignee.trim() || 'Vy',
    dueDate: input.dueDate,
    done: false,
    createdAt: new Date().toISOString(),
  };
  return persistProject(
    pushActivity(
      { ...state, tasks: [task, ...state.tasks] },
      actor,
      `Úkol: ${task.title}`,
    ),
  );
}

export function toggleTaskDone(
  projectId: string,
  taskId: string,
  actor = 'Vy',
): ProjectCollaborationState {
  const state = loadProjectCollaboration(projectId);
  const task = state.tasks.find((item) => item.id === taskId);
  const nextDone = !(task?.done ?? false);
  return persistProject(
    pushActivity(
      {
        ...state,
        tasks: state.tasks.map((item) =>
          item.id === taskId ? { ...item, done: nextDone } : item,
        ),
      },
      actor,
      nextDone ? `Hotovo: ${task?.title ?? 'úkol'}` : `Znovu otevřeno: ${task?.title ?? 'úkol'}`,
    ),
  );
}

export function setAreaWorkflow(
  projectId: string,
  areaId: ReviewModuleId,
  stage: WorkflowStage,
  actor = 'Vy',
): ProjectCollaborationState {
  const state = loadProjectCollaboration(projectId);
  const workflows: AreaWorkflow[] = state.workflows.map((item) =>
    item.areaId === areaId
      ? { ...item, stage, updatedAt: new Date().toISOString() }
      : item,
  );
  return persistProject(
    pushActivity(
      { ...state, workflows },
      actor,
      `Workflow ${areaId} → ${stage}`,
    ),
  );
}

export function claimSoftLock(
  projectId: string,
  areaId: string,
  areaLabel: string,
  editor = 'Vy',
): ProjectCollaborationState {
  const state = loadProjectCollaboration(projectId);
  const lock: SoftLock = {
    areaId,
    areaLabel,
    editor,
    startedAt: new Date().toISOString(),
  };
  const softLocks = [
    lock,
    ...state.softLocks.filter((item) => item.areaId !== areaId),
  ];
  return persistProject(
    pushActivity(
      { ...state, softLocks },
      editor,
      `Právě upravuje: ${areaLabel}`,
    ),
  );
}

export function releaseSoftLock(
  projectId: string,
  areaId: string,
  actor = 'Vy',
): ProjectCollaborationState {
  const state = loadProjectCollaboration(projectId);
  const lock = state.softLocks.find((item) => item.areaId === areaId);
  return persistProject(
    pushActivity(
      {
        ...state,
        softLocks: state.softLocks.filter((item) => item.areaId !== areaId),
      },
      actor,
      lock !== undefined
        ? `Uvolněno: ${lock.areaLabel}`
        : 'Soft lock uvolněn',
    ),
  );
}
