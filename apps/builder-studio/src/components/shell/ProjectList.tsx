import type { ProjectRecord } from '../../model';

type ProjectListProps = {
  readonly projects: readonly ProjectRecord[];
  readonly activeProjectId: string | null;
  readonly onOpenProject: (projectId: string) => void;
};

function statusLabel(status: ProjectRecord['status']): string {
  switch (status) {
    case 'Published':
      return 'Published';
    case 'Archived':
      return 'Archived';
    case 'Built':
      return 'Built';
    case 'ReadyForBuild':
      return 'ReadyForBuild';
    case 'ReadyForPublish':
      return 'ReadyForPublish';
    default:
      return 'Draft';
  }
}

export function ProjectList({
  projects,
  activeProjectId,
  onOpenProject,
}: ProjectListProps) {
  return (
    <div>
      <div className="mb-3 text-xs uppercase tracking-[1px] text-[#7D8796]">
        Projekty
      </div>
      <ul className="flex flex-col gap-2.5">
        {projects.map((project) => {
          const isActive = project.projectId === activeProjectId;
          return (
            <li key={project.projectId}>
              <button
                type="button"
                onClick={() => onOpenProject(project.projectId)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition ${
                  isActive
                    ? 'bg-builder-navy text-white'
                    : 'text-builder-ink hover:bg-builder-hover'
                }`}
              >
                <span aria-hidden="true">⌂</span>
                <span>
                  <span className="block font-medium">{project.name}</span>
                  <small
                    className={`block text-xs ${
                      isActive ? 'opacity-70' : 'text-builder-muted'
                    }`}
                  >
                    {statusLabel(project.status)}
                  </small>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
