import { HeroContent } from './HeroContent';
import { HeroCTA } from './HeroCTA';
import { HeroImage } from './HeroImage';
import { SocialProof } from './SocialProof';

export function Hero() {
  return (
    <>
      <HeroImage />
      <section className="border-b border-embed-border-default px-4 py-6 md:px-8 md:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <HeroContent />
          <HeroCTA />
        </div>
      </section>
      <SocialProof />
    </>
  );
}
