import { cn } from '../lib/cn';
import { FOCUS_RING_CLASS, MOTION_CLASS } from './primary-button-styles';

export type SecondaryButtonVariant = 'solid' | 'outline' | 'muted';
export type SecondaryButtonSize = 'md' | 'sm';

const SIZE_CLASS: Record<SecondaryButtonSize, string> = {
  md: 'rounded-[8px] px-8 py-4 text-base',
  sm: 'rounded-[8px] px-section py-3 text-sm',
};

const VARIANT_CLASS: Record<SecondaryButtonVariant, string> = {
  solid: 'bg-embed-action-secondary text-embed-action-onSecondary',
  outline:
    'border border-embed-action-secondaryAccent bg-embed-action-secondary text-embed-action-secondaryAccent',
  muted:
    'border border-embed-border-default bg-embed-surface-card text-embed-foreground-primary/35',
};

export function secondaryButtonClass(options: {
  variant?: SecondaryButtonVariant;
  size?: SecondaryButtonSize;
  disabled?: boolean;
  className?: string;
}): string {
  const variant = options.variant ?? 'solid';
  const size = options.size ?? 'md';

  return cn(
    'inline-flex items-center justify-center text-center font-sans font-medium transition-[box-shadow,opacity]',
    MOTION_CLASS,
    FOCUS_RING_CLASS,
    SIZE_CLASS[size],
    VARIANT_CLASS[variant],
    options.disabled && variant !== 'muted' && 'cursor-not-allowed opacity-40',
    options.disabled && variant === 'muted' && 'cursor-not-allowed',
    options.className,
  );
}
