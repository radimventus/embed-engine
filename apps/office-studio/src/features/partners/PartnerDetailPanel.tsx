import {
  PlatformCard,
  PlatformEmptyState,
  PlatformStatusBadge,
} from '@embed-engine/platform-shell';

import {
  formatOfficeEventTime,
  listPartnerTimeline,
} from '../../office/officeEventCatalog';
import {
  officePartnerStatusLabel,
  officePartnerStatusTone,
  type OfficePartner,
} from '../../office/officePartnerModel';
import type { PartnerQuickActionId } from '../../office/officePartnerRegistry';
import { syncCommercialFollowUpTimeline } from '../../office/officeCommercialFollowUpRegistry';
import { buildOfficePartnerEnvironment } from '../../office/officePartnerEnvironment';
import { PartnerAdministrationSection } from './PartnerAdministrationSection';

type PartnerDetailPanelProps = {
  readonly partner: OfficePartner | null;
  readonly onEdit: () => void;
  readonly onQuickAction: (actionId: PartnerQuickActionId) => void;
  readonly onAdminChanged?: () => void;
};

const QUICK_ACTIONS: readonly {
  readonly id: PartnerQuickActionId;
  readonly label: string;
}[] = [
  { id: 'prepare-pilot', label: 'Připravit pilot' },
  { id: 'deliver-pilot', label: 'Odeslat pilot' },
  { id: 'send-offer', label: 'Odeslat nabídku' },
  { id: 'confirm-order', label: 'Potvrdit objednávku' },
  { id: 'record-payment', label: 'Evidovat platbu' },
  { id: 'open-builder', label: 'Otevřít Builder' },
  { id: 'suspend-partner', label: 'Pozastavit partnera' },
  { id: 'restore-partner', label: 'Obnovit partnera' },
  { id: 'archive-partner', label: 'Archivovat partnera' },
];

/**
 * OF-02 / PE-08 — Partner Detail: Status, Activity Tracking, Follow-up, Timeline.
 */
