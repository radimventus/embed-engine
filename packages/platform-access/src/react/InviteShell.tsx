import { useMemo, useState, type FormEvent } from 'react';

import { activateInvite, findInviteByToken } from '../pilot/inviteStore';
import { recordPlatformActivity } from '../pilot/pilotDiagnostics';
import { usePlatformSession } from './SessionProvider';

type InviteShellProps = {
  readonly initialToken?: string;
  readonly onCancel: () => void;
};

/**
 * EPIC-BX-15 — Invite activation: token → set password → enter Workspace.
 */
export function InviteShell({ initialToken = '', onCancel }: InviteShellProps) {
  const { login } = usePlatformSession();
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(
    () => (token.trim().length > 0 ? findInviteByToken(token.trim()) : null),
    [token],
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (password !== password2) {
      setError('Hesla se neshodují.');
      return;
    }
    const result = activateInvite({ token: token.trim(), password });
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
        <p className="platform-access__eyebrow">CONIS Invite</p>
        <h1 className="platform-access__title">Aktivace účtu</h1>
        <p className="platform-access__lead">
          Zadejte token z pozvánky a nastavte heslo pro vstup do Workspace.
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
          <label className="platform-access__label">
            Nové heslo
            <input
              className="platform-access__input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
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
            />
          </label>
          {error !== null && (
            <p className="platform-access__error" role="alert">
              {error}
            </p>
          )}
          <button className="platform-access__submit" type="submit">
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
