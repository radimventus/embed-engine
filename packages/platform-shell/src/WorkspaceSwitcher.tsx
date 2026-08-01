import type { PlatformWorkspaceState } from './platformTypes';
import { PlatformDropdown } from './PlatformDropdown';

type WorkspaceSwitcherProps = {
  readonly workspace: PlatformWorkspaceState | null;
};

export function WorkspaceSwitcher({ workspace }: WorkspaceSwitcherProps) {
  if (workspace === null) {
    return (
      <span className="platform-menu-button" style={{ cursor: 'default' }}>
        Workspace
      </span>
    );
  }

  return (
    <PlatformDropdown
      ariaLabel="Workspace Switcher"
      label={
        <span>
          <span style={{ color: 'var(--platform-muted)', fontWeight: 500 }}>
            {workspace.companyLabel}
          </span>
          <span aria-hidden> · </span>
          <span>{workspace.projectLabel}</span>
        </span>
      }
    >
      {workspace.projects.map((project) => (
        <button
          key={project.id}
          type="button"
          role="menuitem"
          className="platform-menu-item"
          onClick={() => workspace.onSelectProject?.(project.id)}
        >
          <span style={{ display: 'block', fontWeight: 600 }}>
            {project.label}
          </span>
          <span
            style={{
              display: 'block',
              marginTop: 2,
              fontSize: 11,
              color: 'var(--platform-muted)',
            }}
          >
            {project.companyLabel}
          </span>
        </button>
      ))}
    </PlatformDropdown>
  );
}
