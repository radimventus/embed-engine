/**
 * PE-12 — Partner Administration UI (profile + actions + audit history).
 */

import { useState } from 'react';

import {
  PlatformCard,
  PlatformStatusBadge,
} from '@embed-engine/platform-shell';

import {
  addPartnerInternalNote,
  buildPartnerAdminProfile,
  changePartnerContact,
  changePartnerLicence,
  changePartnerPackage,
  listAdminPackages,
  type PartnerAdminProfile,
} from '../../office/officePartnerAdministration';
import { formatOfficeEventTime } from '../../office/officeEventCatalog';
import type { OfficePackageId } from '../../office/officeSalesModel';

type PartnerAdministrationSectionProps = {
  readonly partnerId: string;
  readonly onChanged: () => void;
};

export function PartnerAdministrationSection({
  partnerId,
  onChanged,
}: PartnerAdministrationSectionProps) {
  const profile = buildPartnerAdminProfile(partnerId);
  if (profile === null) return null;

  return (
    <PartnerAdministrationForm
      key={`${partnerId}-${profile.updatedAt ?? 'none'}-${profile.changeHistory.length}`}
      profile={profile}
      onChanged={onChanged}
    />
  );
}

function PartnerAdministrationForm({
  profile,
  onChanged,
}: {
  readonly profile: PartnerAdminProfile;
  readonly onChanged: () => void;
}) {
  const packages = listAdminPackages();
  const [packageId, setPackageId] = useState<OfficePackageId | ''>(
    profile.packageId ?? '',
  );
  const [licence, setLicence] = useState(profile.licence.label);
  const [contactName, setContactName] = useState(profile.contact.name);
  const [contactEmail, setContactEmail] = useState(profile.contact.email);
  const [contactPhone, setContactPhone] = useState(profile.contact.phone);
  const [contactRole, setContactRole] = useState(profile.contact.role);
  const [note, setNote] = useState('');

  return (
    <>
      <PlatformCard
        title="Partner Profile"
        description="Identifikace · kontakt · licence · balíček · historie změn"
      >
        <dl className="office-partner-dl" data-testid="partner-admin-profile">
          <div>
            <dt>Obchodní název</dt>
            <dd>{profile.legalName || '—'}</dd>
          </div>
          <div>
            <dt>IČO</dt>
            <dd>{profile.ico || '—'}</dd>
          </div>
          <div>
            <dt>Město / země</dt>
            <dd>
              {[profile.city, profile.country].filter(Boolean).join(' · ') ||
                '—'}
            </dd>
          </div>
          <div>
            <dt>Kontaktní osoba</dt>
            <dd>
              {profile.contact.name || '—'}
              {profile.contact.role ? ` · ${profile.contact.role}` : ''}
            </dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{profile.contact.email || '—'}</dd>
          </div>
          <div>
            <dt>Aktivní balíček</dt>
            <dd>{profile.packageName ?? '—'}</dd>
          </div>
          <div>
            <dt>Licence</dt>
            <dd>
              {profile.licence.label}
              {profile.licence.source === 'override' ? ' · override' : ''}
            </dd>
          </div>
        </dl>
      </PlatformCard>

      <PlatformCard
        title="Administration Actions"
        description="Změna balíčku, licence, kontaktu a interní poznámky — bez mazání dat"
      >
        <div className="office-admin-actions" data-testid="partner-admin-actions">
          <label className="office-admin-actions__field">
            <span>Balíček</span>
            <select
              value={packageId}
              onChange={(event) =>
                setPackageId(event.target.value as OfficePackageId | '')
              }
            >
              <option value="">— vyberte —</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="platform-btn platform-btn--sm"
              disabled={packageId === '' || packageId === profile.packageId}
              onClick={() => {
                if (packageId === '') return;
                changePartnerPackage(profile.partnerId, packageId);
                onChanged();
              }}
            >
              Změnit balíček
            </button>
          </label>

          <label className="office-admin-actions__field">
            <span>Licence</span>
            <input
              value={licence}
              onChange={(event) => setLicence(event.target.value)}
              placeholder="např. až 3 domy · custom"
            />
            <button
              type="button"
              className="platform-btn platform-btn--sm"
              onClick={() => {
                changePartnerLicence(profile.partnerId, licence);
                onChanged();
              }}
            >
              Změnit licenci
            </button>
          </label>

          <div className="office-admin-actions__grid">
            <label className="office-admin-actions__field">
              <span>Kontakt — jméno</span>
              <input
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
              />
            </label>
            <label className="office-admin-actions__field">
              <span>Role</span>
              <input
                value={contactRole}
                onChange={(event) => setContactRole(event.target.value)}
              />
            </label>
            <label className="office-admin-actions__field">
              <span>E-mail</span>
              <input
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
              />
            </label>
            <label className="office-admin-actions__field">
              <span>Telefon</span>
              <input
                value={contactPhone}
                onChange={(event) => setContactPhone(event.target.value)}
              />
            </label>
          </div>
          <button
            type="button"
            className="platform-btn platform-btn--sm"
            onClick={() => {
              changePartnerContact(profile.partnerId, {
                name: contactName,
                email: contactEmail,
                phone: contactPhone,
                role: contactRole,
              });
              onChanged();
            }}
          >
            Změnit kontaktní osobu
          </button>

          <label className="office-admin-actions__field">
            <span>Interní poznámka</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              placeholder="Provozní poznámka pro Office tým"
            />
            <button
              type="button"
              className="platform-btn platform-btn--sm"
              disabled={note.trim().length === 0}
              onClick={() => {
                addPartnerInternalNote(profile.partnerId, note);
                setNote('');
                onChanged();
              }}
            >
              Přidat poznámku
            </button>
          </label>
        </div>
      </PlatformCard>

      <PlatformCard
        title="Administrative Audit"
        description="Historie administrativních změn partnera"
      >
        {profile.changeHistory.length === 0 ? (
          <p className="office-dashboard__hint">Zatím žádné administrativní změny.</p>
        ) : (
          <ul className="office-list" data-testid="partner-admin-history">
            {profile.changeHistory.map((change) => (
              <li key={change.id} className="office-list__item">
                <div>
                  <p className="office-list__title">{change.summary}</p>
                  <p className="office-list__meta">
                    {formatOfficeEventTime(change.occurredAt)}
                  </p>
                </div>
                <PlatformStatusBadge tone="info">{change.kind}</PlatformStatusBadge>
              </li>
            ))}
          </ul>
        )}
        {profile.notes.length > 0 ? (
          <ul className="office-list" data-testid="partner-admin-notes">
            {profile.notes.map((item) => (
              <li key={item.id} className="office-list__item">
                <div>
                  <p className="office-list__title">{item.text}</p>
                  <p className="office-list__meta">
                    {formatOfficeEventTime(item.createdAt)}
                  </p>
                </div>
                <PlatformStatusBadge tone="draft">poznámka</PlatformStatusBadge>
              </li>
            ))}
          </ul>
        ) : null}
      </PlatformCard>
    </>
  );
}
