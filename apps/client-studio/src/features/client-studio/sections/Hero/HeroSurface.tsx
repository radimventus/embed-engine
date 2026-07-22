import type { ReactNode } from 'react';

type HeroSurfaceProps = {
  children: ReactNode;
};

/** Opening hero shell — height from h-hero-image; layout owned by children. */
export function HeroSurface({ children }: HeroSurfaceProps) {
  return (
    <div className="relative h-hero-image w-full overflow-hidden mobile:h-auto mobile:min-h-0">
      {children}
    </div>
  );
}
