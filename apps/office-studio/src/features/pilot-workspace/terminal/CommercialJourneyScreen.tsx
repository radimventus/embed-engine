import type { PilotWorkspaceCase } from '../../../office/pilotWorkspaceModel';
import type { CommercialJourneyStepId } from '../../../office/commercialJourneyModel';

type CommercialJourneyScreenProps = {
  readonly stepId: CommercialJourneyStepId;
  readonly activeCase: PilotWorkspaceCase | null;
};

/**
 * PT-CJ-OS-01 — Production Commercial Journey screens (partner-facing preview).
 * Display only — no business logic · no forms that mutate state.
 */
export function CommercialJourneyScreen({
  stepId,
  activeCase,
}: CommercialJourneyScreenProps) {
  if (activeCase === null) {
    return (
      <div
        className="office-cj-screen"
        data-testid="commercial-journey-screen"
        data-cj-step="none"
      >
        <p className="office-pilot-ws__panel-body">Vyberte projekt.</p>
      </div>
    );
  }

  switch (stepId) {
    case 'welcome':
      return <WelcomeScreen partnerName={activeCase.partnerName} />;
    case 'pilot_program':
      return <PilotProgramScreen activeCase={activeCase} />;
    case 'order_confirmation':
      return <OrderConfirmationScreen activeCase={activeCase} />;
    case 'payment':
      return <PaymentScreen activeCase={activeCase} />;
    case 'pilot_confirmed':
      return <PilotConfirmedScreen activeCase={activeCase} />;
    case 'office_handoff':
      return <OfficeHandoffScreen activeCase={activeCase} />;
    default: {
      const _exhaustive: never = stepId;
      return _exhaustive;
    }
  }
}

function WelcomeScreen({ partnerName }: { readonly partnerName: string }) {
  return (
    <div
      className="office-cj-screen office-cj-screen--welcome"
      data-testid="commercial-journey-screen"
      data-cj-step="welcome"
    >
      <p className="office-cj-screen__eyebrow">CONIS Studio · {partnerName}</p>
      <h2 className="office-cj-screen__title" data-testid="cj-welcome-title">
        Vítejte ve svém CONIS Studio
      </h2>
      <p className="office-cj-screen__lead" data-testid="cj-welcome-lead">
        Vše je připravené.
        <br />
        Zbývá už jen vybrat pilotní program.
      </p>
      <button
        type="button"
        className="office-cj-screen__cta"
        data-testid="cj-welcome-cta"
        disabled
        title="Náhled produkční obrazovky — bez obchodní akce"
      >
        Vybrat pilotní program
      </button>
    </div>
  );
}

function PilotProgramScreen({
  activeCase,
}: {
  readonly activeCase: PilotWorkspaceCase;
}) {
  return (
    <div
      className="office-cj-screen"
      data-testid="commercial-journey-screen"
      data-cj-step="pilot_program"
    >
      <p className="office-cj-screen__eyebrow">Pilot Program</p>
      <h2 className="office-cj-screen__title">Vyberte pilotní program</h2>
      <p className="office-cj-screen__lead">
        Obsah nabídky pro {activeCase.partnerName} — stejný jako v PDF.
      </p>
      <ul className="office-cj-packages" data-testid="cj-pilot-packages">
        <PackageCard
          name="Pilot"
          price="4 970 Kč"
          detail="1 dům · 90 dní"
          recommended={false}
        />
        <PackageCard
          name="Starter"
          price="14 970 Kč"
          detail="až 3 domy · 90 dní"
          recommended={activeCase.packageName === 'Starter'}
        />
        <PackageCard
          name="Studio Partner"
          price="29 970 Kč"
          detail="Neomezeně · 90 dní"
          recommended={false}
        />
      </ul>
      <p className="office-cj-screen__meta">
        Projekt · {activeCase.label} · {activeCase.companyName}
      </p>
    </div>
  );
}

