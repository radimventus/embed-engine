import { ManagerWorkspaceScopeControls } from "./ManagerWorkspaceScopeControls";

/**
 * TASK 74 — Manager Studio keeps Workspace Project context as data authority,
 * but its left rail exposes only House scope.
 *
 * Manager intelligence remains one continuous canvas; section navigation is
 * not duplicated in the left rail.
 */
export function ManagerStudioSidebar() {
  return (
    <aside
      className="manager-studio-sidebar flex h-full w-[260px] shrink-0 flex-col border-r-2 border-[var(--platform-cream-dark)] bg-[var(--platform-cream-light)]"
      data-studio-shell="sidebar"
      aria-label="Navigace Manager Studia"
    >
      <ManagerWorkspaceScopeControls />
    </aside>
  );
}
