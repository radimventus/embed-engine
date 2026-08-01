/**
 * EPIC-BX-11 / BX-13 — thin re-exports of the shared Platform Shell.
 */

export {
  PlatformShell,
  PlatformHeader,
  PlatformBreadcrumb,
  StudioSwitcher,
  WorkspaceSwitcher,
  UserMenu,
  NotificationsBell,
  CapabilityHostBar,
  CapabilityInspector,
  buildInspectorModel,
  PlatformStatusBadge,
  statusToneFromLabel,
  PlatformCard,
  PlatformEmptyState,
  PlatformDialog,
  PlatformConfirmDialog,
  PlatformField,
  PlatformNotice,
  PlatformLoading,
  PLATFORM_STUDIOS,
  PLATFORM_STUDIO_SWITCH_ORDER,
  getPlatformStudio,
  getPlatformTheme,
  PLATFORM_HEADER_HEIGHT_PX,
  buildPlatformWorkspaceState,
  type PlatformStudio,
  type PlatformStudioId,
  type PlatformTheme,
  type PlatformBreadcrumbItem,
  type PlatformWorkspaceOption,
  type PlatformWorkspaceState,
  type PlatformStatusTone,
} from '@embed-engine/platform-shell';

/** Active Studio for this app (Builder). */
export const ACTIVE_PLATFORM_STUDIO_ID = 'builder' as const;
