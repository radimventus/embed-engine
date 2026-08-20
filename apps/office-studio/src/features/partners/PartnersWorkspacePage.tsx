import { useEffect, useMemo, useState } from 'react';

import {
  enterOperatorPartnerEnvironmentAuthoritatively,
  resolveCloudStudioHref,
} from '@embed-engine/platform-access';
import {
  PlatformCard,
  PlatformStatusBadge,
} from '@embed-engine/platform-shell';

import {
  filterPartners,
  type PartnerStatusFilter,
} from '../../office/officePartnerFilters';
import {
  OFFICE_PARTNER_STATUS_ORDER,
  officePartnerStatusLabel,
  officePartnerStatusTone,
  type OfficePartner,
  type OfficePartnerDraft,
} from '../../office/officePartnerModel';
import {
  applyPartnerQuickAction,
  createPartner,
  draftFromPartner,
  emptyPartnerDraft,
  getPartner,
  hydrateOfficePartnersFromServer,
  listPartners,
  persistCreatedPartner,
  persistUpdatedPartner,
  discardUnsavedPartner,
  type PartnerQuickActionId,
} from '../../office/officePartnerRegistry';
import { preparePilotForPartner } from '../../office/preparePilotProvisioning';
import {
  archivePartnerEnvironment,
  restorePartnerEnvironment,
  suspendPartnerEnvironment,
} from '../../office/officePartnerEnvironmentLifecycle';
import { buildOfficePartnerEnvironment } from '../../office/officePartnerEnvironment';
import {
  buildPilotDeliveryPreview,
  deliverPilotOffer,
} from '../../office/officePilotDeliveryRegistry';
import type { PilotDeliveryPreview } from '../../office/officePilotDeliveryModel';
import { createOfferDeliveryMailSession } from '../../mail';
import { PartnerDetailPanel } from './PartnerDetailPanel';
import { PartnerFormDialog } from './PartnerFormDialog';
import { PilotDeliveryPreviewDialog } from './PilotDeliveryPreviewDialog';

type PartnersWorkspacePageProps = {
  readonly selectedPartnerId: string | null;
  readonly onSelectPartner: (partnerId: string) => void;
};

type DialogState =
  | { readonly mode: 'closed' }
  | { readonly mode: 'create' }
  | { readonly mode: 'edit'; readonly partnerId: string };

/**
 * OF-02 — Partner Workspace: Registry + Detail (search, filter, create, edit).
 */
