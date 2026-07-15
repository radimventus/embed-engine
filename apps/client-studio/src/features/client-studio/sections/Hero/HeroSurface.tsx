import type { ReactNode } from 'react';

type HeroSurfaceProps = {
  children: ReactNode;
};

export function HeroSurface({ children }: HeroSurfaceProps) {
  return (
    <div
      role="img"
      aria-label="Rodinný dům MODERN A01"
      className="bg-[url('/demo/hero-house.png')] bg-cover bg-[center_42%] bg-no-repeat"
    >
      {children}
    </div>
  );
}
