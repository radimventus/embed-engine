/**
 * EPIC-BX-08 — Collaboration Center view-model.
 */

import { loadProjectCollaboration } from './collaborationStorage';
import {
  COLLABORATION_TEAM,
  COMMENT_TARGETS,
  REVIEW_MODULES,
  WORKFLOW_STAGES,
  type CollaborationMember,
  type CollaborationPanelId,
  type ProjectCollaborationState,
  type ReviewDecision,
  type WorkflowStage,
} from './collaborationTypes';

export type CollaborationCenterModel = {
  readonly state: ProjectCollaborationState;
  readonly team: readonly CollaborationMember[];
  readonly panels: readonly {
    readonly id: CollaborationPanelId;
    readonly label: string;
    readonly summary: string;
  }[];
  readonly reviewSummary: {
    readonly needsReview: number;
    readonly approved: number;
    readonly rejected: number;
  };
  readonly openTasks: number;
  readonly openComments: number;
  readonly softLockCount: number;
};

export function buildCollaborationCenterModel(
  projectId: string,
): CollaborationCenterModel {
  const state = loadProjectCollaboration(projectId);
  const needsReview = state.reviews.filter(
    (item) => item.decision === 'needs-review',
  ).length;
  const approved = state.reviews.filter(
    (item) => item.decision === 'approved',
  ).length;
  const rejected = state.reviews.filter(
    (item) => item.decision === 'rejected',
  ).length;
  const openTasks = state.tasks.filter((item) => !item.done).length;
  const openComments = state.comments.filter((item) => !item.resolved).length;

  return {
    state,
    team: COLLABORATION_TEAM,
    panels: [
      {
        id: 'review',
        label: 'Review',
        summary: `${needsReview} Needs Review · ${approved} Approved`,
      },
      {
        id: 'comments',
        label: 'Comments',
        summary: `${openComments} otevřených`,
      },
      {
        id: 'tasks',
        label: 'Tasks',
        summary: `${openTasks} aktivních`,
      },
      {
        id: 'activity',
        label: 'Activity',
        summary: `${state.activity.length} událostí`,
      },
      {
        id: 'team',
        label: 'Team',
        summary: `${COLLABORATION_TEAM.length} členů`,
      },
    ],
    reviewSummary: { needsReview, approved, rejected },
    openTasks,
    openComments,
    softLockCount: state.softLocks.length,
  };
}

export function reviewDecisionLabel(decision: ReviewDecision): string {
  if (decision === 'needs-review') return 'Needs Review';
  if (decision === 'approved') return 'Approved';
  return 'Rejected';
}

export function workflowStageLabel(stage: WorkflowStage): string {
  return WORKFLOW_STAGES.find((item) => item.id === stage)?.label ?? stage;
}

export function groupActivityByDay(
  activity: ProjectCollaborationState['activity'],
): readonly {
  readonly dayLabel: string;
  readonly events: ProjectCollaborationState['activity'];
}[] {
  const groups = new Map<string, ProjectCollaborationState['activity'][number][]>();
  for (const event of activity) {
    const dayKey = event.at.slice(0, 10);
    const list = groups.get(dayKey) ?? [];
    list.push(event);
    groups.set(dayKey, list);
  }
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  return [...groups.entries()].map(([dayKey, events]) => ({
    dayLabel:
      dayKey === today
        ? 'Dnes'
        : dayKey === yesterday
          ? 'Včera'
          : new Date(dayKey).toLocaleDateString('cs-CZ'),
    events,
  }));
}

export { REVIEW_MODULES, COMMENT_TARGETS, WORKFLOW_STAGES };
