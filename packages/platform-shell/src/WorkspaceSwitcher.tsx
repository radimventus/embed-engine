import type { PlatformWorkspaceState } from './platformTypes';
import { PlatformDropdown } from './PlatformDropdown';

type WorkspaceSwitcherProps = {
  readonly workspace: PlatformWorkspaceState | null;
};

/**
 * VR-FIX-03 / PR-006 — Project context in header (no switching — sidebar owns it).
 */
export function WorkspaceSwitcher({ workspace }: WorkspaceSwitcherProps) {
  if (workspace === null) {
    return (
      <span
        className="platform-menu-button"
        style={{ cursor: 'default', color: '#94A3B8' }}
      >
        Projekt
      </span>
    );
  }

  const canSwitch =
    typeof workspace.onSelectProject === 'function' &&
    workspace.projects.length > 0;

  if (!canSwitch) {
    return (
      <span
        className="platform-menu-button"
        style={{ cursor: 'default' }}
        aria-label="Aktivní projekt"
      >
        <span style={{ color: '#94A3B8', fontWeight: 500 }}>Projekt</span>
        <span aria-hidden> · </span>
        <span>{workspace.projectLabel}</span>
      </span>
    );
  }

  return (
    <PlatformDropdown
      ariaLabel="Project Switcher"
      label={
        <span>
          <span style={{ color: '#94A3B8', fontWeight: 500 }}>Projekt</span>
          <span aria-hidden> · </span>
          <span>{workspace.projectLabel}</span>
        </span>
      }
    >
      <span className="platform-menu-item platform-menu-item--disabled">
        {workspace.companyLabel}
      </span>
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
