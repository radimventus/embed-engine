/**
 * Platform Studio switcher targets (local Vite ports).
 * Shared chrome — Builder is the first consumer (EPIC-BX-01).
 */

export type PlatformStudioId =
  | 'builder'
  | 'manager'
  | 'sales'
  | 'client';

export type PlatformStudio = {
  readonly id: PlatformStudioId;
  readonly label: string;
  /** Absolute local URL, or null when Studio is not yet available. */
  readonly href: string | null;
  readonly available: boolean;
};

export const PLATFORM_STUDIOS: readonly PlatformStudio[] = [
  {
    id: 'builder',
    label: 'Builder Studio',
    href: 'http://127.0.0.1:4177/',
    available: true,
  },
  {
    id: 'manager',
    label: 'Manager Studio',
    href: 'http://127.0.0.1:4175/',
    available: true,
  },
  {
    id: 'sales',
    label: 'Sales Studio',
    href: null,
    available: false,
  },
  {
    id: 'client',
    label: 'Client Studio',
    href: 'http://127.0.0.1:4173/',
    available: true,
  },
] as const;

export const ACTIVE_PLATFORM_STUDIO_ID: PlatformStudioId = 'builder';
