import type { PlatformStudioId } from './platformStudios';
import { CLOUD_PLATFORM_ORIGIN } from './platformStudios';
import { FeedbackButton } from './FeedbackButton';
import { NotificationsBell } from './NotificationsBell';
import { StudioSwitcher } from './StudioSwitcher';
import { UserMenu } from './UserMenu';
import type { PlatformWorkspaceState } from './platformTypes';

export type PlatformHeaderProps = {
  readonly activeStudioId: PlatformStudioId;
  readonly availableStudioIds?: readonly PlatformStudioId[];
  readonly userLabel?: string;
  readonly roleLabel?: string;
  /** @deprecated PR-006 — header no longer shows project/house. Kept for API compat. */
  readonly workspace?: PlatformWorkspaceState | null;
  readonly notificationCount?: number;
  readonly searchPlaceholder?: string;
  /** PE-02 — partner company / trade mark (Manager / Sales only). */
  readonly partnerBrandLabel?: string | null;
  readonly onLogout?: () => void;
  readonly onOpenLanding?: () => void;
  readonly onSelectStudio?: (studioId: PlatformStudioId) => void;
  readonly onSubmitFeedback?: (message: string) => void;
  /** OF-13 / VR-005 — hide when a host already owns chrome (rare); default shows PlatformShell switcher. */
  readonly hideStudioSwitcher?: boolean;
};

/**
 * PR-006 — Header: Platform + Studio switch only (no Projekt / Dům).
 * Brand + link under logo → public site https://conis.cz
 * PE-02 — optional partner brand line under CONIS (partner studios).
 */
export function PlatformHeader({
  activeStudioId,
  availableStudioIds,
  userLabel = 'Radim',
  roleLabel,
  workspace: _workspace = null,
  notificationCount = 3,
  partnerBrandLabel = null,
  onLogout,
  onOpenLanding,
  onSelectStudio,
  onSubmitFeedback,
  hideStudioSwitcher = false,
}: PlatformHeaderProps) {
  void _workspace;
  const partnerLabel = partnerBrandLabel?.trim() || null;

  return (
    <header className="platform-header" data-testid="platform-header">
      <div className="platform-header__cluster">
        <div className="platform-header__brand-block">
          <a
            className="platform-header__brand"
            href={CLOUD_PLATFORM_ORIGIN}
            aria-label="CONIS — conis.cz"
          >
            CON<span className="platform-header__brand-accent">I</span>S
          </a>
          <a
            className="platform-header__site-link"
            href={CLOUD_PLATFORM_ORIGIN}
          >
            conis.cz
          </a>
          {partnerLabel !== null ? (
            <p
              className="platform-header__partner-brand"
              data-testid="platform-partner-brand"
              data-studio={activeStudioId}
            >
              {partnerLabel}
            </p>
          ) : null}
        </div>
      </div>

      {hideStudioSwitcher ? null : (
        <StudioSwitcher
          activeStudioId={activeStudioId}
          availableStudioIds={availableStudioIds}
          onSelectStudio={onSelectStudio}
        />
      )}

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
