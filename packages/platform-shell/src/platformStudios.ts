/**
 * EPIC-BX-11 — Platform Studio registry (local Vite ports).
 * URL switch only — routing framework left for later.
 */

export type PlatformStudioId = 'builder' | 'manager' | 'sales';

export type PlatformStudio = {
  readonly id: PlatformStudioId;
  readonly label: string;
  readonly shortLabel: string;
  /** Absolute local URL, or null when Studio is not yet available. */
  readonly href: string | null;
  readonly available: boolean;
  readonly accent: string;
};

export const PLATFORM_STUDIOS: readonly PlatformStudio[] = [
  {
    id: 'builder',
    label: 'Builder Studio',
    shortLabel: 'Builder',
    href: 'http://127.0.0.1:4177/',
    available: true,
    accent: '#1E4D8C',
  },
  {
    id: 'manager',
    label: 'Manager Studio',
    shortLabel: 'Manager',
    href: 'http://127.0.0.1:4175/',
    available: true,
    accent: '#1F7A4D',
  },
  {
    id: 'sales',
    label: 'Sales Studio',
    shortLabel: 'Sales',
    href: 'http://127.0.0.1:4179/',
    available: true,
    accent: '#C45C26',
  },
] as const;

export function getPlatformStudio(id: PlatformStudioId): PlatformStudio {
  return PLATFORM_STUDIOS.find((studio) => studio.id === id) ?? PLATFORM_STUDIOS[0];
}
