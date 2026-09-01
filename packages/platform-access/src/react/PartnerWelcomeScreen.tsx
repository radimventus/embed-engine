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
  readonly onSelectStudio: (
    studioId: 'client' | 'sales' | 'manager',
  ) => void;
  readonly onContinueToStudio: () => void;
};

const NAVY = '#071b33';
const LIGHT_GOLD = '#d1a55f';
const MUTED = '#718096';

/**
 * TASK-81 — one-time START.
 * PRE-PILOT lifecycle surface, never a new Studio.
 */
export function PartnerWelcomeScreen({
  displayName: _displayName,
  firmName: _firmName,
  projectName: _projectName,
  onSelectPilotProgram,
  onSelectStudio,
  onContinueToStudio,
}: PartnerWelcomeScreenProps) {
  return (
    <div
      className="platform-access"
      data-testid="partner-welcome"
      style={{
        display: 'block',
        minHeight: 'calc(100vh - 98px)',
        boxSizing: 'border-box',
        padding: 0,
        background: '#f7f7f6',
      }}
    >
      <div
        data-testid="welcome-experience"
        style={{
          width: '100%',
          maxWidth: 960,
          boxSizing: 'border-box',
          margin: '0 auto',
          padding: '22px 24px 44px',
        }}
      >
        <div
          aria-label="CONIS"
          style={{
            textAlign: 'center',
            color: NAVY,
            fontWeight: 800,
            fontSize: 21,
            lineHeight: 1,
            letterSpacing: '0.32em',
            marginBottom: 14,
          }}
        >
          CONIS
        </div>

        <div
          data-testid="welcome-studio-intros"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 16,
            margin: 0,
          }}
        >
          {WELCOME_STUDIO_INTROS.map((studio) => (
            <button
              key={studio.id}
              type="button"
              data-testid={`welcome-studio-${studio.id}`}
              data-start-studio={studio.id}
              onClick={() => onSelectStudio(studio.id)}
              style={{
                minHeight: 78,
                boxSizing: 'border-box',
                border: `1px solid ${NAVY}`,
                borderRadius: 10,
                padding: '13px 16px',
                background: '#F7F6F4',
                textAlign: 'left',
                color: NAVY,
                cursor: 'pointer',
                font: 'inherit',
              }}
            >
              <strong
                style={{
                  display: 'block',
                  marginBottom: 5,
                  color: NAVY,
                  fontSize: 12,
                  lineHeight: 1.2,
                  textTransform: 'uppercase',
                }}
              >
                {studio.name}
              </strong>

              <span
                style={{
                  display: 'block',
                  color: NAVY,
                  fontSize: 12,
                  lineHeight: 1.35,
                }}
              >
                {studio.summary}
              </span>
            </button>
          ))}
        </div>

        <div
          className="platform-access__panel platform-access__panel--welcome"
          data-partner-welcome-card
          style={{
            width: '100%',
            maxWidth: 500,
            boxSizing: 'border-box',
            margin: '44px auto 0',
            padding: '32px 34px 28px',
            textAlign: 'center',
            background: '#fff',
          }}
        >
          <h1
            className="platform-access__title"
            data-testid="welcome-title"
            style={{
              margin: 0,
              color: NAVY,
              fontSize: 29,
              lineHeight: 1.08,
            }}
          >
            {WELCOME_TITLE}
          </h1>

          <p
            className="platform-access__lead"
            data-testid="welcome-lead"
            style={{
              marginTop: 14,
              color: MUTED,
            }}
          >
            {WELCOME_LEAD}
          </p>

          <p
            className="platform-access__hint"
            data-testid="welcome-password-note"
            style={{
              marginTop: 10,
              color: MUTED,
            }}
          >
            {WELCOME_PASSWORD_NOTE}
          </p>

          <button
            type="button"
            className="platform-access__submit"
            style={{
              width: '100%',
              minHeight: 54,
              marginTop: 24,
              borderRadius: 999,
              border: `1px solid ${LIGHT_GOLD}`,
              background: LIGHT_GOLD,
              color: '#fff',
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
            style={{
              marginTop: 16,
              color: MUTED,
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
