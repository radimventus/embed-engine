import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import {
  primaryButtonClass,
  type PrimaryButtonSize,
} from './primary-button-styles';

type SharedProps = {
  children: ReactNode;
  size?: PrimaryButtonSize;
  className?: string;
};

export type PrimaryButtonProps = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SharedProps | 'disabled'> & {
    disabled?: boolean;
  };

export type PrimaryLinkProps = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof SharedProps> & {
    href: string;
  };

export type { PrimaryButtonSize };

export function PrimaryButton({
  children,
  size = 'md',
  className,
  disabled,
  type = 'button',
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={primaryButtonClass({
        size,
        state: disabled ? 'disabled' : 'default',
        className,
      })}
      {...props}
    >
      {children}
    </button>
  );
}

export function PrimaryLink({
  children,
  size = 'md',
  className,
  href,
  ...props
}: PrimaryLinkProps) {
  return (
    <a
      href={href}
      className={primaryButtonClass({ size, state: 'default', className })}
      {...props}
    >
      {children}
    </a>
  );
}
