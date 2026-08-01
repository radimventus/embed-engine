import { useMemo, useState, type FormEvent } from 'react';

import { bootstrapTenant } from '../bootstrap/tenantBootstrap';
import { PLATFORM_ROLE_LABELS, isPlatformAdmin, primaryRole } from '../domain/roles';
import type { PlatformStudioId } from '../domain/types';
import {
  buildPilotDiagnostics,
  listRecentActivity,
  recordPlatformActivity,
} from '../pilot/pilotDiagnostics';
import { createPilotInvite, listPendingInvites } from '../pilot/inviteStore';
import { provisionPilotWorkspace } from '../pilot/provisionPilotWorkspace';
import { GaReadinessCenter } from './GaReadinessCenter';
import { usePlatformSession } from './SessionProvider';

const STUDIO_ORDER: readonly {
  readonly id: PlatformStudioId;
  readonly label: string;
}[] = [
  { id: 'manager', label: 'Manager' },
  { id: 'sales', label: 'Sales' },
  { id: 'builder', label: 'Builder' },
];

/**
 * EPIC-BX-14 / BX-15 / BX-16 / BX-18 — Platform Landing + GA Readiness Center.
 */
export function PlatformLanding() {
  const {
    session,
    bootstrap,
    registry,
    selectStudio,
    selectProject,
    canOpenStudio,
    logout,
    refreshRegistry,
  } = usePlatformSession();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [pilotFirm, setPilotFirm] = useState('');
  const [pilotMessage, setPilotMessage] = useState<string | null>(null);

  const diagnostics = useMemo(
    () => buildPilotDiagnostics(session),
    [session],
  );
  const activity = useMemo(() => listRecentActivity(5), [session?.lastLoginAt]);
  const pendingInvites = listPendingInvites();
  const tenantBoot = session !== null ? bootstrapTenant(session) : null;

  if (session === null || bootstrap === null) {
    return null;
  }

  const role = primaryRole(session.user.roles);
  const isAdmin = isPlatformAdmin(session.user.roles);
  const recentProjects = registry.projects.slice(0, 5);

  const continueWork = () => {
    const studio = session.activeStudioId ?? 'builder';
    if (session.projectId !== null) {
      selectProject(session.projectId);
    }
    recordPlatformActivity({
      label: 'Pokračovat v práci',
      detail: `${bootstrap.project?.name ?? 'Projekt'} → ${studio}`,
    });
    selectStudio(canOpenStudio(studio) ? studio : 'builder');
  };

  return (
    <div className="platform-access" data-testid="platform-landing">
      <div className="platform-access__panel platform-access__panel--wide">
        <p className="platform-access__eyebrow">CONIS · app.conis.cz</p>
        <h1 className="platform-access__title">Platform Landing</h1>
        <p className="platform-access__lead">
          {bootstrap.user.displayName} · {PLATFORM_ROLE_LABELS[role]}
          <br />
          {tenantBoot !== null
            ? `${tenantBoot.tenant.name} / ${bootstrap.company.name} / ${bootstrap.workspace.name}`
            : `${bootstrap.company.name} / ${bootstrap.workspace.name}`}
          {bootstrap.project !== null
            ? ` / ${bootstrap.project.name}`
            : ''}
        </p>

        <button
          type="button"
          className="platform-access__submit"
          style={{ marginTop: 20, width: '100%' }}
          onClick={continueWork}
        >
          Pokračovat v práci
        </button>

        <div className="platform-access__studios">
          {STUDIO_ORDER.map((studio) => {
            const allowed = canOpenStudio(studio.id);
            return (
              <button
                key={studio.id}
                type="button"
                className={`platform-access__studio${allowed ? '' : ' platform-access__studio--disabled'}`}
                disabled={!allowed}
                onClick={() => {
                  recordPlatformActivity({
                    label: 'Otevření Studia',
                    detail: studio.label,
                  });
                  selectStudio(studio.id);
                }}
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
          <p className="platform-access__demos-title">Poslední projekty</p>
          <ul className="platform-access__list">
            {recentProjects.map((project) => (
              <li key={project.id}>
                <button
                  type="button"
                  className="platform-access__demo"
                  onClick={() => {
                    selectProject(project.id);
                    recordPlatformActivity({
                      label: 'Výběr projektu',
                      detail: project.name,
                    });
                  }}
                >
                  {project.name} · {project.status}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="platform-access__dashboard-slot">
          <p className="platform-access__demos-title">Poslední aktivita</p>
          {activity.length === 0 ? (
            <p className="platform-access__lead">Zatím žádná aktivita.</p>
          ) : (
            <ul className="platform-access__list">
              {activity.map((item) => (
                <li key={item.id} className="platform-access__lead">
                  {item.label} — {item.detail}
                </li>
              ))}
            </ul>
          )}
        </section>

        {!isAdmin && (
          <section className="platform-access__dashboard-slot">
            <p className="platform-access__demos-title">Pilot Diagnostics</p>
            <ul className="platform-access__list platform-access__lead">
              <li>Last login · {diagnostics.lastLoginAt ?? '—'}</li>
              <li>
                Last publish · {diagnostics.lastPublishLabel}
                {diagnostics.lastPublishAt !== null
                  ? ` (${diagnostics.lastPublishAt})`
                  : ''}
              </li>
              <li>Runtime · {diagnostics.runtimeStatus}</li>
              <li>Capability · {diagnostics.capabilityStatus}</li>
              <li>Intelligence · {diagnostics.intelligenceStatus}</li>
            </ul>
          </section>
        )}

        {isAdmin && <GaReadinessCenter />}

        {isAdmin && (
          <section className="platform-access__dashboard-slot">
            <p className="platform-access__demos-title">Pozvat uživatele</p>
            <form
              className="platform-access__form"
              onSubmit={(event: FormEvent) => {
                event.preventDefault();
                const invite = createPilotInvite({
                  email: inviteEmail,
                  displayName: inviteName || inviteEmail,
                  roles: ['builder'],
                  invitedByUserId: session.user.id,
                  tenantId: session.tenantId,
                  companyId: session.companyId,
                  workspaceId: session.workspaceId,
                });
                setInviteToken(invite.token);
                setInviteEmail('');
                setInviteName('');
                recordPlatformActivity({
                  label: 'Pozvánka',
                  detail: invite.email,
                });
              }}
            >
              <label className="platform-access__label">
                Jméno
                <input
                  className="platform-access__input"
                  value={inviteName}
                  onChange={(event) => setInviteName(event.target.value)}
                />
              </label>
              <label className="platform-access__label">
                E-mail
                <input
                  className="platform-access__input"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                />
              </label>
              <button className="platform-access__submit" type="submit">
                Poslat pozvánku
              </button>
            </form>
            {inviteToken !== null && (
              <p className="platform-access__lead">
                Token pro aktivaci: <code>{inviteToken}</code>
              </p>
            )}
            {pendingInvites.length > 0 && (
              <p className="platform-access__lead">
                Čekající pozvánky: {pendingInvites.length}
              </p>
            )}

            <p className="platform-access__demos-title" style={{ marginTop: 16 }}>
              Provisionovat pilotní firmu
            </p>
            <form
              className="platform-access__form"
              onSubmit={(event: FormEvent) => {
                event.preventDefault();
                const provisioned = provisionPilotWorkspace({
                  companyName: pilotFirm || 'Pilot Firm',
                });
                refreshRegistry();
                setPilotMessage(
                  `${provisioned.company.name} · ${provisioned.workspace.name} · ${provisioned.project.name}`,
                );
                setPilotFirm('');
              }}
            >
              <label className="platform-access__label">
                Název firmy
                <input
                  className="platform-access__input"
                  value={pilotFirm}
                  onChange={(event) => setPilotFirm(event.target.value)}
                  placeholder="např. Nordic Homes"
                />
              </label>
              <button className="platform-access__submit" type="submit">
                Provisionovat
              </button>
            </form>
            {pilotMessage !== null && (
              <p className="platform-access__lead">{pilotMessage}</p>
            )}
          </section>
        )}

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
