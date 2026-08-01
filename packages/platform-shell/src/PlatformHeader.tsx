import type { PlatformStudioId } from './platformStudios';
import { FeedbackButton } from './FeedbackButton';
import { NotificationsBell } from './NotificationsBell';
import { StudioSwitcher } from './StudioSwitcher';
import { UserMenu } from './UserMenu';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import type { PlatformWorkspaceState } from './platformTypes';

export type PlatformHeaderProps = {
  readonly activeStudioId: PlatformStudioId;
  readonly userLabel?: string;
  readonly roleLabel?: string;
  readonly workspace?: PlatformWorkspaceState | null;
  readonly notificationCount?: number;
  readonly searchPlaceholder?: string;
  readonly onLogout?: () => void;
  readonly onOpenLanding?: () => void;
  readonly onSubmitFeedback?: (message: string) => void;
};

/**
 * VR-FIX-03 — Header with Studio + Project switchers (same interaction model).
 */
export function PlatformHeader({
  activeStudioId,
  userLabel = 'Radim',
  roleLabel,
  workspace = null,
  notificationCount = 3,
  onLogout,
  onOpenLanding,
  onSubmitFeedback,
}: PlatformHeaderProps) {
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
        <WorkspaceSwitcher workspace={workspace} />
      </div>

      <StudioSwitcher activeStudioId={activeStudioId} />

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
