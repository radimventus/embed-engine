import { PlatformLoading } from '@embed-engine/platform-shell';

/**
 * Unified Runtime bootstrap loading surface (MSCB-01 / VR-FIX-03).
 */
export function StudioLoading({
  label = 'Načítám Manager Studio…',
}: {
  readonly label?: string;
}) {
  return <PlatformLoading label={label} />;
}
