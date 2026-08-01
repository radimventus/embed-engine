/**
 * EPIC-BX-11 — Platform Shell theme tokens (shared chrome).
 */

import type { PlatformStudioId } from './platformStudios';
import { getPlatformStudio } from './platformStudios';

export const PLATFORM_HEADER_HEIGHT_PX = 72;

export type PlatformTheme = {
  readonly studioId: PlatformStudioId;
  readonly accent: string;
  readonly headerHeightPx: number;
  readonly ink: string;
  readonly muted: string;
  readonly line: string;
  readonly surface: string;
  readonly canvas: string;
};

export function getPlatformTheme(studioId: PlatformStudioId): PlatformTheme {
  const studio = getPlatformStudio(studioId);
  return {
    studioId,
    accent: studio.accent,
    headerHeightPx: PLATFORM_HEADER_HEIGHT_PX,
    ink: '#1A2332',
    muted: '#6B7A90',
    line: '#DDE5EF',
    surface: '#FFFFFF',
    canvas: '#F5F7FA',
  };
}
