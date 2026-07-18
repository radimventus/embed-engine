import { cn } from '../lib/cn';

export type SegmentedControlSize = 'compact' | 'panel';

/** Color theme for the action (non-current) segment. Current state uses surface.interactive. */
export type SegmentedControlTheme = 'navy' | 'gold';

const SHELL_SIZE_CLASS: Record<SegmentedControlSize, string> = {
  compact: 'inline-flex w-full min-w-0 shrink-0 gap-0.5 rounded-[7px] p-0.5',
  panel: 'mx-auto flex w-full gap-section bg-transparent p-0',
};

const SEGMENT_SIZE_CLASS: Record<SegmentedControlSize, string> = {
  compact: 'flex-1 rounded-[5px] py-2 text-xs font-medium tracking-wide',
  panel: 'flex-1 rounded-[6px] px-section py-3 text-center text-sm font-medium',
};

/** @deprecated Prefer segmentedControlShellClassName(size) */
export const segmentedControlShellClass = SHELL_SIZE_CLASS.compact;

export function segmentedControlShellClassName(
  size: SegmentedControlSize = 'compact',
  className?: string,
): string {
  return cn(SHELL_SIZE_CLASS[size], className);
}

/** Layout/size only — fill colors are applied via design-token styles in SegmentedControl. */
export function segmentedControlSegmentClass(options: {
  selected: boolean;
  disabled?: boolean;
  theme?: SegmentedControlTheme;
  size?: SegmentedControlSize;
  className?: string;
}): string {
  const size = options.size ?? 'compact';

  return cn(
    SEGMENT_SIZE_CLASS[size],
    options.disabled ? 'cursor-not-allowed' : undefined,
    options.className,
  );
}
