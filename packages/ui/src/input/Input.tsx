import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

import { cn } from '../lib/cn';
import { framedInputClass, inputClass, inputRowClass, type InputVariant } from './input-styles';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  variant?: InputVariant;
  className?: string;
};

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
  variant?: InputVariant;
  className?: string;
};

type InputRowProps = {
  children: ReactNode;
  className?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { variant = 'default', className, ...props },
  ref,
) {
  return <input ref={ref} className={inputClass({ variant, className })} {...props} />;
});

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { variant = 'default', className, ...props },
  ref,
) {
  return <textarea ref={ref} className={inputClass({ variant, className })} {...props} />;
});

export const FramedInput = forwardRef<HTMLInputElement, Omit<InputProps, 'variant'>>(
  function FramedInput({ className, ...props }, ref) {
    return <input ref={ref} className={framedInputClass({ className })} {...props} />;
  },
);

export function InputRow({ children, className }: InputRowProps) {
  return <div className={cn(inputRowClass, className)}>{children}</div>;
}

export type { InputVariant };
export { inputClass, framedInputClass, inputRowClass };