export function PartnersWorkspacePage({
  selectedPartnerId,
  onSelectPartner,
}: PartnersWorkspacePageProps) {
  const [revision, setRevision] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<PartnerStatusFilter>('all');
  const [dialog, setDialog] = useState<DialogState>({ mode: 'closed' });
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pilotNotice, setPilotNotice] = useState<string | null>(null);
  const [deliveryPreview, setDeliveryPreview] =
    useState<PilotDeliveryPreview | null>(null);
  const [deliveryBusy, setDeliveryBusy] = useState(false);
  const partners = useMemo(() => {
    void revision;
    return listPartners();
  }, [revision]);

  const visible = useMemo(
    () => filterPartners(partners, searchQuery, statusFilter),
    [partners, searchQuery, statusFilter],
  );

  const activePartner: OfficePartner | null =
    (selectedPartnerId !== null
      ? getPartner(selectedPartnerId)
      : null) ??
    visible[0] ??
    null;

  useEffect(() => {
    let cancelled = false;
    void hydrateOfficePartnersFromServer()
      .then(() => {
        if (!cancelled) bump();
      })
      .catch(() => {
        // Keep the in-memory / migrated local snapshot until a save succeeds.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function bump() {
    setRevision((value) => value + 1);
  }

  async function handleCreate(draft: OfficePartnerDraft) {
    setFormBusy(true);
    setFormError(null);
    const created = createPartner(draft);
    try {
      const saved = await persistCreatedPartner(created);
      bump();
      setDialog({ mode: 'closed' });
      onSelectPartner(saved.id);
    } catch (error) {
      discardUnsavedPartner(created.id);
      bump();
      setFormError(
        error instanceof Error
          ? error.message
          : 'Partnera se nepodařilo uložit.',
      );
    } finally {
      setFormBusy(false);
    }
  }

  async function handleEdit(draft: OfficePartnerDraft) {
    if (dialog.mode !== 'edit') return;
    setFormBusy(true);
    setFormError(null);
    try {
      const saved = await persistUpdatedPartner(dialog.partnerId, draft);
      bump();
      setDialog({ mode: 'closed' });
      onSelectPartner(saved.id);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Partnera se nepodařilo uložit.',
      );
    } finally {
      setFormBusy(false);
    }
  }

  function handleQuickAction(actionId: PartnerQuickActionId) {
    if (activePartner === null) return;
    if (actionId === 'prepare-pilot') {
      const prepared = preparePilotForPartner(activePartner.id);
      bump();
      if (prepared === null) {
        setPilotNotice(
          'Partner environment is not prepared in Builder Studio.',
        );
        return;
      }
      onSelectPartner(prepared.partner.id);
      setPilotNotice(
        `Partner Environment připraven · pozvánka připravena · ${prepared.provision.project.name} · k odeslání`,
      );
      return;
    }
    if (actionId === 'deliver-pilot' || actionId === 'send-offer') {
      const preview = buildPilotDeliveryPreview(activePartner.id);
      bump();
      if (preview === null) {
        setPilotNotice(
          'Nabídku nelze odeslat — partner musí mít kontaktní e-mail.',
        );
        return;
      }
      setDeliveryPreview(preview);
      return;
    }
    if (actionId === 'open-partner-environment') {
      const env = buildOfficePartnerEnvironment(activePartner.id);
      if (
        !env.ready ||
        env.companyId === null ||
        env.environment?.workspaceId == null ||
        env.environment.projectId == null
      ) {
        setPilotNotice(
          'Partner Environment ještě není připraveno — nejdřív Připravit pilot.',
        );
        bump();
        return;
      }
      const officeBase = resolveCloudStudioHref('office').replace(/\/?$/, '/');
      void enterOperatorPartnerEnvironmentAuthoritatively({
        companyId: env.companyId,
        workspaceId: env.environment.workspaceId,
        projectId: env.environment.projectId,
        officePartnerId: activePartner.id,
        officeReturnHref: `${officeBase}partners/${encodeURIComponent(activePartner.id)}`,
        initialSurface: 'client',
      }).then((result) => {
        if (!result.ok) {
          setPilotNotice(result.error);
          bump();
        }
      }).catch(() => {
        setPilotNotice(
          'Partner Environment se nepodařilo spojit s Platform API.',
        );
        bump();
      });
      return;
    }
    if (actionId === 'suspend-partner') {
      const record = suspendPartnerEnvironment(activePartner.id);
      bump();
      if (record?.lifecycleStatus !== 'suspended') {
        setPilotNotice(
          'Partnera nelze pozastavit — nejdřív aktivujte Partner Environment.',
        );
        return;
      }
      onSelectPartner(activePartner.id);
      setPilotNotice('Partner pozastaven · přístup do studií zakázán');
      return;
    }
    if (actionId === 'restore-partner') {
      const record = restorePartnerEnvironment(activePartner.id);
      bump();
      if (record?.lifecycleStatus !== 'active') {
        setPilotNotice(
          'Partnera nelze obnovit — obnovení je možné jen ze stavu Suspended.',
        );
        return;
      }
      onSelectPartner(activePartner.id);
      setPilotNotice('Partner obnoven · přístup do studií povolen');
      return;
    }
    if (actionId === 'archive-partner') {
      const record = archivePartnerEnvironment(activePartner.id);
      bump();
      if (record?.lifecycleStatus !== 'archived') {
        setPilotNotice(
          'Partnera nelze archivovat — nejdřív aktivujte Partner Environment.',
        );
        return;
      }
      onSelectPartner(activePartner.id);
      setPilotNotice('Partner archivován · data zachována');
      return;
    }
    const updated = applyPartnerQuickAction(activePartner.id, actionId);
    bump();
    if (updated !== null) {
      onSelectPartner(updated.id);
    }
  }

  async function handleConfirmDelivery() {
    if (activePartner === null || deliveryPreview === null || deliveryBusy) {
      return;
    }
    setDeliveryBusy(true);
    try {
      const session = createOfferDeliveryMailSession();
      const result = await deliverPilotOffer(activePartner.id, session);
      setDeliveryPreview(null);
      bump();
      if (!result.ok) {
        setPilotNotice(result.error);
        return;
      }
      onSelectPartner(activePartner.id);
      setPilotNotice(
        `Nabídka odeslána · ${result.delivery.package.pdf.name} · ${result.delivery.package.workspaceHref}`,
      );
    } finally {
      setDeliveryBusy(false);
    }
  }

  return (
    <div className="office-partners" data-testid="office-partners-workspace">
      <header className="office-dashboard__header">
        <p className="office-dashboard__eyebrow">Partneři</p>
        <h1 className="office-dashboard__title">Partner Workspace</h1>
        <p className="office-dashboard__lead">
          Centrální pracovní prostor partnera — registry, detail, timeline a
          provozní akce.
        </p>
        {pilotNotice !== null ? (
          <p
            className="office-dashboard__lead"
            data-testid="prepare-pilot-notice"
            role="status"
          >
            {pilotNotice}
          </p>
        ) : null}
      </header>

      <div className="office-partners__grid">
        <PlatformCard
          className="office-partners__registry"
          title="Partner Registry"
          description={`${visible.length} z ${partners.length}`}
        >
          <div className="office-partners__toolbar">
            <label className="office-partners__search">
              <span className="sr-only">Vyhledávání partnerů</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Hledat partnera…"
                className="office-partners__search-input"
                data-testid="office-partner-search"
              />
            </label>
            <button
              type="button"
              className="platform-btn platform-btn--primary platform-btn--sm"
              onClick={() => {
                setFormError(null);
                setDialog({ mode: 'create' });
              }}
              data-testid="office-partner-create"
            >
              Nový partner
            </button>
          </div>

          <div
            className="office-partners__filters"
            role="group"
            aria-label="Filtr statusu"
          >
            <button
              type="button"
              className={
                statusFilter === 'all'
                  ? 'office-partners__filter office-partners__filter--active'
                  : 'office-partners__filter'
              }
              onClick={() => setStatusFilter('all')}
            >
              Všichni
            </button>
            {OFFICE_PARTNER_STATUS_ORDER.map((status) => (
              <button
                key={status}
                type="button"
                className={
                  statusFilter === status
                    ? 'office-partners__filter office-partners__filter--active'
                    : 'office-partners__filter'
                }
                onClick={() => setStatusFilter(status)}
              >
                {officePartnerStatusLabel(status)}
              </button>
            ))}
          </div>

          <ul className="office-partners__list">
            {visible.map((partner) => {
              const active = activePartner?.id === partner.id;
              return (
                <li key={partner.id}>
                  <button
                    type="button"
                    className={
                      active
                        ? 'office-partners__item office-partners__item--active'
                        : 'office-partners__item'
                    }
                    onClick={() => onSelectPartner(partner.id)}
                    aria-current={active ? 'true' : undefined}
                    data-testid={`office-partner-row-${partner.id}`}
                  >
                    <div className="office-partners__item-head">
                      <span className="office-partners__item-name">
                        {partner.name}
                      </span>
                      <PlatformStatusBadge
                        tone={officePartnerStatusTone(partner.status)}
                      >
                        {officePartnerStatusLabel(partner.status)}
                      </PlatformStatusBadge>
                    </div>
                    <p className="office-partners__item-meta">
                      {partner.nextStep}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>

          {visible.length === 0 ? (
            <p className="office-partners__empty">
              Žádný partner neodpovídá hledání nebo filtru.
            </p>
          ) : null}
        </PlatformCard>

        <PartnerDetailPanel
          partner={activePartner}
          onEdit={() => {
            if (activePartner !== null) {
              setFormError(null);
              setDialog({ mode: 'edit', partnerId: activePartner.id });
            }
          }}
          onQuickAction={handleQuickAction}
          onAdminChanged={bump}
        />
      </div>

      {dialog.mode === 'create' ? (
        <PartnerFormDialog
          key="create"
          open
          mode="create"
          initial={emptyPartnerDraft()}
          busy={formBusy}
          error={formError}
          onClose={() => {
            if (formBusy) return;
            setFormError(null);
            setDialog({ mode: 'closed' });
          }}
          onSubmit={(draft) => {
            void handleCreate(draft);
          }}
        />
      ) : null}
      {dialog.mode === 'edit' ? (
        <PartnerFormDialog
          key={`edit-${dialog.partnerId}`}
          open
          mode="edit"
          initial={draftFromPartner(
            getPartner(dialog.partnerId) ?? partners[0]!,
          )}
          busy={formBusy}
          error={formError}
          onClose={() => {
            if (formBusy) return;
            setFormError(null);
            setDialog({ mode: 'closed' });
          }}
          onSubmit={(draft) => {
            void handleEdit(draft);
          }}
        />
      ) : null}
      {deliveryPreview !== null ? (
        <PilotDeliveryPreviewDialog
          preview={deliveryPreview}
          busy={deliveryBusy}
          onCancel={() => {
            if (!deliveryBusy) setDeliveryPreview(null);
          }}
          onConfirm={() => {
            void handleConfirmDelivery();
          }}
        />
      ) : null}
    </div>
  );
}
