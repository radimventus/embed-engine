import type { ReactNode } from 'react';

type PlatformFieldProps = {
  readonly label: string;
  readonly htmlFor?: string;
  readonly helper?: string;
  readonly error?: string;
  readonly children: ReactNode;
};

/**
 * VR-FIX-03 — Unified form field grammar (label · helper · control · error).
 */
export function PlatformField({
  label,
  htmlFor,
  helper,
  error,
  children,
}: PlatformFieldProps) {
  return (
    <label className="platform-field" htmlFor={htmlFor}>
      <span className="platform-field__label">{label}</span>
      {helper !== undefined && helper.length > 0 && (
        <span className="platform-field__helper">{helper}</span>
      )}
      <span className="platform-field__control">{children}</span>
      {error !== undefined && error.length > 0 && (
        <span className="platform-field__error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
