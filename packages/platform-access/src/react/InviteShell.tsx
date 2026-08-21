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
  'Pilotní NDA — důvěrné informace CONIS a partnerského nasazení Embed Experience se nesmí sdílet mimo schválený tým. Souhlas je podmínkou vstupu do Studií.';

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
  const [preview, setPreview] = useState<PlatformAccessInvite | null>(null);
  const [isResolving, setIsResolving] = useState(initialToken.trim().length > 0);

  const inviteClient = useMemo(() => createPlatformAccessInviteClient(), []);
  const lifecycle = preview?.status ?? 'missing';

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

  const continueFromNda = () => {
    setError(null);
    if (!ndaAccepted) {
      setError('Bez souhlasu s NDA není aktivace účtu možná.');
      return;
    }
    setStep('password');
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (step === 'token') {
      await continueFromToken();
      return;
    }
    if (step === 'nda') {
      continueFromNda();
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
        <p className="platform-access__eyebrow">CONIS Invite · PE-04</p>
        <h1 className="platform-access__title">Aktivace partnerského účtu</h1>
        <p className="platform-access__lead">
          Pozvánka → NDA → první heslo → vstup do Partner Workspace.
        </p>
        <p className="platform-access__lead" data-testid="invite-step">
          Krok:{' '}
          {step === 'token'
            ? 'Pozvánka'
            : step === 'nda'
              ? 'NDA Gateway'
              : 'První heslo'}
        </p>
        {preview !== null && (
          <p className="platform-access__lead" data-testid="invite-status">
            {preview.displayName} ({preview.email}) · stav {lifecycle}
            {lifecycle === 'pending'
              ? ` · platná do ${new Date(preview.expiresAt).toLocaleString('cs-CZ')}`
              : ''}
          </p>
        )}
        <form
          className="platform-access__form"
          onSubmit={(event) => {
            void onSubmit(event);
          }}
        >
          {(step === 'token' || token.length > 0) && (
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
              <legend style={{ padding: '0 6px' }}>NDA Gateway</legend>
              <p className="platform-access__lead" style={{ marginTop: 0 }}>
                {NDA_SUMMARY}
              </p>
              <label
                style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}
              >
                <input
                  type="checkbox"
                  checked={ndaAccepted}
                  onChange={(event) => setNdaAccepted(event.target.checked)}
                  data-testid="nda-accept"
                />
                <span>Souhlasím s NDA a podmínkami pilotního přístupu.</span>
              </label>
            </fieldset>
          )}

          {step === 'password' && (
            <>
              <p className="platform-access__lead" data-testid="nda-confirmed">
                NDA přijato — nastavte první heslo.
              </p>
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
          >
            {step === 'token'
              ? 'Ověřit pozvánku'
              : step === 'nda'
                ? 'Pokračovat k heslu'
                : 'Aktivovat a vstoupit'}
          </button>
        </form>
        {step !== 'token' && (
          <button
            type="button"
            className="platform-access__logout"
            onClick={() => {
              setError(null);
              if (step === 'password') {
                setStep('nda');
                return;
              }
              setStep('token');
              setNdaAccepted(false);
            }}
          >
            Zpět
          </button>
        )}
        <button
          type="button"
          className="platform-access__logout"
          onClick={onCancel}
        >
          Zpět na přihlášení
        </button>
      </div>
    </div>
  );
}
