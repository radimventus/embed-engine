import { HeroContent } from './HeroContent';
import { HeroCTA } from './HeroCTA';
import { HeroImage } from './HeroImage';
import { SocialProof } from './SocialProof';

export function Hero() {
  return (
    <section
      aria-label="Opening"
      className="border-b border-embed-border-default bg-embed-background-primary"
    >
      <HeroImage />
      <div className="flex h-hero-content items-center justify-between gap-section px-section mobile:flex-col mobile:items-start">
        <HeroContent />
        <HeroCTA />
      </div>
      <SocialProof />
    </section>
  );
}
