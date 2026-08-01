/**
 * EPIC-BX-11 / VR-FIX-01 — Platform Shell theme tokens (click-model SSOT).
 */

import type { PlatformStudioId } from './platformStudios';
import { getPlatformStudio } from './platformStudios';

export const PLATFORM_HEADER_HEIGHT_PX = 70;

export type PlatformTheme = {
  readonly studioId: PlatformStudioId;
  readonly accent: string;
  readonly headerHeightPx: number;
  readonly ink: string;
  readonly muted: string;
  readonly line: string;
  readonly surface: string;
  readonly canvas: string;
  readonly navy: string;
  readonly gold: string;
};

export function getPlatformTheme(studioId: PlatformStudioId): PlatformTheme {
  const studio = getPlatformStudio(studioId);
  return {
    studioId,
    accent: studio.accent,
    headerHeightPx: PLATFORM_HEADER_HEIGHT_PX,
    ink: '#001930',
    muted: '#64748B',
    line: '#E2E8F0',
    surface: '#FFFFFF',
    canvas: '#F5F7FB',
    navy: '#001930',
    gold: '#B8922D',
  };
}