export function PartnerDetailPanel({
  partner,
  onEdit,
  onQuickAction,
  onAdminChanged,
}: PartnerDetailPanelProps) {
  if (partner === null) {
    return (
      <div className="office-partner-detail" data-testid="office-partner-detail-empty">
        <PlatformEmptyState
          title="Vyberte partnera"
          description="Otevřete partnera v registry, nebo založte nového."
        />
      </div>
    );
  }

  const followUp = syncCommercialFollowUpTimeline(partner.id);
  const environment = buildOfficePartnerEnvironment(partner.id);
  const timeline = listPartnerTimeline(partner.id);
  const activity = followUp?.activity;

  return (
    <div className="office-partner-detail" data-testid="office-partner-detail">
      <header className="office-partner-detail__header">
        <div>
          <p className="office-dashboard__eyebrow">Detail partnera</p>
          <h2 className="office-partner-detail__name">{partner.name}</h2>
          <p className="office-partner-detail__next">{partner.nextStep}</p>
        </div>
        <div className="office-partner-detail__status">
          <PlatformStatusBadge tone={officePartnerStatusTone(partner.status)}>
            {officePartnerStatusLabel(partner.status)}
          </PlatformStatusBadge>
          {followUp !== null ? (
            <span data-testid="partner-followup-status">
              <PlatformStatusBadge
                tone={
                  followUp.status === 'ready_for_contact' ? 'warning' : 'info'
                }
              >
                {followUp.statusLabel}
              </PlatformStatusBadge>
            </span>
          ) : null}
          <button
            type="button"
            className="platform-btn platform-btn--sm"
            onClick={onEdit}
          >
            Upravit
          </button>
        </div>
      </header>

      <div className="office-partner-detail__cards">
        <PlatformCard title="Company Card">
          <dl className="office-partner-dl">
            <div>
              <dt>Obchodní název</dt>
              <dd>{partner.company.legalName}</dd>
            </div>
            <div>
              <dt>IČO</dt>
              <dd>{partner.company.ico || '—'}</dd>
            </div>
            <div>
              <dt>Město</dt>
              <dd>{partner.company.city || '—'}</dd>
            </div>
            <div>
              <dt>Země</dt>
              <dd>{partner.company.country}</dd>
            </div>
          </dl>
        </PlatformCard>

        <PlatformCard title="Contact Card">
          <dl className="office-partner-dl">
            <div>
              <dt>Kontakt</dt>
              <dd>{partner.contact.name}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{partner.contact.role || '—'}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{partner.contact.email || '—'}</dd>
            </div>
            <div>
              <dt>Telefon</dt>
              <dd>{partner.contact.phone || '—'}</dd>
            </div>
          </dl>
        </PlatformCard>
      </div>

      <PartnerAdministrationSection
        partnerId={partner.id}
        onChanged={() => onAdminChanged?.()}
      />

      <PlatformCard
        title="Workspace Summary"
        description="Lifecycle · Licence · balíček · administrace"
      >
        {environment.workspaceSummary === null ? (
          <p className="office-dashboard__hint">Workspace zatím není aktivní.</p>
        ) : (
          <dl
            className="office-partner-dl"
            data-testid="partner-workspace-summary"
          >
            <div>
              <dt>Lifecycle Status</dt>
              <dd>{environment.lifecycleStatusLabel}</dd>
            </div>
            <div>
              <dt>Licence</dt>
              <dd>{environment.workspaceSummary.licence}</dd>
            </div>
            <div>
              <dt>Aktivní balíček</dt>
              <dd>{environment.workspaceSummary.activePackage}</dd>
            </div>
            <div>
              <dt>Datum změny stavu</dt>
              <dd>
                {environment.statusChangedAt
                  ? formatOfficeEventTime(environment.statusChangedAt)
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Důvod změny</dt>
              <dd>{environment.statusChangeReason ?? '—'}</dd>
            </div>
            <div>
              <dt>Poslední administrativní akce</dt>
              <dd>{environment.lastAdminActionLabel}</dd>
            </div>
            <div>
              <dt>Datum aktivace</dt>
              <dd>
                {environment.workspaceSummary.activatedAt
                  ? formatOfficeEventTime(
                      environment.workspaceSummary.activatedAt,
                    )
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Workspace</dt>
              <dd>
                {environment.permanentWorkspace
                  ? 'Trvalý'
                  : environment.pilotMode
                    ? 'Pilotní režim'
                    : '—'}
              </dd>
            </div>
          </dl>
        )}
      </PlatformCard>

      <PlatformCard
        title="Studio Access"
        description="Client / Manager / Sales podle Lifecycle (Office a Builder zůstávají interní)"
      >
        <ul className="office-list" data-testid="partner-studio-access">
          <li className="office-list__item">
            <p className="office-list__title">Client Studio</p>
            <PlatformStatusBadge
              tone={environment.studioAccess.client ? 'pass' : 'warning'}
            >
              {environment.studioAccess.client ? 'povoleno' : 'zakázáno'}
            </PlatformStatusBadge>
          </li>
          <li className="office-list__item">
            <p className="office-list__title">Manager Studio</p>
            <PlatformStatusBadge
              tone={environment.studioAccess.manager ? 'pass' : 'warning'}
            >
              {environment.studioAccess.manager ? 'povoleno' : 'zakázáno'}
            </PlatformStatusBadge>
          </li>
          <li className="office-list__item">
            <p className="office-list__title">Sales Studio</p>
            <PlatformStatusBadge
              tone={environment.studioAccess.sales ? 'pass' : 'warning'}
            >
              {environment.studioAccess.sales ? 'povoleno' : 'zakázáno'}
            </PlatformStatusBadge>
          </li>
        </ul>
      </PlatformCard>

      <PlatformCard
        title="Partner Environment"
        description={
          environment.pilotMode
            ? 'Kompletní pilotní prostředí po akci Připravit pilot'
            : 'Standardní Partner Environment — dlouhodobý provoz'
        }
      >
        <div className="office-partner-detail__status">
          <PlatformStatusBadge
            tone={
              environment.lifecycleStatus === 'active'
                ? 'pass'
                : environment.lifecycleStatus === 'suspended'
                  ? 'warning'
                  : environment.lifecycleStatus === 'archived'
                    ? 'draft'
                    : 'info'
            }
          >
            {environment.lifecycleStatusLabel}
          </PlatformStatusBadge>
        </div>
        <ul className="office-list" data-testid="partner-environment-checklist">
          {environment.items.map((item) => (
            <li key={item.id} className="office-list__item">
              <p className="office-list__title">{item.label}</p>
              <PlatformStatusBadge tone={item.ready ? 'pass' : 'info'}>
                {item.ready ? 'připraveno' : 'čeká'}
              </PlatformStatusBadge>
            </li>
          ))}
        </ul>
      </PlatformCard>

      <PlatformCard
        title="Activity Tracking"
        description="Obchodní aktivita po odeslání pilotu"
      >
        <ul className="office-list" data-testid="partner-activity-tracking">
          <li className="office-list__item">
            <p className="office-list__title">Pozvánka otevřena</p>
            <PlatformStatusBadge tone={activity?.inviteOpened ? 'pass' : 'info'}>
              {activity?.inviteOpened
                ? activity.inviteOpenedAt ?? 'ano'
                : 'ne'}
            </PlatformStatusBadge>
          </li>
          <li className="office-list__item">
            <p className="office-list__title">NDA odsouhlaseno</p>
            <PlatformStatusBadge tone={activity?.ndaAccepted ? 'pass' : 'info'}>
              {activity?.ndaAccepted
                ? activity.ndaAcceptedAt ?? 'ano'
                : 'ne'}
            </PlatformStatusBadge>
          </li>
          <li className="office-list__item">
            <p className="office-list__title">Účet aktivován</p>
            <PlatformStatusBadge
              tone={activity?.accountActivated ? 'pass' : 'info'}
            >
              {activity?.accountActivated
                ? activity.activatedAt ?? 'ano'
                : 'ne'}
            </PlatformStatusBadge>
          </li>
          <li className="office-list__item">
            <p className="office-list__title">První přihlášení</p>
            <PlatformStatusBadge tone={activity?.firstLogin ? 'pass' : 'info'}>
              {activity?.firstLogin
                ? activity.firstLoginAt ?? 'ano'
                : 'ne'}
            </PlatformStatusBadge>
          </li>
          <li className="office-list__item">
            <p className="office-list__title">Poslední aktivita</p>
            <PlatformStatusBadge tone="info">
              {activity?.lastActivityAt ?? '—'}
            </PlatformStatusBadge>
          </li>
          <li className="office-list__item">
            <p className="office-list__title">Poslední navštívené Studio</p>
            <PlatformStatusBadge
              tone={activity?.lastVisitedStudio ? 'pass' : 'info'}
            >
              {activity?.lastVisitedStudio ?? '—'}
            </PlatformStatusBadge>
          </li>
        </ul>
      </PlatformCard>

      <PlatformCard title="Quick Actions" description="Provozní kroky životního cyklu">
        <div className="office-partner-actions" role="group" aria-label="Quick Actions">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              className="platform-btn platform-btn--sm"
              onClick={() => onQuickAction(action.id)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </PlatformCard>

      <PlatformCard
        title="Timeline"
        description="Historie událostí partnera z Event Catalog"
      >
        {timeline.length === 0 ? (
          <PlatformEmptyState
            title="Zatím žádné události"
            description="Události se objeví při založení partnera a Quick Actions."
          />
        ) : (
          <ol className="office-activity" aria-label="Timeline partnera">
            {timeline.map((event, index) => (
              <li key={event.id} className="office-activity__item">
                <div className="office-activity__rail" aria-hidden>
                  <span className="office-activity__dot" />
                  {index < timeline.length - 1 ? (
                    <span className="office-activity__line" />
                  ) : null}
                </div>
                <div className="office-activity__body">
                  <p className="office-activity__label">{event.label}</p>
                  <p className="office-activity__detail">{event.detail}</p>
                  <p className="office-activity__time">
                    {formatOfficeEventTime(event.occurredAt)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </PlatformCard>
    </div>
  );
}
