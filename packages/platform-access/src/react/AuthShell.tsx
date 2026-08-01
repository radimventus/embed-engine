import { useState, type FormEvent } from 'react';

import { DEMO_USERS } from '../registry/defaults';
import { usePlatformSession } from './SessionProvider';

/**
 * EPIC-BX-14 — Authentication Shell (Login / Remember me).
 * Extensible — no external IdP yet.
 */
export function AuthShell() {
  const { login } = usePlatformSession();
  const [email, setEmail] = useState('radim@conis.local');
  const [password, setPassword] = useState('demo');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = login({ email, password, rememberMe });
    if (!result.ok) {
      setError(result.error);
    }
  };

  return (
    <div className="platform-access" data-testid="auth-shell">
      <div className="platform-access__panel">
        <p className="platform-access__eyebrow">CONIS Platform</p>
        <h1 className="platform-access__title">Přihlášení</h1>
        <p className="platform-access__lead">
          Platform Access Layer — společná session pro Builder, Manager i Sales.
        </p>
        <form className="platform-access__form" onSubmit={onSubmit}>
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
      </div>
    </div>
  );
}
