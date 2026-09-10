import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';

import { createPlatformAccessAuthClient } from '../api/platformAccessClient';
import { DEMO_USERS } from '../registry/defaults';
import { usePlatformSession } from './SessionProvider';

type AuthShellProps = {
  readonly onOpenInvite?: () => void;
  readonly initialResetToken?: string;
  readonly onPasswordResetFinished?: () => void;
};

type AuthMode = 'login' | 'reset-request' | 'reset-complete';
type ResetLinkState = 'idle' | 'checking' | 'valid' | 'invalid';

/**
 * Shared authentication shell.
 * Password recovery is authoritative in Platform API; no token or password is
 * generated, displayed or persisted by the browser.
 */
export function AuthShell({
  onOpenInvite,
  initialResetToken = '',
  onPasswordResetFinished,
}: AuthShellProps) {
  const { login } = usePlatformSession();
  const authClient = useMemo(
    () => createPlatformAccessAuthClient(),
    [],
  );
  const initialToken = initialResetToken.trim();

  const [mode, setMode] = useState<AuthMode>(
    initialToken.length > 0 ? 'reset-complete' : 'login',
  );
  const [email, setEmail] = useState('radim@conis.local');
  const [password, setPassword] = useState(
    initialToken.length > 0 ? '' : 'demo',
  );
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [resetLinkState, setResetLinkState] =
    useState<ResetLinkState>(
      initialToken.length > 0 ? 'checking' : 'idle',
    );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (initialToken.length === 0) return;

    let active = true;
    setResetLinkState('checking');
    setError(null);

    void authClient
      .inspectPasswordReset(initialToken)
      .then((result) => {
        if (!active) return;

        if (result.ok) {
          setResetLinkState('valid');
        } else {
          setResetLinkState('invalid');
          setError(result.error);
        }
      })
      .catch(() => {
        if (!active) return;

        setResetLinkState('invalid');
        setError(
          'Platnost odkazu se nepodařilo ověřit. Zkuste to prosím znovu.',
        );
      });

    return () => {
      active = false;
    };
  }, [authClient, initialToken]);

  const returnToLogin = () => {
    setMode('login');
    setError(null);
    setInfo(null);
    setPassword('');
    setPasswordConfirm('');
    onPasswordResetFinished?.();
  };

  const requestNewLink = () => {
    setMode('reset-request');
    setError(null);
    setInfo(null);
    onPasswordResetFinished?.();
  };

  const onLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await login({
        email,
        password,
        rememberMe,
      });

      if (!result.ok) setError(result.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRequestReset = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      const result = await authClient.requestPasswordReset(email);

      if (result.ok) {
        setInfo(result.message);
      } else {
        setError(result.error);
      }
    } catch {
      setError(
        'Žádost o změnu hesla se nepodařilo spojit s Platform API.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCompleteReset = async (event: FormEvent) => {
    event.preventDefault();

    if (
      isSubmitting ||
      resetLinkState !== 'valid' ||
      initialToken.length === 0
    ) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      const result = await authClient.completePasswordReset({
        token: initialToken,
        password,
        passwordConfirm,
      });

      if (!result.ok) {
        setError(result.error);

        if (result.code === 'PASSWORD_RESET_LINK_INVALID') {
          setResetLinkState('invalid');
        }

        return;
      }

      setMode('login');
      setPassword('');
      setPasswordConfirm('');
      setInfo('Heslo bylo změněno. Přihlaste se novým heslem.');
      onPasswordResetFinished?.();
    } catch {
      setError(
        'Nové heslo se nepodařilo spojit s Platform API.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="platform-access" data-testid="auth-shell">
      <div className="platform-access__panel">
        <p className="platform-access__eyebrow">
          CONIS Studio · conis.cz/studio
        </p>

        <h1 className="platform-access__title">
          {mode === 'login'
            ? 'Přihlášení'
            : mode === 'reset-request'
              ? 'Zapomenuté heslo'
              : 'Nové heslo'}
        </h1>

        <p className="platform-access__lead">
          Cloud Pilot Access — společná Identity & Access vrstva pro
          všechna Studia.
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
                required
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
                required
              />
            </label>

            <label className="platform-access__remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
              />
              Zapamatovat přihlášení
            </label>

            {info !== null ? (
              <p className="platform-access__lead" role="status">
                {info}
              </p>
            ) : null}

            {error !== null ? (
              <p className="platform-access__error" role="alert">
                {error}
              </p>
            ) : null}

            <button
              className="platform-access__submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Přihlašuji…' : 'Přihlásit'}
            </button>
          </form>
        ) : null}

        {mode === 'reset-request' ? (
          <form
            className="platform-access__form"
            onSubmit={(event) => {
              void onRequestReset(event);
            }}
          >
            <label className="platform-access__label">
              E-mail účtu
              <input
                className="platform-access__input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <p className="platform-access__lead">
              Pokud pro e-mail existuje aktivovaný partnerský účet,
              pošleme na něj jednorázový odkaz platný 60 minut.
            </p>

            {info !== null ? (
              <p className="platform-access__lead" role="status">
                {info}
              </p>
            ) : null}

            {error !== null ? (
              <p className="platform-access__error" role="alert">
                {error}
              </p>
            ) : null}

            <button
              className="platform-access__submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Odesílám…'
                : 'Poslat odkaz pro změnu hesla'}
            </button>
          </form>
        ) : null}

        {mode === 'reset-complete' ? (
          resetLinkState === 'checking' ? (
            <p className="platform-access__lead" role="status">
              Ověřuji odkaz pro změnu hesla…
            </p>
          ) : resetLinkState === 'invalid' ? (
            <>
              <p className="platform-access__error" role="alert">
                {error ??
                  'Odkaz není platný nebo jeho platnost vypršela.'}
              </p>

              <button
                className="platform-access__submit"
                type="button"
                onClick={requestNewLink}
              >
                Požádat o nový odkaz
              </button>
            </>
          ) : (
            <form
              className="platform-access__form"
              onSubmit={(event) => {
                void onCompleteReset(event);
              }}
            >
              <label className="platform-access__label">
                Nové heslo
                <input
                  className="platform-access__input"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  minLength={8}
                  required
                />
              </label>

              <label className="platform-access__label">
                Potvrzení hesla
                <input
                  className="platform-access__input"
                  type="password"
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(event) =>
                    setPasswordConfirm(event.target.value)
                  }
                  minLength={8}
                  required
                />
              </label>

              {error !== null ? (
                <p className="platform-access__error" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                className="platform-access__submit"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Ukládám nové heslo…'
                  : 'Nastavit nové heslo'}
              </button>
            </form>
          )
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
        ) : mode === 'reset-request' ? (
          <button
            type="button"
            className="platform-access__logout"
            onClick={returnToLogin}
          >
            Zpět na přihlášení
          </button>
        ) : resetLinkState === 'valid' ? (
          <button
            type="button"
            className="platform-access__logout"
            onClick={returnToLogin}
          >
            Zrušit a přejít na přihlášení
          </button>
        ) : null}

        {onOpenInvite !== undefined && mode === 'login' ? (
          <button
            type="button"
            className="platform-access__logout"
            onClick={onOpenInvite}
          >
            Mám pozvánku — aktivovat účet
          </button>
        ) : null}

        {mode === 'login' ? (
          <div className="platform-access__demos">
            <p className="platform-access__demos-title">
              Pilot účty
            </p>
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
