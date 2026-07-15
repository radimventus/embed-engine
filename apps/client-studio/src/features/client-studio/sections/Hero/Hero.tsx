import { HeroContent } from './HeroContent';
import { HeroImage } from './HeroImage';
import { HeroSurface } from './HeroSurface';
import { SocialProof } from './SocialProof';

export function Hero() {
  return (
    <section
      aria-label="Opening"
      className="border-b border-embed-border-default bg-embed-background-primary"
    >
      <HeroSurface>
        <HeroImage />
        <HeroContent />
      </HeroSurface>
      <SocialProof />
    </section>
  );
}
