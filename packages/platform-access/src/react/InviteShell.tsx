import { useEffect, useMemo, useState, type FormEvent } from 'react';

import {
  createPlatformAccessAuthClient,
  createPlatformAccessInviteClient,
  type PlatformAccessInvite,
} from '../api/platformAccessClient';
import { inviteLifecycleMessage } from '../pilot/invitationWorkflow';
import { prepareWelcomeJourney } from '../pilot/welcomeStore';
import { usePlatformSession } from './SessionProvider';

type InviteShellProps = {
  readonly initialToken?: string;
  readonly onCancel: () => void;
  readonly onActivated?: () => void;
};

type InviteStep = 'token' | 'nda' | 'password';

const NDA_SUMMARY =
  'Informace a podklady zpřístupněné v rámci pilotního programu CONIS jsou důvěrné a jsou určeny pouze pro Vaši společnost a zapojený tým.';

/**
 * PE-04 — Invitation → NDA Gateway → First Password → Account Activation.
 */
export function InviteShell({
  initialToken = '',
  onCancel,
  onActivated,
}: InviteShellProps) {
  const { acceptAuthenticatedSession } = usePlatformSession();
  const [token, setToken] = useState(initialToken);
  const [step, setStep] = useState<InviteStep>(
    initialToken.trim().length > 0 ? 'nda' : 'token',
  );
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setPreview] = useState<PlatformAccessInvite | null>(null);
  const [isResolving, setIsResolving] = useState(initialToken.trim().length > 0);

  const inviteClient = useMemo(() => createPlatformAccessInviteClient(), []);

  useEffect(() => {
    const trimmed = token.trim();
    if (trimmed.length === 0) {
      setPreview(null);
      setIsResolving(false);
      return;
    }
    let active = true;
    setIsResolving(true);
    void inviteClient
      .resolveInvite(trimmed)
      .then((invite) => {
        if (active) setPreview(invite);
      })
      .catch(() => {
        if (active) setPreview(null);
      })
      .finally(() => {
        if (active) setIsResolving(false);
      });
    return () => {
      active = false;
    };
  }, [inviteClient, token]);

  const continueFromToken = async () => {
    setError(null);
    try {
      const invite = await inviteClient.resolveInvite(token.trim());
      if (invite?.status !== 'pending') {
        setError(inviteLifecycleMessage(invite?.status ?? 'missing'));
        return;
      }
      setPreview(invite);
      setStep('nda');
    } catch {
      setError('Pozvánku se nepodařilo ověřit. Zkontrolujte Platform API.');
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (step === 'token') {
      await continueFromToken();
      return;
    }
    if (!ndaAccepted) {
      setError('Bez souhlasu s NDA není aktivace účtu možná.');
      return;
    }
    if (password !== password2) {
      setError('Hesla se neshodují.');
      return;
    }
    let result;
    try {
      result = await createPlatformAccessAuthClient().activateInvite({
        token: token.trim(),
        password,
        rememberMe: true,
      });
    } catch {
      setError('Aktivaci se nepodařilo dokončit. Zkontrolujte Platform API.');
      return;
    }
    if (!result.ok) {
      setError(result.error);
      return;
    }
    prepareWelcomeJourney(result.session.user.email);
    acceptAuthenticatedSession(result.session);
    onActivated?.();
  };

  return (
    <div className="platform-access" data-testid="invite-shell">
      <div className="platform-access__panel">
        <h1 className="platform-access__title">Aktivace partnerského účtu</h1>
        <form
          className="platform-access__form"
          onSubmit={(event) => {
            void onSubmit(event);
          }}
        >
          {step === 'token' && (
            <label className="platform-access__label">
              Invite token
              <input
                className="platform-access__input"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                required
                disabled={step !== 'token'}
                data-testid="invite-token"
              />
            </label>
          )}

          {step === 'nda' && (
            <fieldset
              className="platform-access__label"
              data-testid="nda-gateway"
              style={{
                border: '1px solid #d0d5dd',
                borderRadius: 8,
                padding: 12,
              }}
            >
              <legend style={{ padding: '0 6px' }}>
                Důvěrnost a podmínky pilotního přístupu
              </legend>
              <p className="platform-access__lead" style={{ marginTop: 0 }}>
                {NDA_SUMMARY}
              </p>
              {!ndaAccepted && (
                <div
                  data-testid="nda-consent-comment"
                  style={{
                    marginTop: 10,
                    marginBottom: 12,
                    padding: '10px 12px',
                    border: '1px solid rgba(7, 27, 51, 0.18)',
                    borderRadius: 8,
                    background: '#f7f8fa',
                    color: '#071b33',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      lineHeight: 1.4,
                      fontWeight: 600,
                    }}
                  >
                    Souhlasím s podmínkami pilotního přístupu a zachováním
                    důvěrnosti.
                  </span>

                  <button
                    type="button"
                    onClick={() => setNdaAccepted(true)}
                    data-testid="nda-consent-button"
                    style={{
                      flex: '0 0 auto',
                      padding: '7px 13px',
                      borderRadius: 999,
                      border: '1px solid #071b33',
                      background: '#071b33',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Souhlasím
                  </button>
                </div>
              )}

              <label
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  color: '#071b33',
                }}
              >
                <input
                  type="checkbox"
                  checked={ndaAccepted}
                  onChange={(event) => setNdaAccepted(event.target.checked)}
                  data-testid="nda-accept"
                  aria-label="Souhlas s podmínkami pilotního přístupu a zachováním důvěrnosti"
                />
                <span>
                  {ndaAccepted ? 'Souhlas potvrzen.' : 'Souhlas'}
                </span>
              </label>
            </fieldset>
          )}

          {(step === 'nda' || step === 'password') && (
            <>
              <label className="platform-access__label">
                Nové heslo
                <input
                  className="platform-access__input"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  data-testid="invite-password"
                />
              </label>
              <label className="platform-access__label">
                Potvrzení hesla
                <input
                  className="platform-access__input"
                  type="password"
                  value={password2}
                  onChange={(event) => setPassword2(event.target.value)}
                  required
                  data-testid="invite-password-confirm"
                />
              </label>
            </>
          )}

          {error !== null && (
            <p className="platform-access__error" role="alert">
              {error}
            </p>
          )}
          <button
            className="platform-access__submit"
            type="submit"
            disabled={isResolving || (step === 'nda' && !ndaAccepted)}
            data-testid="invite-continue"
            style={{
              background: '#d1a55f',
              borderColor: '#d1a55f',
              color: '#ffffff',
            }}
          >
            {step === 'token'
              ? 'Ověřit pozvánku'
              : 'Aktivovat a vstoupit'}
          </button>
        </form>
        {step === 'token' && (
          <button
            type="button"
            className="platform-access__logout"
            onClick={onCancel}
          >
            Zpět na přihlášení
          </button>
        )}
      </div>
    </div>
  );
}
