import {
  WELCOME_LEAD,
  WELCOME_PASSWORD_NOTE,
  WELCOME_PRIMARY_CTA_LABEL,
  WELCOME_SECONDARY_CTA_LABEL,
  WELCOME_TITLE,
} from '../pilot/welcomeExperience';

type PartnerWelcomeScreenProps = {
  readonly displayName: string;
  readonly firmName: string;
  readonly projectName: string;
  /** Primary — enter Pilot Offer / Commercial Journey. */
  readonly onSelectPilotProgram: () => void;
  /** Secondary — continue into CONIS Studio without purchase. */
  readonly onContinueToStudio: () => void;
};

/**
 * PT-CJ-01 — Welcome & Pilot Entry (Apple Easy).
 * One screen · one primary CTA · optional quiet Studio path.
 */
export function PartnerWelcomeScreen({
  displayName,
  firmName,
  projectName,
  onSelectPilotProgram,
  onContinueToStudio,
}: PartnerWelcomeScreenProps) {
  void displayName;
  void firmName;
  void projectName;

  return (
    <div className="platform-access" data-testid="partner-welcome">
      <div
        className="platform-access__panel platform-access__panel--welcome"
        data-testid="welcome-experience"
      >
        <h1
          className="platform-access__title"
          data-testid="welcome-title"
        >
          {WELCOME_TITLE}
        </h1>

        <p
          className="platform-access__lead"
          data-testid="welcome-lead"
        >
          {WELCOME_LEAD}
        </p>

        <p
          className="platform-access__hint"
          data-testid="welcome-password-note"
        >
          {WELCOME_PASSWORD_NOTE}
        </p>

        <button
          type="button"
          className="platform-access__submit"
          style={{ width: '100%', marginTop: 24 }}
          onClick={onSelectPilotProgram}
          data-testid="welcome-select-pilot-program"
        >
          {WELCOME_PRIMARY_CTA_LABEL}
        </button>

        <button
          type="button"
          className="platform-access__welcome-secondary"
          onClick={onContinueToStudio}
          data-testid="welcome-continue-studio"
        >
          {WELCOME_SECONDARY_CTA_LABEL}
        </button>
      </div>
    </div>
  );
}
