import { useMemo, useState, type FormEvent } from 'react';

import { PlatformCard, PlatformStatusBadge } from '@embed-engine/platform-shell';
import { PLATFORM_ROLE_LABELS } from '@embed-engine/platform-access';

import {
  invitePartnerUser,
  listPartnerUserInvites,
  type PartnerInviteRole,
} from '../../office/invitePartnerUser';

const INVITABLE_ROLES: readonly PartnerInviteRole[] = ['manager', 'salesman'];

export function PartnerUserInvitationSection({
  partnerId,
  invitedByUserId = 'user-radim',
}: {
  readonly partnerId: string;
  readonly invitedByUserId?: string;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<PartnerInviteRole>('manager');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const invites = useMemo(() => {
    void revision;
    return listPartnerUserInvites(partnerId);
  }, [partnerId, revision]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage(null);

    window.setTimeout(() => {
      const result = invitePartnerUser({
        partnerId,
        name,
        email,
        role,
        invitedByUserId,
      });
      if (!result.ok) {
        setMessage(result.error);
        setSubmitting(false);
        return;
      }

      setName('');
      setEmail('');
      setRevision((value) => value + 1);
      setMessage(
        `Pozvánka připravena · ${result.invite.displayName} · ${
          PLATFORM_ROLE_LABELS[result.invite.roles[0] ?? 'manager']
        }`,
      );
      setSubmitting(false);
    }, 0);
  }

  return (
    <PlatformCard
      title="Partner users"
      description="Pozvěte uživatele do existujícího Partner Environment."
    >
      <form className="office-partner-actions" onSubmit={onSubmit}>
        <label>
          Jméno
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={submitting}
          />
        </label>
        <label>
          E-mail
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
          />
        </label>
        <label>
          Role
          <select
            value={role}
            onChange={(event) =>
              setRole(event.target.value as PartnerInviteRole)
            }
            disabled={submitting}
          >
            {INVITABLE_ROLES.map((entry) => (
              <option key={entry} value={entry}>
                {PLATFORM_ROLE_LABELS[entry]}
              </option>
            ))}
          </select>
        </label>
        <button
          className="platform-btn platform-btn--sm"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Připravuji…' : 'Pozvat uživatele'}
        </button>
      </form>
      {message !== null ? (
        <p className="office-dashboard__hint" role="status">
          {message}
        </p>
      ) : null}
      <ul className="office-list" data-testid="partner-user-invites">
        {invites.map((invite) => (
          <li key={invite.id} className="office-list__item">
            <p className="office-list__title">
              {invite.displayName} · {invite.email}
            </p>
            <span>
              {PLATFORM_ROLE_LABELS[invite.roles[0] ?? 'manager']} ·{' '}
              <PlatformStatusBadge tone="info">
                {invite.status === 'pending' ? 'pozván' : invite.status}
              </PlatformStatusBadge>
            </span>
          </li>
        ))}
      </ul>
    </PlatformCard>
  );
}
