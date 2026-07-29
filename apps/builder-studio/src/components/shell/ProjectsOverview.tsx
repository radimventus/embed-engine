import { useState } from 'react';
import type {
  Project,
  WorkspaceEvent,
  WorkspacePackage,
  WorkspaceProjectSort,
} from '../../model';

type ProjectsOverviewProps = {
  readonly workspacePackage: WorkspacePackage | null;
  readonly projects: readonly Project[];
  readonly activeProjectId: string | null;
  readonly events: readonly WorkspaceEvent[];
  readonly indexCount: number;
  readonly message: string | null;
  readonly onCreateProject: () => void;
  readonly onOpenProject: (projectId: string) => void;
  readonly onDuplicateProject: (projectId: string) => void;
  readonly onArchiveProject: (projectId: string) => void;
};

function formatDate(iso: string | null): string {
  if (iso === null) return '—';
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return iso;
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
}

function filterAndSortProjects(
  projects: readonly Project[],
  query: string,
  sortBy: WorkspaceProjectSort,
): readonly Project[] {
  const normalized = query.trim().toLowerCase();
  const filtered =
    normalized.length === 0
      ? [...projects]
      : projects.filter((project) =>
          project.name.toLowerCase().includes(normalized),
        );

  filtered.sort((left, right) => {
    if (sortBy === 'name') return left.name.localeCompare(right.name);
    if (sortBy === 'status') return left.status.localeCompare(right.status);
    return right.updatedAt.localeCompare(left.updatedAt);
  });
  return filtered;
}

export function ProjectsOverview({
  workspacePackage,
  projects,
  activeProjectId,
  events,
  indexCount,
  message,
  onCreateProject,
  onOpenProject,
  onDuplicateProject,
  onArchiveProject,
}: ProjectsOverviewProps) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<WorkspaceProjectSort>('updatedAt');
  const visibleProjects = filterAndSortProjects(projects, query, sortBy);

  return (
    <div className="space-y-8" data-testid="projects-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Project Workspace
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {workspacePackage?.metadata.title ?? 'Projects'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            Organizacni vstupni vrstva Builder Studio — bez editace obsahu.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateProject}
          className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2.5 text-sm font-medium text-white"
        >
          + New Project
        </button>
      </div>

      {message !== null ? (
        <p className="rounded-[10px] border border-[#DDE5EF] px-4 py-3 text-sm text-builder-muted">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <label className="min-w-[220px] flex-1 text-[13px] text-builder-muted">
          <span className="sr-only">Search projects</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Hledat podle nazvu"
            className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-sm text-builder-ink"
            data-testid="projects-search"
          />
        </label>
        <label className="text-[13px] text-builder-muted">
          <span className="sr-only">Sort projects</span>
          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value as WorkspaceProjectSort)
            }
            className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2.5 text-sm text-builder-ink"
            data-testid="projects-sort"
          >
            <option value="updatedAt">Posledni zmena</option>
            <option value="name">Nazev</option>
            <option value="status">Stav</option>
          </select>
        </label>
        <span className="text-[13px] text-builder-muted">
          {visibleProjects.length}/{projects.length} · index {indexCount}
        </span>
      </div>

      <section
        aria-labelledby="projects-grid"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <h3 id="projects-grid" className="sr-only">
          Projects
        </h3>
        {visibleProjects.map((project) => {
          const isActive = project.id === activeProjectId;
          return (
            <article
              key={project.id}
              className={`overflow-hidden rounded-[16px] border bg-white ${
                isActive ? 'border-builder-navy shadow-sm' : 'border-[#DDE5EF]'
              }`}
              data-testid={`project-card-${project.id}`}
            >
              <div className="aspect-[16/9] w-full bg-[#EEF3FA]">
                <img
                  src={project.thumbnail}
                  alt={project.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-semibold text-builder-ink">
                      {project.name}
                    </h4>
                    <p className="mt-1 text-[13px] text-builder-muted">
                      {project.description}
                    </p>
                  </div>
                  <span className="rounded-full border border-[#DDE5EF] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-builder-muted">
                    {project.status}
                  </span>
                </div>
                <div className="space-y-1 text-[13px] text-builder-muted">
                  <p>Posledni zmena {formatDate(project.updatedAt)}</p>
                  <p>Posledni otevreni {formatDate(project.lastOpenedAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenProject(project.id)}
                    disabled={project.status === 'ARCHIVED'}
                    className="rounded-[10px] border border-builder-navy px-3 py-2 text-sm font-medium text-builder-navy disabled:opacity-40"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicateProject(project.id)}
                    className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm font-medium"
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => onArchiveProject(project.id)}
                    disabled={project.status === 'ARCHIVED'}
                    className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm font-medium disabled:opacity-40"
                  >
                    Archive
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section aria-labelledby="projects-events">
        <h3
          id="projects-events"
          className="text-base font-semibold text-builder-ink"
        >
          Workspace Events
        </h3>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Zatim zadne udalosti.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {events.slice(0, 10).map((event) => (
              <li
                key={event.eventId}
                className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <span className="font-medium text-builder-ink">{event.type}</span>
                <span className="mt-0.5 block text-builder-muted">
                  {event.message}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
