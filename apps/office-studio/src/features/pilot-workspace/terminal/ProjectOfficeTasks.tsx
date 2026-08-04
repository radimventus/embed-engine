/**
 * PT-16 — Project Office Tasks viewer (Automation-created; no create in UI).
 */

import { useMemo, useState } from 'react';

import {
  listOfficeTasksForProject,
  updateOfficeTaskStatus,
} from '../../../office/officeTaskRegistry';

type ProjectOfficeTasksProps = {
  readonly projectId: string;
};

export function ProjectOfficeTasks({ projectId }: ProjectOfficeTasksProps) {
  const [revision, setRevision] = useState(0);
  const tasks = useMemo(() => {
    void revision;
    return listOfficeTasksForProject(projectId);
  }, [projectId, revision]);

  return (
    <section
      className="office-pilot-docs"
      data-testid="pilot-project-tasks"
      data-project-id={projectId}
    >
      <h4 className="office-pilot-inbox__title">Office Tasks</h4>
      <p className="office-pilot-detail__meta">
        Úkoly z Business Automation · stav projektu
      </p>

      {tasks.length === 0 ? (
        <p
          className="office-pilot-ws__panel-body"
          data-testid="pilot-project-tasks-empty"
        >
          Zatím žádné úkoly.
        </p>
      ) : (
        <ul
          className="office-pilot-docs__list"
          data-testid="pilot-project-tasks-list"
        >
          {tasks.map((task) => (
            <li key={task.id}>
              <div
                className="office-pilot-docs__item"
                data-testid={`pilot-project-task-${task.kind}`}
                data-status={task.status}
              >
                <strong>{task.label}</strong>
                <span>
                  {task.status} · {task.sourceEventKind}
                </span>
              </div>
              {task.status === 'open' ? (
                <button
                  type="button"
                  className="platform-btn platform-btn--secondary"
                  data-testid={`pilot-project-task-done-${task.kind}`}
                  onClick={() => {
                    updateOfficeTaskStatus(task.id, 'done');
                    setRevision((value) => value + 1);
                  }}
                >
                  Hotovo
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
