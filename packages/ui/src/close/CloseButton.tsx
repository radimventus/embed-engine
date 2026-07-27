import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../lib/cn';
import { getVisualMetrics } from '../visual/createVisual';
import { CloseIcon } from './CloseIcon';

export type CloseButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'type'
> & {
  readonly 'aria-label'?: string;
};

/**
 * Platform Close control — Visual API glyph inside hit area.
 * Hover may change opacity/cursor only; the glyph is unmodified.
 */
export function CloseButton({
  className,
  'aria-label': ariaLabel = 'Zavřít',
  ...props
}: CloseButtonProps) {
  const { hitAreaPx } = getVisualMetrics('close');
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex shrink-0 items-center justify-center border-0 bg-transparent p-0 transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-embed-action-primary',
        className,
      )}
      style={{
        width: hitAreaPx,
        height: hitAreaPx,
        minWidth: hitAreaPx,
        minHeight: hitAreaPx,
      }}
      {...props}
    >
      <CloseIcon />
    </button>
  );
}
