import { cn } from '../lib/cn';

export const FOCUS_RING_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2';

export const MOTION_CLASS = 'duration-200 ease-out';

export type PrimaryButtonSize = 'md' | 'sm' | 'full';
export type PrimaryButtonState = 'default' | 'disabled';

const PRIMARY_SIZE_CLASS: Record<PrimaryButtonSize, string> = {
  md: 'rounded-[8px] px-8 py-4 text-base',
  sm: 'rounded-[8px] px-6 py-3 text-sm',
  full: 'w-full rounded-[8px] px-6 py-3 text-sm',
};

export function primaryButtonClass(options: {
  size?: PrimaryButtonSize;
  state?: PrimaryButtonState;
  className?: string;
}): string {
  const size = options.size ?? 'md';
  const state = options.state ?? 'default';

  return cn(
    'inline-flex items-center justify-center text-center font-sans font-medium',
    MOTION_CLASS,
    FOCUS_RING_CLASS,
    PRIMARY_SIZE_CLASS[size],
    'bg-[#001930] text-[#FFFFFF]',
    state === 'disabled' && 'cursor-not-allowed',
    options.className,
  );
}
