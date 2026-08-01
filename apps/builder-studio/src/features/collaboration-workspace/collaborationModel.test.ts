import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildCollaborationCenterModel } from './collaborationModel';
import {
  addComment,
  addTask,
  claimSoftLock,
  loadProjectCollaboration,
  setAreaWorkflow,
  setModuleReview,
  toggleTaskDone,
} from './collaborationStorage';

describe('collaborationWorkspace (EPIC-BX-08)', () => {
  it('builds Collaboration Center panels for team readiness', () => {
    const projectId = `collab-${Date.now()}`;
    const model = buildCollaborationCenterModel(projectId);
    assert.ok(model.panels.some((item) => item.id === 'review'));
    assert.ok(model.panels.some((item) => item.id === 'comments'));
    assert.ok(model.panels.some((item) => item.id === 'tasks'));
    assert.ok(model.panels.some((item) => item.id === 'activity'));
    assert.ok(model.panels.some((item) => item.id === 'team'));
    assert.equal(model.team.length >= 3, true);
  });

  it('binds comments to a concrete object target', () => {
    const projectId = `comments-${Date.now()}`;
    addComment(projectId, 'faq', 'Doplňte odpověď na cenu', 'Petr Svoboda');
    const state = loadProjectCollaboration(projectId);
    assert.equal(state.comments[0]?.targetId, 'faq');
    assert.match(state.activity[0]?.summary ?? '', /faq/i);
  });

  it('tracks review decisions and workflow stages', () => {
    const projectId = `review-${Date.now()}`;
    setModuleReview(projectId, 'experience', 'approved', '', 'Petr Svoboda');
    setAreaWorkflow(projectId, 'experience', 'approved', 'Petr Svoboda');
    const state = loadProjectCollaboration(projectId);
    assert.equal(
      state.reviews.find((item) => item.moduleId === 'experience')?.decision,
      'approved',
    );
    assert.equal(
      state.workflows.find((item) => item.areaId === 'experience')?.stage,
      'approved',
    );
  });

  it('supports tasks and soft lock UX without hard locking', () => {
    const projectId = `tasks-${Date.now()}`;
    addTask(
      projectId,
      { title: 'Doplnit FAQ', assignee: 'Eva Horáková', dueDate: '2026-08-10' },
      'Vy',
    );
    const before = loadProjectCollaboration(projectId);
    const taskId = before.tasks[0]?.id;
    assert.ok(taskId);
    toggleTaskDone(projectId, taskId!);
    claimSoftLock(projectId, 'knowledge', 'Knowledge · FAQ', 'Eva Horáková');
    const after = loadProjectCollaboration(projectId);
    assert.equal(after.tasks.find((item) => item.id === taskId)?.done, true);
    assert.ok(
      after.softLocks.some(
        (item) =>
          item.areaId === 'knowledge' && item.editor === 'Eva Horáková',
      ),
    );
  });
});
