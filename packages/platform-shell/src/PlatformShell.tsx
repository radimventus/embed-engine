import type { ReactNode } from 'react';

import { PlatformBreadcrumb } from './PlatformBreadcrumb';
import { PlatformHeader, type PlatformHeaderProps } from './PlatformHeader';
import type { PlatformBreadcrumbItem } from './platformTypes';

export type PlatformShellProps = PlatformHeaderProps & {
  readonly breadcrumb?: readonly PlatformBreadcrumbItem[];
  readonly children?: ReactNode;
};

/**
 * EPIC-BX-11 — Platform Shell root (header + breadcrumb + studio accent).
 */
export function PlatformShell({
  activeStudioId,
  userLabel,
  workspace,
  notificationCount,
  searchPlaceholder,
  breadcrumb = [],
  children,
}: PlatformShellProps) {
  return (
    <div data-platform-shell="" data-studio={activeStudioId}>
      <PlatformHeader
        activeStudioId={activeStudioId}
        userLabel={userLabel}
        workspace={workspace}
        notificationCount={notificationCount}
        searchPlaceholder={searchPlaceholder}
      />
      <PlatformBreadcrumb items={breadcrumb} />
      {children}
    </div>
  );
}
