import { useMemo, useState, type FormEvent } from 'react';

import { activateInvite, findInviteByToken } from '../pilot/inviteStore';
import { recordPlatformActivity } from '../pilot/pilotDiagnostics';
import { usePlatformSession } from './SessionProvider';

type InviteShellProps = {
  readonly initialToken?: string;
  readonly onCancel: () => void;
};

const NDA_SUMMARY =
  'Pilotní NDA — důvěrné informace CONIS a partnerského nasazení Embed Experience se nesmí sdílet mimo schválený tým. Souhlas je podmínkou vstupu do Studií.';

/**
 * EPIC-BX-15 / CS-01 — Invite activation: token → NDA → set password → enter Workspace.
 */
export function InviteShell({ initialToken = '', onCancel }: InviteShellProps) {
  const { login } = usePlatformSession();
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(
    () => (token.trim().length > 0 ? findInviteByToken(token.trim()) : null),
    [token],
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
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
        <p className="platform-access__eyebrow">CONIS Invite · CS-01</p>
        <h1 className="platform-access__title">Aktivace účtu</h1>
        <p className="platform-access__lead">
          NDA, souhlas a vlastní heslo — teprve poté vstup do Studií.
        </p>
        {preview !== null && (
          <p className="platform-access__lead">
            Pozvánka pro {preview.displayName} ({preview.email}) ·{' '}
            {preview.status}
          </p>
        )}
        <form className="platform-access__form" onSubmit={onSubmit}>
          <label className="platform-access__label">
            Invite token
            <input
              className="platform-access__input"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              required
            />
          </label>

          <fieldset
            className="platform-access__label"
            data-testid="nda-gateway"
            style={{ border: '1px solid #d0d5dd', borderRadius: 8, padding: 12 }}
          >
            <legend style={{ padding: '0 6px' }}>NDA Gateway</legend>
            <p className="platform-access__lead" style={{ marginTop: 0 }}>
              {NDA_SUMMARY}
            </p>
            <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={ndaAccepted}
                onChange={(event) => setNdaAccepted(event.target.checked)}
                data-testid="nda-accept"
              />
              <span>Souhlasím s NDA a podmínkami pilotního přístupu.</span>
            </label>
          </fieldset>

          <label className="platform-access__label">
            Nové heslo
            <input
              className="platform-access__input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={!ndaAccepted}
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
              disabled={!ndaAccepted}
            />
          </label>
          {error !== null && (
            <p className="platform-access__error" role="alert">
              {error}
            </p>
          )}
          <button
            className="platform-access__submit"
            type="submit"
            disabled={!ndaAccepted}
          >
            Aktivovat a vstoupit
          </button>
        </form>
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
