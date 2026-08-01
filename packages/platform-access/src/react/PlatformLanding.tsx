import { PLATFORM_ROLE_LABELS, primaryRole } from '../domain/roles';
import type { PlatformStudioId } from '../domain/types';
import { usePlatformSession } from './SessionProvider';

const STUDIO_ORDER: readonly {
  readonly id: PlatformStudioId;
  readonly label: string;
}[] = [
  { id: 'builder', label: 'Builder Studio' },
  { id: 'manager', label: 'Manager Studio' },
  { id: 'sales', label: 'Sales Studio' },
];

/**
 * EPIC-BX-14 — Platform Landing after login (studio picker).
 * Placeholder for future Platform Dashboard.
 */
export function PlatformLanding() {
  const {
    session,
    bootstrap,
    selectStudio,
    canOpenStudio,
    logout,
  } = usePlatformSession();

  if (session === null || bootstrap === null) {
    return null;
  }

  const role = primaryRole(session.user.roles);

  return (
    <div className="platform-access" data-testid="platform-landing">
      <div className="platform-access__panel platform-access__panel--wide">
        <p className="platform-access__eyebrow">CONIS</p>
        <h1 className="platform-access__title">Vyberte Studio</h1>
        <p className="platform-access__lead">
          {bootstrap.user.displayName} · {PLATFORM_ROLE_LABELS[role]}
          <br />
          {bootstrap.company.name} / {bootstrap.workspace.name}
          {bootstrap.project !== null
            ? ` / ${bootstrap.project.name}`
            : ''}
        </p>

        <div className="platform-access__studios">
          {STUDIO_ORDER.map((studio) => {
            const allowed = canOpenStudio(studio.id);
            return (
              <button
                key={studio.id}
                type="button"
                className={`platform-access__studio${allowed ? '' : ' platform-access__studio--disabled'}`}
                disabled={!allowed}
                title={
                  allowed
                    ? undefined
                    : 'Role nemá přístup k tomuto Studiu (soft guard)'
                }
                onClick={() => selectStudio(studio.id)}
              >
                <span className="platform-access__studio-name">
                  {studio.label}
                </span>
                <span className="platform-access__studio-meta">
                  {allowed ? 'Otevřít' : 'Bez přístupu'}
                </span>
              </button>
            );
          })}
        </div>

        <section className="platform-access__dashboard-slot">
          <p className="platform-access__demos-title">Platform Dashboard</p>
          <p className="platform-access__lead">
            Připravený slot pro budoucí přehled napříč Studii.
          </p>
        </section>

        <button
          type="button"
          className="platform-access__logout"
          onClick={logout}
        >
          Odhlásit
        </button>
      </div>
    </div>
  );
}
