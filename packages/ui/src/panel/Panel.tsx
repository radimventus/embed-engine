import type { HTMLAttributes, ReactNode } from 'react';

import { panelClass, type PanelVariant } from './panel-styles';

type PanelProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'className'> & {
  children: ReactNode;
  variant?: PanelVariant;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article';
};

export function Panel({
  children,
  variant = 'cream',
  className,
  as: Component = 'div',
  ...props
}: PanelProps) {
  return (
    <Component className={panelClass({ variant, className })} {...props}>
      {children}
    </Component>
  );
}

export type { PanelVariant };
export { panelClass };
