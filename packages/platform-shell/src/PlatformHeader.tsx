import type { PlatformStudioId } from './platformStudios';
import { FeedbackButton } from './FeedbackButton';
import { NotificationsBell } from './NotificationsBell';
import { StudioSwitcher } from './StudioSwitcher';
import { UserMenu } from './UserMenu';
import type { PlatformWorkspaceState } from './platformTypes';

export type PlatformHeaderProps = {
  readonly activeStudioId: PlatformStudioId;
  readonly userLabel?: string;
  readonly roleLabel?: string;
  /** @deprecated PR-006 — header no longer shows project/house. Kept for API compat. */
  readonly workspace?: PlatformWorkspaceState | null;
  readonly notificationCount?: number;
  readonly searchPlaceholder?: string;
  readonly onLogout?: () => void;
  readonly onOpenLanding?: () => void;
  readonly onSelectStudio?: (studioId: PlatformStudioId) => void;
  readonly onSubmitFeedback?: (message: string) => void;
};

/**
 * PR-006 — Header: Platform + Studio switch only (no Projekt / Dům).
 */
export function PlatformHeader({
  activeStudioId,
  userLabel = 'Radim',
  roleLabel,
  workspace: _workspace = null,
  notificationCount = 3,
  onLogout,
  onOpenLanding,
  onSelectStudio,
  onSubmitFeedback,
}: PlatformHeaderProps) {
  void _workspace;

  return (
    <header className="platform-header" data-testid="platform-header">
      <div className="platform-header__cluster">
        <button
          type="button"
          className="platform-header__brand platform-breadcrumb__item--action"
          aria-label="CONIS Platform Landing"
          onClick={onOpenLanding}
          disabled={onOpenLanding === undefined}
          style={{
            background: 'transparent',
            border: 0,
            padding: 0,
            cursor: onOpenLanding !== undefined ? 'pointer' : 'default',
          }}
        >
          CON<span className="platform-header__brand-accent">I</span>S
        </button>
      </div>

      <StudioSwitcher
        activeStudioId={activeStudioId}
        onSelectStudio={onSelectStudio}
      />

      <div className="platform-header__actions">
        <div className="platform-user-badge">
          <FeedbackButton onSubmitFeedback={onSubmitFeedback} />
          <NotificationsBell count={notificationCount} />
          <UserMenu
            userLabel={userLabel}
            roleLabel={roleLabel}
            onLogout={onLogout}
            onOpenLanding={onOpenLanding}
          />
        </div>
      </div>
    </header>
  );
}
