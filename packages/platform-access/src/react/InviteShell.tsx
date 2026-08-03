import { useEffect, useMemo, useState, type FormEvent } from 'react';

import {
  activateInvite,
  findInviteByToken,
  markInviteOpened,
} from '../pilot/inviteStore';
import {
  inviteLifecycleMessage,
  resolveInviteLifecycle,
} from '../pilot/invitationWorkflow';
import { recordPlatformActivity } from '../pilot/pilotDiagnostics';
import { usePlatformSession } from './SessionProvider';

type InviteShellProps = {
  readonly initialToken?: string;
  readonly onCancel: () => void;
};

type InviteStep = 'token' | 'nda' | 'password';

const NDA_SUMMARY =
  'Pilotní NDA — důvěrné informace CONIS a partnerského nasazení Embed Experience se nesmí sdílet mimo schválený tým. Souhlas je podmínkou vstupu do Studií.';

/**
 * PE-04 — Invitation → NDA Gateway → First Password → Account Activation.
 */
export function InviteShell({ initialToken = '', onCancel }: InviteShellProps) {
  const { login } = usePlatformSession();
  const [token, setToken] = useState(initialToken);
  const [step, setStep] = useState<InviteStep>(
    initialToken.trim().length > 0 ? 'nda' : 'token',
  );
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(
    () => (token.trim().length > 0 ? findInviteByToken(token.trim()) : null),
    [token],
  );
  const lifecycle = resolveInviteLifecycle(preview);

  useEffect(() => {
    const trimmed = token.trim();
    if (trimmed.length === 0) return;
    if (findInviteByToken(trimmed) === null) return;
    markInviteOpened(trimmed);
  }, [token]);

  const continueFromToken = () => {
    setError(null);
    const invite = findInviteByToken(token.trim());
    const state = resolveInviteLifecycle(invite);
    if (state !== 'pending') {
      setError(inviteLifecycleMessage(state));
      return;
    }
    setStep('nda');
  };

  const continueFromNda = () => {
    setError(null);
    if (!ndaAccepted) {
      setError('Bez souhlasu s NDA není aktivace účtu možná.');
      return;
    }
    setStep('password');
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (step === 'token') {
      continueFromToken();
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
    const result = activateInvite({
      token: token.trim(),
      password,
      ndaAccepted: true,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    recordPlatformActivity({
      label: 'Aktivace pozvánky',
      detail: result.user.email,
    });
    const loggedIn = login({
      email: result.user.email,
      password,
      rememberMe: true,
    });
    if (!loggedIn.ok) {
      setError(loggedIn.error);
    }
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
        <form className="platform-access__form" onSubmit={onSubmit}>
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
            disabled={step === 'nda' && !ndaAccepted}
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
