import type { ButtonHTMLAttributes } from 'react';

import { cn } from '../lib/cn';
import { CLOSE_HIT_AREA_PX } from './closeAsset';
import { CloseIcon } from './CloseIcon';

export type CloseButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'type'
> & {
  readonly 'aria-label'?: string;
};

/**
 * Platform Close control — shared PNG inside a ≥44×44 hit area.
 * Hover may change opacity/cursor only; the PNG is unmodified.
 */
export function CloseButton({
  className,
  'aria-label': ariaLabel = 'Zavřít',
  ...props
}: CloseButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex shrink-0 items-center justify-center border-0 bg-transparent p-0 transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-embed-action-primary',
        className,
      )}
      style={{
        width: CLOSE_HIT_AREA_PX,
        height: CLOSE_HIT_AREA_PX,
        minWidth: CLOSE_HIT_AREA_PX,
        minHeight: CLOSE_HIT_AREA_PX,
      }}
      {...props}
    >
      <CloseIcon />
    </button>
  );
}
