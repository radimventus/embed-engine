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

const INTENSE_GOLD = '#d1a55f';
const NAVY = '#071b33';

/**
 * TASK-81 — one-time START.
 * PRE-PILOT lifecycle surface, never a new Studio.
 */
export function PartnerWelcomeScreen({
  displayName: _displayName,
  firmName: _firmName,
  projectName: _projectName,
  onSelectPilotProgram,
  onContinueToStudio,
}: PartnerWelcomeScreenProps) {
  return (
    <div className="platform-access" data-testid="partner-welcome">
      <div
        data-testid="welcome-experience"
        style={{
          width: '100%',
          maxWidth: 920,
          margin: '0 auto',
          padding: '28px 24px 48px',
          boxSizing: 'border-box',
        }}
      >
        <div
          aria-label="CONIS"
          style={{
            textAlign: 'center',
            color: NAVY,
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: '0.32em',
            marginBottom: 22,
          }}
        >
          CONIS
        </div>

        <div
          data-testid="welcome-studio-intros"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 10,
            marginBottom: 56,
          }}
        >
          {WELCOME_STUDIO_INTROS.map((studio) => (
            <div
              key={studio.id}
              data-testid={`welcome-studio-${studio.id}`}
              style={{
                border: `1px solid ${NAVY}`,
                borderRadius: 10,
                padding: '14px 16px',
                background: '#ffffff',
                textAlign: 'left',
              }}
            >
              <strong
                style={{
                  display: 'block',
                  color: NAVY,
                  marginBottom: 5,
                  fontSize: 13,
                  textTransform: 'uppercase',
                }}
              >
                {studio.name}
              </strong>
              <span
                style={{
                  display: 'block',
                  color: NAVY,
                  fontSize: 13,
                  lineHeight: 1.35,
                }}
              >
                {studio.summary}
              </span>
            </div>
          ))}
        </div>

        <div
          className="platform-access__panel platform-access__panel--welcome"
          style={{
            maxWidth: 500,
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <h1 className="platform-access__title" data-testid="welcome-title">
            {WELCOME_TITLE}
          </h1>

          <p className="platform-access__lead" data-testid="welcome-lead">
            {WELCOME_LEAD}
          </p>

          <p
            className="platform-access__hint"
            data-testid="welcome-password-note"
            style={{ marginTop: 12 }}
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
              color: '#ffffff',
              fontWeight: 700,
              borderRadius: 999,
              minHeight: 52,
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
            style={{
              marginTop: 16,
              color: '#68768a',
              textDecoration: 'underline',
            }}
          >
            {WELCOME_SECONDARY_CTA_LABEL}
          </button>
        </div>
      </div>
    </div>
  );
}
