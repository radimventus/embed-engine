import type { PlatformStudioId } from './platformStudios';
import { NotificationsBell } from './NotificationsBell';
import { StudioSwitcher } from './StudioSwitcher';
import { UserMenu } from './UserMenu';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import type { PlatformWorkspaceState } from './platformTypes';

export type PlatformHeaderProps = {
  readonly activeStudioId: PlatformStudioId;
  readonly userLabel?: string;
  readonly workspace?: PlatformWorkspaceState | null;
  readonly notificationCount?: number;
  readonly searchPlaceholder?: string;
};

/**
 * EPIC-BX-11 — Shared Platform Header for Builder / Manager / Sales.
 */
export function PlatformHeader({
  activeStudioId,
  userLabel = 'Radim',
  workspace = null,
  notificationCount = 3,
  searchPlaceholder = 'Hledat v platformě…',
}: PlatformHeaderProps) {
  return (
    <header className="platform-header" data-testid="platform-header">
      <div className="platform-header__cluster">
        <p className="platform-header__brand">
          CON<span className="platform-header__brand-accent">IS</span>
        </p>
        <StudioSwitcher activeStudioId={activeStudioId} />
        <WorkspaceSwitcher workspace={workspace} />
      </div>

      <div className="platform-header__actions">
        <input
          className="platform-search"
          type="search"
          placeholder={searchPlaceholder}
          aria-label="Global Search"
        />
        <NotificationsBell count={notificationCount} />
        <UserMenu userLabel={userLabel} />
      </div>
    </header>
  );
}
