/**
 * OF-13 / OF-14 / VR-04 — Workspace Studio Navigation chrome.
 * Role-filtered: Client | Manager | Sales | Builder | Office
 * Driven only by Shared Workspace Context (platform session cookie).
 */

import {
  WORKSPACE_STUDIO_LABELS,
  workspaceStudiosForRoles,
  type WorkspaceStudioSurface,
} from '../domain/workspaceStudioNavigation';
import { getSharedWorkspaceContext } from '../session/authService';
import { loadPlatformSession } from '../session/sessionStore';
import { switchOperatorPartnerStudio } from '../pilot/operatorPartnerEnvironment';

type WorkspaceStudioNavigationProps = {
  readonly activeSurface: WorkspaceStudioSurface;
  /**
   * VR-04 — when set, Workspace Host owns the switch (in-shell view change).
   * Session context is still updated via switchOperatorPartnerStudio.
   */
  readonly onSelectSurface?: (surface: WorkspaceStudioSurface) => void;
};

/**
 * Unified Workspace switcher — preserves partner context; Office is last (in-shell).
 */
export function WorkspaceStudioNavigation({
  activeSurface,
  onSelectSurface,
}: WorkspaceStudioNavigationProps) {
  if (getSharedWorkspaceContext() === null) return null;

  const session = loadPlatformSession();
  const roles = session?.user.roles ?? [];
  const surfaces = workspaceStudiosForRoles(roles);

  return (
    <div
      className="platform-access__operator-pe-bar"
      data-testid="workspace-studio-navigation"
      role="navigation"
      aria-label="Workspace Studio Navigation"
    >
      <p className="platform-access__operator-pe-label">
        Workspace · Partner Environment
      </p>
      <div className="platform-access__operator-pe-actions" role="group">
        {surfaces.map((surface) => {
          const label = WORKSPACE_STUDIO_LABELS[surface];
          const isActive = surface === activeSurface;
          if (isActive) {
            return (
              <span
                key={surface}
                className="platform-access__operator-pe-btn platform-access__operator-pe-btn--active"
                aria-current="page"
                data-testid={`workspace-studio-${surface}`}
              >
                {label}
              </span>
            );
          }
          return (
            <button
              key={surface}
              type="button"
              className={
                surface === 'office'
                  ? 'platform-access__operator-pe-btn platform-access__operator-pe-btn--return'
                  : 'platform-access__operator-pe-btn'
              }
              data-testid={`workspace-studio-${surface}`}
              onClick={() => {
                if (onSelectSurface !== undefined) {
                  onSelectSurface(surface);
                  return;
                }
                switchOperatorPartnerStudio(surface, {
                  retainWorkspace: true,
                  navigate: false,
                });
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** @deprecated OF-13 — use WorkspaceStudioNavigation */
export function OperatorPartnerEnvironmentBar({
  activeSurface,
}: {
  readonly activeSurface: WorkspaceStudioSurface;
}) {
  return <WorkspaceStudioNavigation activeSurface={activeSurface} />;
}
