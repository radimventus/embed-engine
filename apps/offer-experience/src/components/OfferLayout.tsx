import type { ReactNode } from 'react';

type OfferLayoutProps = {
  readonly children: ReactNode;
};

/**
 * CAP-CE-01 — Public Offer layout.
 * No Office Shell · no left menu · no Workspace.
 */
export function OfferLayout({ children }: OfferLayoutProps) {
  return (
    <div className="offer-shell" data-testid="offer-shell" data-offer-layout="">
      <div className="offer-shell__watermark" aria-hidden="true" />
      <div className="offer-shell__canvas">{children}</div>
    </div>
  );
}
