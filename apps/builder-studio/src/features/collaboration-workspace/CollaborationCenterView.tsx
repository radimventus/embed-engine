import { useMemo, useState, type FormEvent } from 'react';

import type { HousePackageNavId } from '../house-package/HousePackageSidebar';
import {
  buildCollaborationCenterModel,
  groupActivityByDay,
  reviewDecisionLabel,
  workflowStageLabel,
} from './collaborationModel';
import {
  addComment,
  addTask,
  claimSoftLock,
  releaseSoftLock,
  resolveComment,
  setAreaWorkflow,
  setModuleReview,
  toggleTaskDone,
} from './collaborationStorage';
import {
  COLLABORATION_TEAM,
  COMMENT_TARGETS,
  REVIEW_MODULES,
  WORKFLOW_STAGES,
  type CollaborationPanelId,
  type CommentTargetId,
  type ReviewDecision,
  type ReviewModuleId,
  type WorkflowStage,
} from './collaborationTypes';

type CollaborationCenterViewProps = {
  readonly projectId: string;
  readonly projectName: string;
  readonly onNavigate: (nav: HousePackageNavId) => void;
};

/**
 * EPIC-BX-08 — Collaboration Workspace (team UX readiness, no auth/backend).
 */
export function CollaborationCenterView({
  projectId,
  projectName,
  onNavigate,
}: CollaborationCenterViewProps) {
  const [tick, setTick] = useState(0);
  const [panel, setPanel] = useState<CollaborationPanelId>('review');
  const refresh = () => setTick((value) => value + 1);

  const model = useMemo(
    () => buildCollaborationCenterModel(projectId),
    [projectId, tick],
  );

  return (
    <div className="space-y-5" data-testid="collaboration-center">
      <header className="rounded-[16px] border border-[#E3E3E3] bg-white p-6 shadow-sm">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
          Collaboration
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-builder-ink">
          Collaboration Center
        </h1>
        <p className="mt-1 text-sm text-builder-muted">
          {projectName} — pracovní prostředí pro tým (bez loginu · bez
          backendu).
        </p>
        <div className="mt-5 grid gap-3 tablet:grid-cols-5">
          {model.panels.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPanel(item.id)}
              className={`rounded-[12px] border px-3 py-3 text-left ${
                panel === item.id
                  ? 'border-builder-blue bg-builder-creamLight text-builder-blue'
                  : 'border-[#E3E3E3] bg-builder-canvas text-builder-ink'
              }`}
            >
              <p className="text-sm font-semibold">{item.label}</p>
              <p
                className={`mt-1 text-[11px] ${
                  panel === item.id ? 'text-white/80' : 'text-builder-muted'
                }`}
              >
                {item.summary}
              </p>
            </button>
          ))}
        </div>
      </header>

      {model.state.softLocks.length > 0 && (
        <SoftLockBanner
          locks={model.state.softLocks}
          onRelease={(areaId) => {
            releaseSoftLock(projectId, areaId);
            refresh();
          }}
        />
      )}

      <WorkflowStrip
        workflows={model.state.workflows}
        onChange={(areaId, stage) => {
          setAreaWorkflow(projectId, areaId, stage);
          refresh();
        }}
      />

      {panel === 'review' && (
        <ReviewPanel
          reviews={model.state.reviews}
          onDecide={(moduleId, decision, note) => {
            setModuleReview(projectId, moduleId, decision, note);
            refresh();
          }}
          onOpenModule={(moduleId) => {
            if (moduleId === 'experience') onNavigate('experience');
            else if (moduleId === 'knowledge') onNavigate('knowledge');
            else onNavigate('media-studio');
          }}
        />
      )}
      {panel === 'comments' && (
        <CommentsPanel
          comments={model.state.comments}
          onAdd={(targetId, body) => {
            addComment(projectId, targetId, body);
            refresh();
          }}
          onResolve={(id) => {
            resolveComment(projectId, id);
            refresh();
          }}
        />
      )}
      {panel === 'tasks' && (
        <TasksPanel
          tasks={model.state.tasks}
          onAdd={(title, assignee, dueDate) => {
            addTask(projectId, { title, assignee, dueDate });
            refresh();
          }}
          onToggle={(id) => {
            toggleTaskDone(projectId, id);
            refresh();
          }}
        />
      )}
      {panel === 'activity' && (
        <ActivityPanel activity={model.state.activity} />
      )}
      {panel === 'team' && (
        <TeamPanel
          team={model.team}
          softLocks={model.state.softLocks}
          onClaim={(areaId, label, editor) => {
            claimSoftLock(projectId, areaId, label, editor);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function SoftLockBanner({
  locks,
  onRelease,
}: {
  readonly locks: ReturnType<
    typeof buildCollaborationCenterModel
  >['state']['softLocks'];
  readonly onRelease: (areaId: string) => void;
}) {
  return (
    <section className="rounded-[16px] border border-amber-300/70 bg-amber-50 px-5 py-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-amber-800">
        Soft Lock
      </p>
      <ul className="mt-2 space-y-2">
        {locks.map((lock) => (
          <li
            key={`${lock.areaId}:${lock.editor}`}
            className="flex flex-wrap items-center justify-between gap-2 text-sm text-amber-950"
          >
            <span>
              <strong>Právě upravuje…</strong> {lock.editor} — {lock.areaLabel}
            </span>
            <button
              type="button"
              className="rounded-[8px] border border-amber-400 bg-white px-2.5 py-1 text-[12px] font-medium"
              onClick={() => onRelease(lock.areaId)}
            >
              Uvolnit (UX)
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-amber-800/80">
        Bez tvrdého locku — pouze upozornění pro tým.
      </p>
    </section>
  );
}

function WorkflowStrip({
  workflows,
  onChange,
}: {
  readonly workflows: ReturnType<
    typeof buildCollaborationCenterModel
  >['state']['workflows'];
  readonly onChange: (areaId: ReviewModuleId, stage: WorkflowStage) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Workflow
      </p>
      <p className="mt-1 text-sm text-builder-muted">
        Draft → In Review → Approved → Published
      </p>
      <ul className="mt-4 space-y-4">
        {workflows.map((item) => {
          const label =
            REVIEW_MODULES.find((module) => module.id === item.areaId)
              ?.label ?? item.areaId;
          return (
            <li key={item.areaId}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-builder-ink">{label}</p>
                <p className="text-[12px] text-builder-muted">
                  {workflowStageLabel(item.stage)}
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {WORKFLOW_STAGES.map((stage) => {
                  const active = stage.id === item.stage;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => onChange(item.areaId, stage.id)}
                      className={`rounded-[10px] border px-2 py-2 text-center text-[12px] font-medium ${
                        active
                          ? 'border-builder-blue bg-builder-creamLight text-builder-blue'
                          : 'border-[#E3E3E3] bg-builder-canvas text-builder-ink'
                      }`}
                    >
                      {stage.label}
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ReviewPanel({
  reviews,
  onDecide,
  onOpenModule,
}: {
  readonly reviews: ReturnType<
    typeof buildCollaborationCenterModel
  >['state']['reviews'];
  readonly onDecide: (
    moduleId: ReviewModuleId,
    decision: ReviewDecision,
    note: string,
  ) => void;
  readonly onOpenModule: (moduleId: ReviewModuleId) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Review
      </p>
      <ul className="mt-4 space-y-3">
        {reviews.map((review) => {
          const label =
            REVIEW_MODULES.find((module) => module.id === review.moduleId)
              ?.label ?? review.moduleId;
          return (
            <li
              key={review.moduleId}
              className="rounded-[12px] border border-[#E3E3E3] bg-builder-canvas p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-builder-ink">
                    {label}
                  </p>
                  <p className="mt-1 text-[12px] text-builder-muted">
                    {reviewDecisionLabel(review.decision)} · {review.updatedBy}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-[12px] font-medium text-builder-navy"
                  onClick={() => onOpenModule(review.moduleId)}
                >
                  Otevřít modul
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(
                  [
                    'needs-review',
                    'approved',
                    'rejected',
                  ] as const satisfies readonly ReviewDecision[]
                ).map((decision) => (
                  <button
                    key={decision}
                    type="button"
                    onClick={() => onDecide(review.moduleId, decision, '')}
                    className={`rounded-[8px] border px-3 py-1.5 text-[12px] font-medium ${
                      review.decision === decision
                        ? 'border-builder-blue bg-builder-creamLight text-builder-blue'
                        : 'border-[#DDE5EF] bg-white text-builder-ink'
                    }`}
                  >
                    {reviewDecisionLabel(decision)}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CommentsPanel({
  comments,
  onAdd,
  onResolve,
}: {
  readonly comments: ReturnType<
    typeof buildCollaborationCenterModel
  >['state']['comments'];
  readonly onAdd: (targetId: CommentTargetId, body: string) => void;
  readonly onResolve: (id: string) => void;
}) {
  const [targetId, setTargetId] = useState<CommentTargetId>('hero');
  const [body, setBody] = useState('');

  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Comments
      </p>
      <p className="mt-1 text-sm text-builder-muted">
        Komentář je vždy navázán na konkrétní objekt — ne globální chat.
      </p>
      <form
        className="mt-4 grid gap-3 tablet:grid-cols-[180px_1fr_auto]"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          if (body.trim().length === 0) return;
          onAdd(targetId, body);
          setBody('');
        }}
      >
        <select
          className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
          value={targetId}
          onChange={(event) =>
            setTargetId(event.target.value as CommentTargetId)
          }
        >
          {COMMENT_TARGETS.map((target) => (
            <option key={target.id} value={target.id}>
              {target.label}
            </option>
          ))}
        </select>
        <input
          className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
          placeholder="Komentář k objektu…"
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <button
          type="submit"
          className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2 text-sm font-medium text-white"
        >
          Přidat
        </button>
      </form>
      <ul className="mt-4 space-y-2">
        {comments.length === 0 && (
          <li className="text-sm text-builder-muted">Zatím žádné komentáře.</li>
        )}
        {comments.map((comment) => {
          const target =
            COMMENT_TARGETS.find((item) => item.id === comment.targetId)
              ?.label ?? comment.targetId;
          return (
            <li
              key={comment.id}
              className={`rounded-[12px] border px-4 py-3 ${
                comment.resolved
                  ? 'border-[#E3E3E3] bg-builder-canvas opacity-70'
                  : 'border-[#E3E3E3] bg-white'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-medium uppercase text-builder-muted">
                    {target}
                  </p>
                  <p className="mt-1 text-sm text-builder-ink">{comment.body}</p>
                  <p className="mt-1 text-[11px] text-builder-muted">
                    {comment.author} ·{' '}
                    {new Date(comment.createdAt).toLocaleString('cs-CZ')}
                  </p>
                </div>
                {!comment.resolved && (
                  <button
                    type="button"
                    className="text-[12px] font-medium text-builder-navy"
                    onClick={() => onResolve(comment.id)}
                  >
                    Vyřešit
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function TasksPanel({
  tasks,
  onAdd,
  onToggle,
}: {
  readonly tasks: ReturnType<
    typeof buildCollaborationCenterModel
  >['state']['tasks'];
  readonly onAdd: (title: string, assignee: string, dueDate: string) => void;
  readonly onToggle: (id: string) => void;
}) {
  const [title, setTitle] = useState('Doplnit FAQ');
  const [assignee, setAssignee] = useState(COLLABORATION_TEAM[1]?.name ?? 'Vy');
  const [dueDate, setDueDate] = useState('');

  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Tasks
      </p>
      <form
        className="mt-4 grid gap-3 tablet:grid-cols-4"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          if (title.trim().length === 0) return;
          onAdd(title, assignee, dueDate);
          setTitle('');
        }}
      >
        <input
          className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm tablet:col-span-2"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Úkol…"
        />
        <select
          className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
          value={assignee}
          onChange={(event) => setAssignee(event.target.value)}
        >
          {COLLABORATION_TEAM.map((member) => (
            <option key={member.id} value={member.name}>
              {member.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
        <button
          type="submit"
          className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2 text-sm font-medium text-white tablet:col-span-4"
        >
          Vytvořit úkol
        </button>
      </form>
      <ul className="mt-4 space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#E3E3E3] bg-builder-canvas px-4 py-3"
          >
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => onToggle(task.id)}
                className="mt-1"
              />
              <span>
                <span
                  className={`block font-medium ${
                    task.done
                      ? 'text-builder-muted line-through'
                      : 'text-builder-ink'
                  }`}
                >
                  {task.title}
                </span>
                <span className="text-[11px] text-builder-muted">
                  Přiřazeno: {task.assignee}
                  {task.dueDate ? ` · Termín: ${task.dueDate}` : ''}
                </span>
              </span>
            </label>
            <span className="text-[11px] font-medium text-builder-muted">
              {task.done ? 'Hotovo' : 'Otevřeno'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ActivityPanel({
  activity,
}: {
  readonly activity: ReturnType<
    typeof buildCollaborationCenterModel
  >['state']['activity'];
}) {
  const groups = groupActivityByDay(activity);
  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Activity Timeline
      </p>
      <div className="mt-4 space-y-5">
        {groups.map((group) => (
          <div key={group.dayLabel}>
            <p className="text-sm font-semibold text-builder-ink">
              {group.dayLabel}
            </p>
            <ul className="mt-2 space-y-2 border-l border-[#DDE5EF] pl-4">
              {group.events.map((event) => (
                <li key={event.id} className="relative text-sm">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-builder-blue" />
                  <p className="font-medium text-builder-ink">{event.summary}</p>
                  <p className="text-[11px] text-builder-muted">
                    {event.actor} ·{' '}
                    {new Date(event.at).toLocaleTimeString('cs-CZ', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function TeamPanel({
  team,
  softLocks,
  onClaim,
}: {
  readonly team: ReturnType<typeof buildCollaborationCenterModel>['team'];
  readonly softLocks: ReturnType<
    typeof buildCollaborationCenterModel
  >['state']['softLocks'];
  readonly onClaim: (areaId: string, label: string, editor: string) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Team
      </p>
      <p className="mt-1 text-sm text-builder-muted">
        Zobrazení členů pro spolupráci — bez autentizace a RBAC.
      </p>
      <ul className="mt-4 grid gap-3 tablet:grid-cols-2">
        {team.map((member) => {
          const lock = softLocks.find((item) => item.editor === member.name);
          return (
            <li
              key={member.id}
              className="rounded-[12px] border border-[#E3E3E3] bg-builder-canvas p-4"
            >
              <p className="text-sm font-semibold text-builder-ink">
                {member.name}
              </p>
              <p className="mt-1 text-[12px] text-builder-muted">
                {member.roleLabel}
              </p>
              {lock !== undefined ? (
                <p className="mt-2 text-[12px] text-amber-800">
                  Právě upravuje… {lock.areaLabel}
                </p>
              ) : (
                <button
                  type="button"
                  className="mt-3 text-[12px] font-medium text-builder-navy"
                  onClick={() =>
                    onClaim('experience', 'Experience', member.name)
                  }
                >
                  Simulovat úpravu Experience
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
