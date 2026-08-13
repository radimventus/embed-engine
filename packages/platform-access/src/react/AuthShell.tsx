import { useState, type FormEvent } from 'react';

import { DEMO_USERS } from '../registry/defaults';
import {
  finishPasswordReset,
  startPasswordReset,
} from '../session/authService';
import { usePlatformSession } from './SessionProvider';

type AuthShellProps = {
  readonly onOpenInvite?: () => void;
};

type AuthMode = 'login' | 'reset-request' | 'reset-complete';

/**
 * EPIC-BX-14 / BX-15 / OF-07 — Authentication Shell (Login / Reset password).
 */
export function AuthShell({ onOpenInvite }: AuthShellProps) {
  const { login } = usePlatformSession();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('radim@conis.local');
  const [password, setPassword] = useState('demo');
  const [rememberMe, setRememberMe] = useState(true);
  const [resetToken, setResetToken] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const result = await login({ email, password, rememberMe });
    if (!result.ok) {
      setError(result.error);
    }
  };

  const onRequestReset = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const result = startPasswordReset(email);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setResetToken(result.token);
    setInfo(`Reset token (MVP e-mail): ${result.token}`);
    setMode('reset-complete');
  };

  const onCompleteReset = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const result = finishPasswordReset({
      token: resetToken.trim(),
      password,
      passwordConfirm: password2,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const synced = await login({
      email: result.email,
      password,
      rememberMe: true,
    });
    if (!synced.ok) {
      setError(synced.error);
    }
  };

  return (
    <div className="platform-access" data-testid="auth-shell">
      <div className="platform-access__panel">
        <p className="platform-access__eyebrow">CONIS Studio · conis.cz/studio</p>
        <h1 className="platform-access__title">
          {mode === 'login'
            ? 'Přihlášení'
            : mode === 'reset-request'
              ? 'Reset hesla'
              : 'Nové heslo'}
        </h1>
        <p className="platform-access__lead">
          Cloud Pilot Access — společná Identity & Access vrstva pro všechna
          Studia.
        </p>

        {mode === 'login' ? (
          <form
            className="platform-access__form"
            onSubmit={(event) => {
              void onLogin(event);
            }}
          >
            <label className="platform-access__label">
              E-mail
              <input
                className="platform-access__input"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="platform-access__label">
              Heslo
              <input
                className="platform-access__input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <label className="platform-access__remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              Zapamatovat přihlášení
            </label>
            {error !== null && (
              <p className="platform-access__error" role="alert">
                {error}
              </p>
            )}
            <button className="platform-access__submit" type="submit">
              Přihlásit
            </button>
          </form>
        ) : null}

        {mode === 'reset-request' ? (
          <form className="platform-access__form" onSubmit={onRequestReset}>
            <label className="platform-access__label">
              E-mail účtu
              <input
                className="platform-access__input"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            {error !== null && (
              <p className="platform-access__error" role="alert">
                {error}
              </p>
            )}
            <button className="platform-access__submit" type="submit">
              Poslat reset
            </button>
          </form>
        ) : null}

        {mode === 'reset-complete' ? (
          <form
            className="platform-access__form"
            onSubmit={(event) => {
              void onCompleteReset(event);
            }}
          >
            {info !== null ? (
              <p className="platform-access__lead">{info}</p>
            ) : null}
            <label className="platform-access__label">
              Reset token
              <input
                className="platform-access__input"
                value={resetToken}
                onChange={(event) => setResetToken(event.target.value)}
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
              Nastavit heslo a přihlásit
            </button>
          </form>
        ) : null}

        {mode === 'login' ? (
          <button
            type="button"
            className="platform-access__logout"
            onClick={() => {
              setError(null);
              setInfo(null);
              setMode('reset-request');
            }}
          >
            Zapomenuté heslo
          </button>
        ) : (
          <button
            type="button"
            className="platform-access__logout"
            onClick={() => {
              setError(null);
              setInfo(null);
              setMode('login');
            }}
          >
            Zpět na přihlášení
          </button>
        )}

        {onOpenInvite !== undefined && mode === 'login' && (
          <button
            type="button"
            className="platform-access__logout"
            onClick={onOpenInvite}
          >
            Mám pozvánku — aktivovat účet
          </button>
        )}
        {mode === 'login' ? (
          <div className="platform-access__demos">
            <p className="platform-access__demos-title">Pilot účty</p>
            <ul>
              {DEMO_USERS.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    className="platform-access__demo"
                    onClick={() => {
                      setEmail(user.email);
                      setPassword(user.password);
                    }}
                  >
                    {user.displayName} · {user.email}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
