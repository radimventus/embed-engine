import type { AssetUiState } from '../../model';

const STATE_STYLES: Record<
  AssetUiState,
  { readonly label: string; readonly className: string }
> = {
  Empty: {
    label: 'Empty',
    className: 'border-builder-line bg-builder-hover text-builder-muted',
  },
  Loading: {
    label: 'Loading',
    className: 'border-builder-panelBorder bg-builder-panel text-builder-navy',
  },
  Ready: {
    label: 'Ready',
    className:
      'border-builder-successBorder bg-builder-successBg text-builder-success',
  },
  Error: {
    label: 'Error',
    className: 'border-builder-draftBorder bg-builder-draftBg text-builder-draft',
  },
};

type AssetStateBadgeProps = {
  readonly state: AssetUiState;
};

export function AssetStateBadge({ state }: AssetStateBadgeProps) {
  const style = STATE_STYLES[state];
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${style.className}`}
    >
      {style.label}
    </span>
  );
}
