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
  PLATFORM_STUDIOS,
  getPlatformStudio,
  getPlatformTheme,
  PLATFORM_HEADER_HEIGHT_PX,
  type PlatformStudio,
  type PlatformStudioId,
  type PlatformTheme,
  type PlatformBreadcrumbItem,
  type PlatformWorkspaceOption,
  type PlatformWorkspaceState,
} from '@embed-engine/platform-shell';

/** Active Studio for this app (Builder). */
export const ACTIVE_PLATFORM_STUDIO_ID = 'builder' as const;
