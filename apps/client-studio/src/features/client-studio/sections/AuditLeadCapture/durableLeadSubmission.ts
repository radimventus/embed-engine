import { platformApiOrigin } from '@embed-engine/platform-access';

export type DurableLeadScope = {
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
  readonly privacyUrl: string;
};

export type DurableLeadContact = {
  readonly name: string;
  readonly email: string;
  readonly phone: string | null;
};

export type DurableLeadSubmissionInput = {
  readonly scope: DurableLeadScope;
  readonly contact: DurableLeadContact;
  readonly idempotencyKey: string;
  readonly acceptedAt: string;
  readonly decisionSessionId?: string | null;
};

export type DurableLeadAccepted = {
  readonly leadId: string;
  readonly createdAt: string;
  readonly status: string;
};

export function createDurableLeadPayload(
  input: DurableLeadSubmissionInput,
) {
  return {
    idempotencyKey: input.idempotencyKey,
    companyId: input.scope.companyId,
    projectId: input.scope.projectId,
    houseId: input.scope.houseId,
    source: 'EMBED' as const,
    intent: 'audit' as const,
    contact: input.contact,
    consent: {
      accepted: true as const,
      acceptedAt: input.acceptedAt,
      privacyUrl: input.scope.privacyUrl,
      privacyVersion: 'partner-current',
    },
    ...(typeof input.decisionSessionId === 'string' &&
    input.decisionSessionId.trim().length > 0
      ? { decisionSessionId: input.decisionSessionId.trim() }
      : {}),
  };
}

export async function submitDurableLead(
  input: DurableLeadSubmissionInput,
  fetchImpl: typeof fetch = fetch,
): Promise<DurableLeadAccepted> {
  const response = await fetchImpl(
    `${platformApiOrigin().replace(/\/$/, '')}/public/leads`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(createDurableLeadPayload(input)),
    },
  );

  if (!response.ok) {
    throw new Error('Lead was rejected.');
  }

  const accepted = await response.json() as Partial<DurableLeadAccepted>;

  if (
    typeof accepted.leadId !== 'string' ||
    accepted.leadId.trim().length === 0 ||
    typeof accepted.createdAt !== 'string' ||
    accepted.createdAt.trim().length === 0 ||
    typeof accepted.status !== 'string' ||
    accepted.status.trim().length === 0
  ) {
    throw new Error('Lead acceptance response is invalid.');
  }

  return {
    leadId: accepted.leadId,
    createdAt: accepted.createdAt,
    status: accepted.status,
  };
}
