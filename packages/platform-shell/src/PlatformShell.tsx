import type { ReactNode } from 'react';

import type { CapabilityHost, CapabilityId } from '@embed-engine/capabilities';

import { PlatformBreadcrumb } from './PlatformBreadcrumb';
import { PlatformHeader, type PlatformHeaderProps } from './PlatformHeader';
import type { PlatformBreadcrumbItem } from './platformTypes';

export type PlatformShellProps = PlatformHeaderProps & {
  readonly breadcrumb?: readonly PlatformBreadcrumbItem[];
  readonly children?: ReactNode;
  /** EPIC-BX-13 — Capability Host composed for this Studio. */
  readonly capabilityHost?: CapabilityHost | null;
  readonly activeCapabilityId?: CapabilityId | null;
  /**
   * VR-04 — nested Workspace Shell view: no Platform header / breadcrumb.
   * Studio content only inside the shared Workspace Host.
   */
  readonly contentOnly?: boolean;
};

/**
 * EPIC-BX-11 / VR-FIX-01 — Platform Shell root (sticky chrome, scrolling body).
 */
export function PlatformShell({
  activeStudioId,
  availableStudioIds,
  userLabel,
  roleLabel,
  workspace,
  notificationCount,
  searchPlaceholder,
  partnerBrandLabel,
  onLogout,
  onOpenLanding,
  onSelectStudio,
  onSubmitFeedback,
  hideStudioSwitcher = false,
  breadcrumb = [],
  capabilityHost = null,
  activeCapabilityId = null,
  contentOnly = false,
  children,
}: PlatformShellProps) {
  void capabilityHost;
  void activeCapabilityId;

  if (contentOnly) {
    return (
      <div
        data-platform-shell=""
        data-platform-shell-content-only=""
        data-studio={activeStudioId}
        data-capability-host={capabilityHost !== null ? 'true' : 'false'}
      >
        <div className="platform-body">{children}</div>
      </div>
    );
  }

  return (
    <div
      data-platform-shell=""
      data-studio={activeStudioId}
      data-capability-host={capabilityHost !== null ? 'true' : 'false'}
    >
      <PlatformHeader
        activeStudioId={activeStudioId}
        availableStudioIds={availableStudioIds}
        userLabel={userLabel}
        roleLabel={roleLabel}
        workspace={workspace}
        notificationCount={notificationCount}
        searchPlaceholder={searchPlaceholder}
        partnerBrandLabel={partnerBrandLabel}
        onLogout={onLogout}
        onOpenLanding={onOpenLanding}
        onSelectStudio={onSelectStudio}
        onSubmitFeedback={onSubmitFeedback}
        hideStudioSwitcher={hideStudioSwitcher}
      />
      <PlatformBreadcrumb items={breadcrumb} />
      <div className="platform-body">{children}</div>
    </div>
  );
}
