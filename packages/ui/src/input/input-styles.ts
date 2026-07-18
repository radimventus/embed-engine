import { cn } from '../lib/cn';
import { FOCUS_RING_CLASS } from '../button/primary-button-styles';

export type InputVariant = 'default' | 'framed';

const VARIANT_CLASS: Record<InputVariant, string> = {
  default: 'h-[50px] rounded-[8px] bg-[#F7F6F4]',
  framed: 'h-[50px] rounded-[8px] border border-embed-border-default bg-[#F7F6F4]',
};

export function inputClass(options: {
  variant?: InputVariant;
  className?: string;
}): string {
  const variant = options.variant ?? 'default';

  return cn(
    'box-border w-full px-4 text-sm text-embed-foreground-primary placeholder:text-embed-foreground-primary/40',
    VARIANT_CLASS[variant],
    options.className,
  );
}

export function framedInputClass(options?: { className?: string }): string {
  return cn(
    inputClass({ variant: 'framed', className: 'px-3' }),
    FOCUS_RING_CLASS,
    options?.className,
  );
}

export const inputRowClass =
  'box-border flex h-[50px] w-full min-w-0 items-stretch overflow-hidden rounded-[8px] border border-embed-border-default bg-[#F7F6F4]';
