import type { ReactNode } from 'react';

import { palette } from '@embed-engine/design-tokens';

/** CAP UX 52 — navy + white hover for Tour switches. */
const SHELL_BG = palette.lightGray;
const ACTIVE_BG = palette.warmGray;
const IDLE_BG = palette.navy;
const IDLE_TEXT = palette.pureWhite;
const HOVER_BG = palette.gold;
const HOVER_TEXT = palette.navy;
const ACTIVE_TEXT = palette.navy;

/**
 * Published Embed segmented shell (docs/embed), scaled for Tour fine-tuning.
 * Width is intentionally decoupled from the parent container (CAP UX 13/14).
 * `mx-auto` centers in the menu / floorplan column (parent is not a flex item host).
 * Inline fills / radii / font beat Delivery button CSS reset (`font-size: inherit`).
 */
export const TOUR_SEGMENTED_SHELL_CLASS =
  'mx-auto flex w-[70%] min-w-0 shrink-0 gap-[1.6px] rounded-[6.4px] border border-embed-border-default p-[1.6px]';

/** Idle segment corner radius — set inline so CSS isolation cannot zero it. */
const IDLE_SEGMENT_RADIUS_PX = 4.8;

/** Segment label size — inline; Tailwind loses to `[data-embed-boundary] button { font-size: inherit }`. */
const SEGMENT_FONT_SIZE_PX = 12.5;

/** Semi-bold — inline; Delivery isolation resets `font-weight: inherit`. */
const SEGMENT_FONT_WEIGHT = 600;

export function tourSegmentedButtonClass(active: boolean): string {
  return `flex-1 py-[6.4px] font-medium leading-normal tracking-wide transition-colors duration-[125ms] ease-out touch-manipulation ${
    active ? 'font-semibold' : 'font-normal'
  }`;
}

type TourSegmentedOption<T extends string> = {
  readonly value: T;
  readonly label: ReactNode;
};

type TourSegmentedControlProps<T extends string> = {
  readonly 'aria-label': string;
  readonly value: T;
  readonly options: readonly TourSegmentedOption<T>[];
  readonly onChange: (value: T) => void;
};

/**
 * Shared Tour segmented control — Embed-published visuals, current handlers.
 */
export function TourSegmentedControl<T extends string>({
  'aria-label': ariaLabel,
  value,
  options,
  onChange,
}: TourSegmentedControlProps<T>) {
  return (
    <div
      aria-label={ariaLabel}
      className={TOUR_SEGMENTED_SHELL_CLASS}
      style={{ backgroundColor: SHELL_BG }}
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            className={tourSegmentedButtonClass(active)}
            style={{
              backgroundColor: active ? ACTIVE_BG : IDLE_BG,
              color: active ? ACTIVE_TEXT : IDLE_TEXT,
              borderRadius: active ? 0 : IDLE_SEGMENT_RADIUS_PX,
              borderStyle: 'none',
              borderWidth: 0,
              fontSize: SEGMENT_FONT_SIZE_PX,
              fontWeight: SEGMENT_FONT_WEIGHT,
            }}
            onMouseEnter={(event) => {
              if (!active) {
                event.currentTarget.style.backgroundColor = HOVER_BG;
                event.currentTarget.style.color = HOVER_TEXT;
              }
            }}
            onMouseLeave={(event) => {
              if (!active) {
                event.currentTarget.style.backgroundColor = IDLE_BG;
                event.currentTarget.style.color = IDLE_TEXT;
              }
            }}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
