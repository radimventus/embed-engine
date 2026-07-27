import { CLOSE_ICON_DISPLAY_PX, CLOSE_ICON_SRC } from './closeAsset';
import { cn } from '../lib/cn';

type CloseIconProps = {
  readonly className?: string;
};

/**
 * Platform Close glyph — shared PNG, no chrome.
 * Display size is fixed at 30×30 px.
 */
export function CloseIcon({ className }: CloseIconProps) {
  return (
    <img
      src={CLOSE_ICON_SRC}
      alt=""
      width={CLOSE_ICON_DISPLAY_PX}
      height={CLOSE_ICON_DISPLAY_PX}
      className={cn(
        'pointer-events-none select-none object-contain',
        className,
      )}
      style={{
        width: CLOSE_ICON_DISPLAY_PX,
        height: CLOSE_ICON_DISPLAY_PX,
      }}
      aria-hidden="true"
      draggable={false}
    />
  );
}
