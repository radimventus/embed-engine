import type { ReactNode } from 'react';

import type { CapabilityHost, CapabilityId } from '@embed-engine/capabilities';

import { CapabilityHostBar } from './CapabilityHostBar';
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
 * EPIC-BX-11 / BX-13 / BX-14 — Platform Shell root.
 * Shell loads Capability Host and composes Studio chrome.
 */
export function PlatformShell({
  activeStudioId,
  userLabel,
  roleLabel,
  workspace,
  notificationCount,
  searchPlaceholder,
  onLogout,
  onOpenLanding,
  breadcrumb = [],
  capabilityHost = null,
  activeCapabilityId = null,
  children,
}: PlatformShellProps) {
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
        onLogout={onLogout}
        onOpenLanding={onOpenLanding}
      />
      <PlatformBreadcrumb items={breadcrumb} />
      {capabilityHost !== null && (
        <CapabilityHostBar
          host={capabilityHost}
          activeCapabilityId={activeCapabilityId}
        />
      )}
      {children}
    </div>
  );
}
