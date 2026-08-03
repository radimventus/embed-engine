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
};

/**
 * EPIC-BX-11 / VR-FIX-01 — Platform Shell root (sticky chrome, scrolling body).
 */
export function PlatformShell({
  activeStudioId,
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
  breadcrumb = [],
  capabilityHost = null,
  activeCapabilityId = null,
  children,
}: PlatformShellProps) {
  void capabilityHost;
  void activeCapabilityId;

  return (
    <div
      data-platform-shell=""
      data-studio={activeStudioId}
      data-capability-host={capabilityHost !== null ? 'true' : 'false'}
    >
      <PlatformHeader
        activeStudioId={activeStudioId}
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
      />
      <PlatformBreadcrumb items={breadcrumb} />
      <div className="platform-body">{children}</div>
    </div>
  );
}
