import { cn } from '../lib/cn';

export type PanelVariant = 'elevated' | 'cream' | 'inset' | 'row';

const VARIANT_CLASS: Record<PanelVariant, string> = {
  elevated: 'bg-embed-surface-elevated',
  cream: 'bg-embed-surface-card',
  inset: 'rounded-[8px] border border-embed-border-default bg-embed-surface-inset px-section py-5',
  row: 'bg-embed-surface-card',
};

export function panelClass(options: {
  variant?: PanelVariant;
  className?: string;
}): string {
  const variant = options.variant ?? 'cream';
  return cn(VARIANT_CLASS[variant], options.className);
}
