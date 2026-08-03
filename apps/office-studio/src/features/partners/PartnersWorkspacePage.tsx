import { useMemo, useState } from 'react';

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
  listPartners,
  type PartnerQuickActionId,
  updatePartner,
} from '../../office/officePartnerRegistry';
import { PartnerDetailPanel } from './PartnerDetailPanel';
import { PartnerFormDialog } from './PartnerFormDialog';

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

  function bump() {
    setRevision((value) => value + 1);
  }

  function handleCreate(draft: OfficePartnerDraft) {
    const created = createPartner(draft);
    bump();
    setDialog({ mode: 'closed' });
    onSelectPartner(created.id);
  }

  function handleEdit(draft: OfficePartnerDraft) {
    if (dialog.mode !== 'edit') return;
    const updated = updatePartner(dialog.partnerId, draft);
    bump();
    setDialog({ mode: 'closed' });
    if (updated !== null) {
      onSelectPartner(updated.id);
    }
  }

  function handleQuickAction(actionId: PartnerQuickActionId) {
    if (activePartner === null) return;
    const updated = applyPartnerQuickAction(activePartner.id, actionId);
    bump();
    if (updated !== null) {
      onSelectPartner(updated.id);
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
              onClick={() => setDialog({ mode: 'create' })}
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
              setDialog({ mode: 'edit', partnerId: activePartner.id });
            }
          }}
          onQuickAction={handleQuickAction}
        />
      </div>

      {dialog.mode === 'create' ? (
        <PartnerFormDialog
          key="create"
          open
          mode="create"
          initial={emptyPartnerDraft()}
          onClose={() => setDialog({ mode: 'closed' })}
          onSubmit={handleCreate}
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
          onClose={() => setDialog({ mode: 'closed' })}
          onSubmit={handleEdit}
        />
      ) : null}
    </div>
  );
}
