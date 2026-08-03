import { useMemo, useState, type FormEvent } from 'react';

import { bootstrapTenant } from '../bootstrap/tenantBootstrap';
import { resolveClientStudioHref } from '../cloud/cloudConfig';
import { isPilotPartnerRoles } from '../domain/pilotPartnerAccess';
import { PLATFORM_ROLE_LABELS, isPlatformAdmin, primaryRole } from '../domain/roles';
import type { PlatformStudioId } from '../domain/types';
import { getPartnerBranding } from '../pilot/partnerBrandingStore';
import {
  buildPilotDiagnostics,
  listRecentActivity,
  recordPlatformActivity,
} from '../pilot/pilotDiagnostics';
import {
  getPilotWorkspace,
  isPilotWorkspaceReady,
} from '../pilot/pilotWorkspaceStore';
import { provisionPilotWorkspace } from '../pilot/provisionPilotWorkspace';
import {
  dismissPartnerWelcome,
  shouldShowPartnerWelcome,
} from '../pilot/welcomeStore';
import { GaReadinessCenter } from './GaReadinessCenter';
import { IdentityAccessCenter } from './IdentityAccessCenter';
import { PartnerWelcomeScreen } from './PartnerWelcomeScreen';
import { usePlatformSession } from './SessionProvider';

const ALL_STUDIOS: readonly {
  readonly id: PlatformStudioId;
  readonly label: string;
}[] = [
  { id: 'office', label: 'Office Studio' },
  { id: 'manager', label: 'Manager Studio' },
  { id: 'sales', label: 'Sales Studio' },
  { id: 'builder', label: 'Builder Studio' },
];

const PARTNER_STUDIOS: readonly {
  readonly id: PlatformStudioId;
  readonly label: string;
}[] = [
  { id: 'manager', label: 'Manager Studio' },
  { id: 'sales', label: 'Sales Studio' },
];

/**
 * EPIC-BX-14 / BX-15 / BX-16 / BX-18 / CS-01 — Platform Landing + partner welcome.
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
  const [pilotFirm, setPilotFirm] = useState('');
  const [pilotMessage, setPilotMessage] = useState<string | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(true);

  const diagnostics = useMemo(
    () => buildPilotDiagnostics(session),
    [session],
  );
  const activity = useMemo(() => listRecentActivity(5), [session?.lastLoginAt]);
  const tenantBoot = session !== null ? bootstrapTenant(session) : null;

  if (session === null || bootstrap === null) {
    return null;
  }

  const role = primaryRole(session.user.roles);
  const isAdmin = isPlatformAdmin(session.user.roles);
  const isPartner = isPilotPartnerRoles(session.user.roles);
  const recentProjects = registry.projects.slice(0, 5);
  const studioCards = isPartner ? PARTNER_STUDIOS : ALL_STUDIOS;
  const branding = getPartnerBranding(session.companyId);
  const pilotWorkspace = getPilotWorkspace(session.companyId);
  const pilotReady = isPilotWorkspaceReady(session.companyId);
  const showWelcome =
    welcomeOpen &&
    isPartner &&
    shouldShowPartnerWelcome(session.user.email);

  const openClientStudio = () => {
    if (pilotWorkspace !== null) {
      selectProject(pilotWorkspace.projectId);
    }
    recordPlatformActivity({
      label: 'Otevření Client Studia',
      detail:
        bootstrap.project?.name ??
        pilotWorkspace?.sampleProjectLabel ??
        'Reference House',
    });
    if (typeof window !== 'undefined') {
      window.location.assign(resolveClientStudioHref());
    }
  };

  if (showWelcome) {
    return (
      <PartnerWelcomeScreen
        displayName={bootstrap.user.displayName}
        firmName={branding?.firmName ?? bootstrap.company.name}
        projectName={bootstrap.project?.name ?? 'Reference House'}
        onEnterClientStudio={() => {
          dismissPartnerWelcome(session.user.email);
          setWelcomeOpen(false);
          openClientStudio();
        }}
        onContinueToStudios={() => {
          dismissPartnerWelcome(session.user.email);
          setWelcomeOpen(false);
        }}
      />
    );
  }

  const continueWork = () => {
    const preferred: PlatformStudioId = isPartner ? 'manager' : 'builder';
    const studio = session.activeStudioId ?? preferred;
    const projectId =
      session.projectId ??
      pilotWorkspace?.projectId ??
      null;
    if (projectId !== null) {
      selectProject(projectId);
    }
    recordPlatformActivity({
      label: 'Pokračovat v práci',
      detail: `${bootstrap.project?.name ?? 'Projekt'} → ${studio}`,
    });
    if (canOpenStudio(studio)) {
      selectStudio(studio);
      return;
    }
    if (isPartner && canOpenStudio('manager')) {
      selectStudio('manager');
      return;
    }
    if (isPartner && canOpenStudio('sales')) {
      selectStudio('sales');
      return;
    }
    selectStudio(canOpenStudio('builder') ? 'builder' : 'manager');
  };

  return (
    <div className="platform-access" data-testid="platform-landing">
      <div className="platform-access__panel platform-access__panel--wide">
        <p className="platform-access__eyebrow">CONIS Studio · conis.cz/studio</p>
        <h1 className="platform-access__title">Vstupní stránka</h1>
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
        {branding !== null && (
          <p className="platform-access__lead" data-testid="partner-branding">
            Branding · {branding.firmName} · {branding.logoLabel} ·{' '}
            {branding.heroLabel}
          </p>
        )}

        {isPartner && pilotWorkspace !== null && (
          <section
            className="platform-access__dashboard-slot"
            data-testid="pilot-workspace-status"
          >
            <p className="platform-access__demos-title">Pilot Workspace</p>
            <ul className="platform-access__list platform-access__lead">
              <li>
                Stav · {pilotReady ? 'připraven' : 'neúplný'}
              </li>
              <li>
                Ukázkový projekt · {pilotWorkspace.sampleProjectLabel}
              </li>
              <li>Client Studio · připraveno</li>
              <li>Manager Studio · připraveno</li>
              <li>Sales Studio · připraveno</li>
            </ul>
          </section>
        )}

        <button
          type="button"
          className="platform-access__submit"
          style={{ marginTop: 20, width: '100%' }}
          onClick={continueWork}
        >
          Pokračovat v práci
        </button>

        {isPartner && (
          <button
            type="button"
            className="platform-access__submit"
            style={{ marginTop: 12, width: '100%' }}
            onClick={openClientStudio}
            data-testid="open-client-studio"
          >
            Client Studio
          </button>
        )}

        <div className="platform-access__studios">
          {studioCards.map((studio) => {
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
            <p className="platform-access__demos-title">Diagnostika pilota</p>
            <ul className="platform-access__list platform-access__lead">
              <li>Poslední přihlášení · {diagnostics.lastLoginAt ?? '—'}</li>
              <li>
                Poslední publikace · {diagnostics.lastPublishLabel}
                {diagnostics.lastPublishAt !== null
                  ? ` (${diagnostics.lastPublishAt})`
                  : ''}
              </li>
              <li>Provozní jádro · {diagnostics.runtimeStatus}</li>
              <li>Schopnosti · {diagnostics.capabilityStatus}</li>
              <li>Inteligence · {diagnostics.intelligenceStatus}</li>
            </ul>
          </section>
        )}

        {isAdmin && <GaReadinessCenter />}

        {isAdmin && <IdentityAccessCenter />}

        {isAdmin && (
          <section className="platform-access__dashboard-slot">
            <p className="platform-access__demos-title">Zřídit pilotní firmu</p>
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
                Zřídit
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
