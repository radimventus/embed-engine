/**
 * EPIC-BX-06 — Device Preview viewports (same Shared Runtime, CSS frame only).
 */

export type PreviewDeviceId = 'desktop' | 'tablet' | 'mobile';

export type PreviewDevice = {
  readonly id: PreviewDeviceId;
  readonly label: string;
  readonly width: number;
  readonly height: number;
};

export const PREVIEW_DEVICES: readonly PreviewDevice[] = [
  { id: 'desktop', label: 'Desktop', width: 1280, height: 800 },
  { id: 'tablet', label: 'Tablet', width: 768, height: 1024 },
  { id: 'mobile', label: 'Mobile', width: 390, height: 844 },
] as const;

export function getPreviewDevice(id: PreviewDeviceId): PreviewDevice {
  return PREVIEW_DEVICES.find((item) => item.id === id) ?? PREVIEW_DEVICES[0];
}
