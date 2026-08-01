/**
 * EPIC-BX-08 — Collaboration Workspace types (UX readiness, no auth/RBAC).
 */

export type CollaborationPanelId =
  | 'review'
  | 'comments'
  | 'tasks'
  | 'activity'
  | 'team';

export type ReviewModuleId = 'experience' | 'knowledge' | 'media';

export type ReviewDecision = 'needs-review' | 'approved' | 'rejected';

export type WorkflowStage = 'draft' | 'in-review' | 'approved' | 'published';

export type CommentTargetId =
  | 'hero'
  | 'gallery'
  | 'faq'
  | 'knowledge'
  | 'room'
  | 'experience'
  | 'media';

export type CollaborationMember = {
  readonly id: string;
  readonly name: string;
  readonly roleLabel: string;
};

export type ModuleReview = {
  readonly moduleId: ReviewModuleId;
  readonly decision: ReviewDecision;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly note: string;
};

export type CollaborationComment = {
  readonly id: string;
  readonly targetId: CommentTargetId;
  readonly body: string;
  readonly author: string;
  readonly createdAt: string;
  readonly resolved: boolean;
};

export type CollaborationTask = {
  readonly id: string;
  readonly title: string;
  readonly assignee: string;
  readonly dueDate: string;
  readonly done: boolean;
  readonly createdAt: string;
};

export type ActivityEvent = {
  readonly id: string;
  readonly at: string;
  readonly actor: string;
  readonly summary: string;
};

export type SoftLock = {
  readonly areaId: string;
  readonly areaLabel: string;
  readonly editor: string;
  readonly startedAt: string;
};

export type AreaWorkflow = {
  readonly areaId: ReviewModuleId;
  readonly stage: WorkflowStage;
  readonly updatedAt: string;
};

export type ProjectCollaborationState = {
  readonly projectId: string;
  readonly reviews: readonly ModuleReview[];
  readonly comments: readonly CollaborationComment[];
  readonly tasks: readonly CollaborationTask[];
  readonly activity: readonly ActivityEvent[];
  readonly softLocks: readonly SoftLock[];
  readonly workflows: readonly AreaWorkflow[];
  readonly updatedAt: string;
};

export const COLLABORATION_STORAGE_KEY =
  'conis.builder.collaboration.v1' as const;

export const REVIEW_MODULES: readonly {
  readonly id: ReviewModuleId;
  readonly label: string;
}[] = [
  { id: 'experience', label: 'Experience' },
  { id: 'knowledge', label: 'Knowledge' },
  { id: 'media', label: 'Media' },
] as const;

export const COMMENT_TARGETS: readonly {
  readonly id: CommentTargetId;
  readonly label: string;
}[] = [
  { id: 'hero', label: 'Hero' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'faq', label: 'FAQ' },
  { id: 'knowledge', label: 'Knowledge' },
  { id: 'room', label: 'Room' },
  { id: 'experience', label: 'Experience' },
  { id: 'media', label: 'Media' },
] as const;

export const WORKFLOW_STAGES: readonly {
  readonly id: WorkflowStage;
  readonly label: string;
}[] = [
  { id: 'draft', label: 'Draft' },
  { id: 'in-review', label: 'In Review' },
  { id: 'approved', label: 'Approved' },
  { id: 'published', label: 'Published' },
] as const;

/** Seeded team — display only, not authentication. */
export const COLLABORATION_TEAM: readonly CollaborationMember[] = [
  { id: 'anna', name: 'Anna Nováková', roleLabel: 'Autor Experience' },
  { id: 'petr', name: 'Petr Svoboda', roleLabel: 'Reviewer' },
  { id: 'eva', name: 'Eva Horáková', roleLabel: 'Knowledge' },
  { id: 'you', name: 'Vy', roleLabel: 'Editor' },
] as const;

export function createDefaultCollaborationState(
  projectId: string,
): ProjectCollaborationState {
  const now = new Date().toISOString();
  return {
    projectId,
    reviews: REVIEW_MODULES.map((module) => ({
      moduleId: module.id,
      decision: 'needs-review',
      updatedAt: now,
      updatedBy: 'Vy',
      note: '',
    })),
    comments: [],
    tasks: [
      {
        id: `task-seed-${projectId}`,
        title: 'Doplnit FAQ',
        assignee: 'Eva Horáková',
        dueDate: '',
        done: false,
        createdAt: now,
      },
    ],
    activity: [
      {
        id: `act-seed-${projectId}`,
        at: now,
        actor: 'Systém',
        summary: 'Collaboration Workspace připraveno',
      },
    ],
    softLocks: [
      {
        areaId: 'media',
        areaLabel: 'Media · Hero',
        editor: 'Anna Nováková',
        startedAt: now,
      },
    ],
    workflows: REVIEW_MODULES.map((module) => ({
      areaId: module.id,
      stage: 'draft',
      updatedAt: now,
    })),
    updatedAt: now,
  };
}
