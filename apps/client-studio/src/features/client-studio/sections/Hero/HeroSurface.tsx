import type { ReactNode } from 'react';

import { HOUSE_PACKAGE } from '../../../walkthrough';

type HeroSurfaceProps = {
  children: ReactNode;
};

export function HeroSurface({ children }: HeroSurfaceProps) {
  const heroSrc = HOUSE_PACKAGE.openingHeroSrc;

  return (
    <div
      role="img"
      aria-label="Rodinný dům MODERN A01"
      className="relative bg-cover bg-[center_42%] bg-no-repeat"
      style={{ backgroundImage: `url('${heroSrc}')` }}
    >
      {children}
    </div>
  );
}
