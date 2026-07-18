import type { ButtonHTMLAttributes, ReactNode } from 'react';

import {
  secondaryButtonClass,
  type SecondaryButtonSize,
  type SecondaryButtonVariant,
} from './secondary-button-styles';

type SecondaryButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & {
  children: ReactNode;
  variant?: SecondaryButtonVariant;
  size?: SecondaryButtonSize;
  className?: string;
};

export type { SecondaryButtonSize, SecondaryButtonVariant };

export function SecondaryButton({
  children,
  variant = 'solid',
  size = 'md',
  className,
  disabled,
  type = 'button',
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={secondaryButtonClass({ variant, size, disabled, className })}
      {...props}
    >
      {children}
    </button>
  );
}
