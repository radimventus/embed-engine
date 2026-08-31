import {
  WELCOME_LEAD,
  WELCOME_PASSWORD_NOTE,
  WELCOME_PRIMARY_CTA_LABEL,
  WELCOME_SECONDARY_CTA_LABEL,
  WELCOME_STUDIO_INTROS,
  WELCOME_TITLE,
} from '../pilot/welcomeExperience';

type PartnerWelcomeScreenProps = {
  readonly displayName: string;
  readonly firmName: string;
  readonly projectName: string;
  readonly onSelectPilotProgram: () => void;
  readonly onContinueToStudio: () => void;
};

const INTENSE_GOLD = '#f2b705';
const NAVY = '#071b33';

/**
 * TASK-81 — one-time START.
 * PRE-PILOT lifecycle surface, never a new Studio.
 */
export function PartnerWelcomeScreen({
  displayName,
  firmName,
  projectName,
  onSelectPilotProgram,
  onContinueToStudio,
}: PartnerWelcomeScreenProps) {
  return (
    <div className="platform-access" data-testid="partner-welcome">
      <div
        className="platform-access__panel platform-access__panel--welcome"
        data-testid="welcome-experience"
        style={{ maxWidth: 720 }}
      >
        <p className="platform-access__eyebrow">CONIS · START</p>

        <h1 className="platform-access__title" data-testid="welcome-title">
          {WELCOME_TITLE}
        </h1>

        <p className="platform-access__lead" data-testid="welcome-lead">
          {WELCOME_LEAD}
        </p>

        <p
          className="platform-access__hint"
          style={{ marginTop: 8 }}
          data-testid="welcome-partner-context"
        >
          {displayName} · {firmName} · {projectName}
        </p>

        <div
          data-testid="welcome-studio-intros"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 12,
            marginTop: 24,
            textAlign: 'left',
          }}
        >
          {WELCOME_STUDIO_INTROS.map((studio) => (
            <div
              key={studio.id}
              data-testid={`welcome-studio-${studio.id}`}
              style={{
                border: '1px solid rgba(7, 27, 51, 0.12)',
                borderRadius: 12,
                padding: 16,
                background: '#fff',
              }}
            >
              <strong
                style={{
                  display: 'block',
                  color: NAVY,
                  marginBottom: 8,
                }}
              >
                {studio.name}
              </strong>
              <span
                style={{
                  display: 'block',
                  fontSize: 13,
                  lineHeight: 1.45,
                }}
              >
                {studio.summary}
              </span>
            </div>
          ))}
        </div>

        <p
          className="platform-access__hint"
          data-testid="welcome-password-note"
          style={{ marginTop: 20 }}
        >
          {WELCOME_PASSWORD_NOTE}
        </p>

        <button
          type="button"
          className="platform-access__submit"
          style={{
            width: '100%',
            marginTop: 24,
            background: INTENSE_GOLD,
            borderColor: INTENSE_GOLD,
            color: NAVY,
            fontWeight: 700,
          }}
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
