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
  readonly workspace?: PlatformWorkspaceState | null;
  readonly notificationCount?: number;
  readonly searchPlaceholder?: string;
  readonly onLogout?: () => void;
  readonly onOpenLanding?: () => void;
  readonly onSubmitFeedback?: (message: string) => void;
};

/**
 * VR-FIX-01 — Platform Header aligned to click-model SSOT.
 */
export function PlatformHeader({
  activeStudioId,
  userLabel = 'Radim',
  roleLabel,
  notificationCount = 3,
  onLogout,
  onOpenLanding,
  onSubmitFeedback,
}: PlatformHeaderProps) {
  return (
    <header className="platform-header" data-testid="platform-header">
      <div className="platform-header__cluster">
        <p className="platform-header__brand">
          CON<span className="platform-header__brand-accent">I</span>S
        </p>
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
