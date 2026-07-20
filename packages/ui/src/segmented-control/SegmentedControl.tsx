import type { CSSProperties, ReactNode } from 'react';
import { colors } from '@embed-engine/design-tokens';

import {
  segmentedControlSegmentClass,
  segmentedControlShellClass,
  segmentedControlShellClassName,
  type SegmentedControlSize,
  type SegmentedControlTheme,
} from './segmented-control-styles';

export type SegmentedControlOption<T extends string = string> = {
  value: T;
  label: ReactNode;
  disabled?: boolean;
};

type SegmentedControlProps<T extends string = string> = {
  options: readonly SegmentedControlOption<T>[];
  value: T;
  onChange?: (value: T) => void;
  /** Action-segment color theme (navy / gold). Current state is always surface.interactive. */
  theme?: SegmentedControlTheme;
  size?: SegmentedControlSize;
  'aria-label'?: string;
  className?: string;
};

/**
 * Action Segmented Control fills (design tokens only).
 * Current value (stav) → surface.interactive (gray).
 * Alternative (akce) → theme primary (navy / gold).
 */
function segmentFillStyle(
  isCurrent: boolean,
  disabled: boolean,
  theme: SegmentedControlTheme,
): CSSProperties {
  if (disabled) {
    return {
      backgroundColor: colors.surface.interactive,
      color: 'rgb(0 25 48 / 0.3)',
    };
  }

  // Current state — gray, not emphasized
  if (isCurrent) {
    return {
      backgroundColor: colors.surface.interactive,
      color: colors.foreground.primary,
    };
  }

  // Performable action — emphasized
  if (theme === 'gold') {
    return {
      backgroundColor: colors.action.accent,
      color: colors.action.onAccent,
    };
  }

  return {
    backgroundColor: colors.action.primary,
    color: colors.action.onPrimary,
  };
}

/**
 * Action Segmented Control — highlight = next action, gray = current state.
 * Color logic lives only here. Call sites pass theme only.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  theme = 'navy',
  size = 'compact',
  className,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      aria-label={ariaLabel}
      className={segmentedControlShellClassName(size, className)}
      style={
        size === 'compact'
          ? { backgroundColor: colors.surface.interactive }
          : undefined
      }
    >
      {options.map((option) => {
        const isCurrent = option.value === value;
        const disabled = Boolean(option.disabled);

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isCurrent}
            disabled={disabled}
            className={segmentedControlSegmentClass({
              selected: isCurrent,
              disabled,
              theme,
              size,
            })}
            style={segmentFillStyle(isCurrent, disabled, theme)}
            onClick={() => {
              if (!disabled) {
                onChange?.(option.value);
              }
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export type { SegmentedControlSize, SegmentedControlTheme };
export { segmentedControlShellClass, segmentedControlSegmentClass, segmentedControlShellClassName };
