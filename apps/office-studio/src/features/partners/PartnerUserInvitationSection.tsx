import { useState, type FormEvent } from "react";

import {
  PlatformCard,
  PlatformStatusBadge,
} from "@embed-engine/platform-shell";
import {
  PLATFORM_ROLE_LABELS,
  type PlatformAccessInvite,
  type PlatformAccessInviteClient,
} from "@embed-engine/platform-access";

import {
  invitePartnerUser,
  reissuePartnerUserInvite,
  type PartnerInviteRole,
} from "../../office/invitePartnerUser";
import { copyActivationLink } from "../../office/copyActivationLink";

const INVITABLE_ROLES: readonly PartnerInviteRole[] = ["manager", "salesman"];

export function shouldShowActivationLinkAction(
  invite: PlatformAccessInvite,
): boolean {
  return invite.status === "pending";
}

export function PartnerUserInvitationSection({
  partnerId,
  invitedByUserId = "user-radim",
  inviteClient,
}: {
  readonly partnerId: string;
  readonly invitedByUserId?: string;
  readonly inviteClient?: PlatformAccessInviteClient;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<PartnerInviteRole>("manager");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [invites, setInvites] = useState<readonly PlatformAccessInvite[]>([]);
  const [reissuingInviteId, setReissuingInviteId] = useState<string | null>(
    null,
  );
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage(null);

    const result = await invitePartnerUser(
      {
        partnerId,
        name,
        email,
        role,
        invitedByUserId,
      },
      inviteClient,
    );
    if (!result.ok) {
      setMessage(result.error);
      setSubmitting(false);
      return;
    }

    setName("");
    setEmail("");
    setInvites((current) => [result.invite, ...current]);
    setMessage(
      `Pozvánka připravena · ${result.invite.displayName} · ${
        PLATFORM_ROLE_LABELS[result.invite.roles[0] ?? "manager"]
      }`,
    );
    setSubmitting(false);
  }

  async function copyInviteActivationLink(inviteId: string) {
    if (reissuingInviteId !== null) return;
    setReissuingInviteId(inviteId);
    setMessage(null);

    const result = await reissuePartnerUserInvite(inviteId, inviteClient);
    if (!result.ok) {
      setMessage(result.error);
      setReissuingInviteId(null);
      return;
    }

    try {
      await copyActivationLink(result.activationHref);
      setInvites((current) =>
        current.map((invite) =>
          invite.id === result.invite.id ? result.invite : invite,
        ),
      );
      setMessage("Aktivační odkaz zkopírován.");
    } catch {
      setMessage("Aktivační odkaz se nepodařilo zkopírovat.");
    } finally {
      setReissuingInviteId(null);
    }
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
          {submitting ? "Připravuji…" : "Pozvat uživatele"}
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
              {PLATFORM_ROLE_LABELS[invite.roles[0] ?? "manager"]} ·{" "}
              <PlatformStatusBadge tone="info">
                {invite.status === "pending" ? "pozván" : invite.status}
              </PlatformStatusBadge>
            </span>
            {shouldShowActivationLinkAction(invite) ? (
              <button
                className="platform-btn platform-btn--sm"
                type="button"
                disabled={reissuingInviteId !== null}
                onClick={() => void copyInviteActivationLink(invite.id)}
              >
                {reissuingInviteId === invite.id
                  ? "Obnovuji…"
                  : "Zkopírovat aktivační odkaz"}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </PlatformCard>
  );
}
