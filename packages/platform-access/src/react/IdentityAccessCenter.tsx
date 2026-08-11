import { useMemo, useState, type FormEvent } from 'react';

import {
  PLATFORM_ROLE_LABELS,
  studiosForRoles,
} from '../domain/roles';
import type { PlatformRole, PlatformUser } from '../domain/types';
import {
  createPilotInvite,
  listInvites,
  resendPilotInvite,
} from '../pilot/inviteStore';
import { listRoleChangeHistory } from '../pilot/identityAudit';
import {
  createUser,
  getUser,
  listUsers,
  setUserRoles,
  setUserStatus,
} from '../registry/userRegistry';
import { changePassword } from '../session/authService';
import { usePlatformSession } from './SessionProvider';

const ALL_ROLES: readonly PlatformRole[] = [
  'conis-admin',
  'project-admin',
  'builder',
  'manager',
  'salesman',
];

/**
 * OF-07 — Identity & Access center (User Registry, Invitation, Roles, Audit).
 */
export function IdentityAccessCenter() {
  const { session } = usePlatformSession();
  const [revision, setRevision] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [createEmail, setCreateEmail] = useState('');
  const [createName, setCreateName] = useState('');
  const [createRole, setCreateRole] = useState<PlatformRole>('builder');
  const [createPassword, setCreatePassword] = useState('demo');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<PlatformRole>('builder');
  const [invitePrepared, setInvitePrepared] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');

  const users = useMemo(() => {
    void revision;
    return listUsers();
  }, [revision]);

  const invites = useMemo(() => {
    void revision;
    return listInvites();
  }, [revision]);

  const selected =
    selectedUserId !== null
      ? (getUser(selectedUserId) ??
        users.find((user) => user.id === selectedUserId) ??
        null)
      : null;

  const roleHistory = useMemo(() => {
    void revision;
    return listRoleChangeHistory(selectedUserId ?? undefined, 8);
  }, [revision, selectedUserId]);

  if (session === null) return null;

  const refresh = (note?: string) => {
    setRevision((value) => value + 1);
    if (note !== undefined) setMessage(note);
  };

  const onCreateUser = (event: FormEvent) => {
    event.preventDefault();
    const result = createUser({
      email: createEmail,
      displayName: createName || createEmail,
      roles: [createRole],
      password: createPassword,
      createdByUserId: session.user.id,
    });
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setCreateEmail('');
    setCreateName('');
    setSelectedUserId(result.user.id);
    refresh(`Uživatel vytvořen · ${result.user.email}`);
  };

  const onInvite = (event: FormEvent) => {
    event.preventDefault();
    const invite = createPilotInvite({
      email: inviteEmail,
      displayName: inviteName || inviteEmail,
      roles: [inviteRole],
      invitedByUserId: session.user.id,
      tenantId: session.tenantId,
      companyId: session.companyId,
      workspaceId: session.workspaceId,
    });
    setInvitePrepared(true);
    setInviteEmail('');
    setInviteName('');
    refresh(`Pozvánka odeslána · ${invite.email}`);
  };

  const onChangePassword = (event: FormEvent) => {
    event.preventDefault();
    const result = changePassword({
      email: session.user.email,
      currentPassword,
      nextPassword,
    });
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setCurrentPassword('');
    setNextPassword('');
    refresh('Heslo změněno');
  };

  return (
    <section
      className="platform-access__dashboard-slot"
      data-testid="identity-access-center"
    >
      <p className="platform-access__demos-title">Identity & Access</p>
      <p className="platform-access__lead">
        User Registry · Invitation · Authentication · Authorization · Audit
      </p>
      {message !== null ? (
        <p className="platform-access__lead">{message}</p>
      ) : null}

      <div className="platform-access__identity-grid">
        <div>
          <p className="platform-access__demos-title">User Registry</p>
          <ul className="platform-access__list">
            {users.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  className="platform-access__demo"
                  onClick={() => setSelectedUserId(user.id)}
                >
                  {user.displayName} · {user.status} ·{' '}
                  {PLATFORM_ROLE_LABELS[user.roles[0] ?? 'builder']}
                </button>
              </li>
            ))}
          </ul>

          <form className="platform-access__form" onSubmit={onCreateUser}>
            <p className="platform-access__demos-title">Vytvořit uživatele</p>
            <label className="platform-access__label">
              Jméno
              <input
                className="platform-access__input"
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
              />
            </label>
            <label className="platform-access__label">
              E-mail
              <input
                className="platform-access__input"
                type="email"
                required
                value={createEmail}
                onChange={(event) => setCreateEmail(event.target.value)}
              />
            </label>
            <label className="platform-access__label">
              Role
              <select
                className="platform-access__input"
                value={createRole}
                onChange={(event) =>
                  setCreateRole(event.target.value as PlatformRole)
                }
              >
                {ALL_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {PLATFORM_ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </label>
            <label className="platform-access__label">
              Heslo
              <input
                className="platform-access__input"
                type="password"
                value={createPassword}
                onChange={(event) => setCreatePassword(event.target.value)}
              />
            </label>
            <button className="platform-access__submit" type="submit">
              Vytvořit
            </button>
          </form>
        </div>

        <div>
          {selected !== null ? (
            <UserDetailPanel
              key={selected.id}
              user={selected}
              actorId={session.user.id}
              onChanged={(note) => refresh(note)}
            />
          ) : (
            <p className="platform-access__lead">
              Vyberte uživatele pro detail.
            </p>
          )}

          <p className="platform-access__demos-title" style={{ marginTop: 16 }}>
            Historie změn rolí
          </p>
          {roleHistory.length === 0 ? (
            <p className="platform-access__lead">Zatím bez změn.</p>
          ) : (
            <ul className="platform-access__list platform-access__lead">
              {roleHistory.map((entry) => (
                <li key={entry.id}>
                  {entry.detail} · {entry.previousRoles.join(',') || '—'} →{' '}
                  {entry.nextRoles.join(',')} · {entry.at}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <form className="platform-access__form" onSubmit={onInvite}>
        <p className="platform-access__demos-title">Pozvat uživatele e-mailem</p>
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
        <label className="platform-access__label">
          Role
          <select
            className="platform-access__input"
            value={inviteRole}
            onChange={(event) =>
              setInviteRole(event.target.value as PlatformRole)
            }
          >
            {ALL_ROLES.map((role) => (
              <option key={role} value={role}>
                {PLATFORM_ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </label>
        <button className="platform-access__submit" type="submit">
          Poslat pozvánku
        </button>
      </form>
      {invitePrepared ? (
        <p className="platform-access__lead">
          Pozvánka je připravena pro bezpečné předání.
        </p>
      ) : null}

      <p className="platform-access__demos-title">Stav pozvánek</p>
      <ul className="platform-access__list">
        {invites.length === 0 ? (
          <li className="platform-access__lead">Žádné pozvánky.</li>
        ) : (
          invites.map((invite) => (
            <li key={invite.id} className="platform-access__lead">
              {invite.email} · {invite.status} · odesláno {invite.sendCount}×
              {invite.status === 'pending' ? (
                <>
                  {' '}
                  <button
                    type="button"
                    className="platform-access__demo"
                    onClick={() => {
                      const resent = resendPilotInvite(invite.id);
                      if (resent !== null) {
                        setInvitePrepared(true);
                        refresh(`Pozvánka znovu odeslána · ${resent.email}`);
                      }
                    }}
                  >
                    Znovu odeslat
                  </button>
                </>
              ) : null}
            </li>
          ))
        )}
      </ul>

      <form className="platform-access__form" onSubmit={onChangePassword}>
        <p className="platform-access__demos-title">Změna hesla</p>
        <label className="platform-access__label">
          Současné heslo
          <input
            className="platform-access__input"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </label>
        <label className="platform-access__label">
          Nové heslo
          <input
            className="platform-access__input"
            type="password"
            value={nextPassword}
            onChange={(event) => setNextPassword(event.target.value)}
            required
          />
        </label>
        <button className="platform-access__submit" type="submit">
          Změnit heslo
        </button>
      </form>
    </section>
  );
}

function UserDetailPanel({
  user,
  actorId,
  onChanged,
}: {
  readonly user: PlatformUser;
  readonly actorId: string;
  readonly onChanged: (note: string) => void;
}) {
  const [role, setRole] = useState<PlatformRole>(user.roles[0] ?? 'builder');
  const studios = studiosForRoles(user.roles);

  return (
    <div data-testid="identity-user-detail">
      <p className="platform-access__demos-title">User Detail</p>
      <ul className="platform-access__list platform-access__lead">
        <li>
          {user.displayName} · {user.email}
        </li>
        <li>Stav · {user.status === 'active' ? 'Aktivní' : 'Neaktivní'}</li>
        <li>
          Role ·{' '}
          {user.roles.map((entry) => PLATFORM_ROLE_LABELS[entry]).join(', ')}
        </li>
        <li>
          Studia ·{' '}
          {studios.length > 0 ? studios.join(', ') : 'bez přístupu'}
        </li>
        <li>Poslední přihlášení · {user.lastLoginAt ?? '—'}</li>
        <li>Poslední aktivita · {user.lastActivityAt ?? '—'}</li>
      </ul>
      <div className="platform-access__form">
        <label className="platform-access__label">
          Přiřadit roli
          <select
            className="platform-access__input"
            value={role}
            onChange={(event) => setRole(event.target.value as PlatformRole)}
          >
            {ALL_ROLES.map((entry) => (
              <option key={entry} value={entry}>
                {PLATFORM_ROLE_LABELS[entry]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="platform-access__submit"
          onClick={() => {
            setUserRoles({
              userId: user.id,
              roles: [role],
              changedByUserId: actorId,
            });
            onChanged(`Role aktualizována · ${PLATFORM_ROLE_LABELS[role]}`);
          }}
        >
          Uložit roli
        </button>
        <button
          type="button"
          className="platform-access__logout"
          onClick={() => {
            const next = user.status === 'active' ? 'inactive' : 'active';
            setUserStatus(user.id, next);
            onChanged(
              next === 'active' ? 'Účet aktivován' : 'Účet deaktivován',
            );
          }}
        >
          {user.status === 'active' ? 'Deaktivovat účet' : 'Aktivovat účet'}
        </button>
      </div>
    </div>
  );
}
