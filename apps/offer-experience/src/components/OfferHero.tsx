type OfferHeroProps = {
  readonly partnerName: string;
  readonly greeting: string;
  readonly intro: string;
  readonly heroImageUrl: string;
};

/**
 * CAP-CE-01 — Offer hero (CONIS nabídka pilot visual language).
 */
export function OfferHero({
  partnerName,
  greeting,
  intro,
  heroImageUrl,
}: OfferHeroProps) {
  return (
    <header className="offer-hero" data-testid="offer-hero">
      <div className="offer-hero__copy">
        <p className="offer-logo" aria-label="CONIS">
          CON<span className="offer-logo__accent">I</span>S
        </p>
        <p className="offer-hero__partner" data-testid="offer-partner-name">
          {partnerName}
        </p>
        <h1 className="offer-hero__greeting">{greeting}</h1>
        <p className="offer-hero__intro">{intro}</p>
        <p className="offer-hero__cue">
          CONIS pomáhá uzavřít obchod — ne začínat prodej znovu.
        </p>
      </div>
      <div className="offer-hero__media">
        <img
          src={heroImageUrl}
          alt=""
          className="offer-hero__image"
          data-testid="offer-hero-image"
        />
      </div>
    </header>
  );
}
