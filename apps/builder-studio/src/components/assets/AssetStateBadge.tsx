import {
  PlatformStatusBadge,
  type PlatformStatusTone,
} from '@embed-engine/platform-shell';

import type { AssetUiState } from '../../model';

const STATE_BADGE: Record<
  AssetUiState,
  { readonly label: string; readonly tone: PlatformStatusTone }
> = {
  Empty: { label: 'Prázdné', tone: 'draft' },
  Loading: { label: 'Načítám', tone: 'info' },
  Ready: { label: 'Připraveno', tone: 'ready' },
  Error: { label: 'Chyba', tone: 'fail' },
};

type AssetStateBadgeProps = {
  readonly state: AssetUiState;
};

/**
 * VR-FIX-06 — Asset state via PlatformStatusBadge.
 */
export function AssetStateBadge({ state }: AssetStateBadgeProps) {
  const style = STATE_BADGE[state];
  return (
    <PlatformStatusBadge tone={style.tone}>{style.label}</PlatformStatusBadge>
  );
}