function PackageCard({
  name,
  price,
  detail,
  recommended,
}: {
  readonly name: string;
  readonly price: string;
  readonly detail: string;
  readonly recommended: boolean;
}) {
  return (
    <li
      className={
        recommended
          ? 'office-cj-package office-cj-package--recommended'
          : 'office-cj-package'
      }
    >
      <strong>{name}</strong>
      <span>{price}</span>
      <span>{detail}</span>
    </li>
  );
}

function OrderConfirmationScreen({
  activeCase,
}: {
  readonly activeCase: PilotWorkspaceCase;
}) {
  return (
    <div
      className="office-cj-screen"
      data-testid="commercial-journey-screen"
      data-cj-step="order_confirmation"
    >
      <p className="office-cj-screen__eyebrow">Order Confirmation</p>
      <h2 className="office-cj-screen__title">Potvrzení objednávky</h2>
      <p className="office-cj-screen__lead">
        Zkontrolujte údaje před platbou.
      </p>
      <dl className="office-cj-summary" data-testid="cj-order-summary">
        <div>
          <dt>Partner</dt>
          <dd>{activeCase.partnerName}</dd>
        </div>
        <div>
          <dt>Společnost</dt>
          <dd>{activeCase.companyName}</dd>
        </div>
        <div>
          <dt>Balíček</dt>
          <dd>{activeCase.packageName}</dd>
        </div>
        <div>
          <dt>Licence</dt>
          <dd>{activeCase.licenseLabel}</dd>
        </div>
      </dl>
      <button
        type="button"
        className="office-cj-screen__cta"
        disabled
        title="Náhled — bez obchodní akce"
      >
        Potvrdit objednávku
      </button>
    </div>
  );
}

function PaymentScreen({
  activeCase,
}: {
  readonly activeCase: PilotWorkspaceCase;
}) {
  return (
    <div
      className="office-cj-screen"
      data-testid="commercial-journey-screen"
      data-cj-step="payment"
    >
      <p className="office-cj-screen__eyebrow">Payment</p>
      <h2 className="office-cj-screen__title">Platba</h2>
      <p className="office-cj-screen__lead">
        Úhrada pilotního programu pro {activeCase.companyName}.
      </p>
      <div className="office-cj-payment-card" data-testid="cj-payment-card">
        <p>Proforma · {activeCase.packageName}</p>
        <p className="office-cj-screen__meta">
          Náhled platební obrazovky partnera — bez QR a bez SMTP.
        </p>
      </div>
      <button
        type="button"
        className="office-cj-screen__cta"
        disabled
        title="Náhled — bez obchodní akce"
      >
        Pokračovat k platbě
      </button>
    </div>
  );
}

function PilotConfirmedScreen({
  activeCase,
}: {
  readonly activeCase: PilotWorkspaceCase;
}) {
  return (
    <div
      className="office-cj-screen"
      data-testid="commercial-journey-screen"
      data-cj-step="pilot_confirmed"
    >
      <p className="office-cj-screen__eyebrow">Pilot Confirmed</p>
      <h2 className="office-cj-screen__title">Pilot je potvrzen</h2>
      <p className="office-cj-screen__lead">
        {activeCase.partnerName} — prostředí je připravené k předání.
      </p>
      <p className="office-cj-screen__meta">{activeCase.partnerEnvironment.label}</p>
    </div>
  );
}

function OfficeHandoffScreen({
  activeCase,
}: {
  readonly activeCase: PilotWorkspaceCase;
}) {
  return (
    <div
      className="office-cj-screen"
      data-testid="commercial-journey-screen"
      data-cj-step="office_handoff"
    >
      <p className="office-cj-screen__eyebrow">Office Handoff</p>
      <h2 className="office-cj-screen__title">Předání do Office</h2>
      <p className="office-cj-screen__lead">
        Obchodní cesta je dokončena. Partner {activeCase.partnerName} pokračuje
        v provozu CONIS Studio.
      </p>
      <p className="office-cj-screen__meta">
        Náhled produkčního kroku — bez handoff logiky.
      </p>
    </div>
  );
}
