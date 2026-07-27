import {
  CLOSE_VISUAL_CIRCLE,
  CLOSE_VISUAL_CIRCLE_FILL,
  CLOSE_VISUAL_CROSS_BARS,
  CLOSE_VISUAL_CROSS_FILL,
  CLOSE_VISUAL_CROSS_ROTATION,
  CLOSE_VISUAL_METRICS,
  CLOSE_VISUAL_VIEWBOX,
} from '../visual/elements/close';
import { cn } from '../lib/cn';

type CloseIconProps = {
  readonly className?: string;
};

/**
 * Platform Close glyph — Visual API SSOT (inline SVG), no asset loader.
 * Navy circle + white X matching the original platform close glyph.
 */
export function CloseIcon({ className }: CloseIconProps) {
  const { displayPx } = CLOSE_VISUAL_METRICS;
  return (
    <svg
      width={displayPx}
      height={displayPx}
      viewBox={CLOSE_VISUAL_VIEWBOX}
      className={cn('pointer-events-none select-none', className)}
      style={{
        width: displayPx,
        height: displayPx,
        flexShrink: 0,
        display: 'block',
      }}
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx={CLOSE_VISUAL_CIRCLE.cx}
        cy={CLOSE_VISUAL_CIRCLE.cy}
        r={CLOSE_VISUAL_CIRCLE.r}
        fill={CLOSE_VISUAL_CIRCLE_FILL}
      />
      <g transform={CLOSE_VISUAL_CROSS_ROTATION} fill={CLOSE_VISUAL_CROSS_FILL}>
        {CLOSE_VISUAL_CROSS_BARS.map((bar) => (
          <rect
            key={`${bar.x}-${bar.y}`}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
          />
        ))}
      </g>
    </svg>
  );
}
