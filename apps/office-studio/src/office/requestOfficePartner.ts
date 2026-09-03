import {
  platformApiOrigin,
  type DurableOfficePartner,
  type DurableOfficePartnerDraft,
} from '@embed-engine/platform-access';

function origin(): string {
  return platformApiOrigin().replace(/\/$/, '');
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === 'string') return body.error;
  } catch {
    // Fall through to the HTTP error.
  }
  return `Office Partner request failed (HTTP ${response.status}).`;
}

function asPartner(body: unknown): DurableOfficePartner {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Platform API returned invalid Office Partner.');
  }
  const record = body as DurableOfficePartner;
  if (typeof record.id !== 'string' || record.id.trim().length === 0) {
    throw new Error('Platform API returned invalid Office Partner.');
  }
  return record;
}

export async function requestOfficePartners(
  signal?: AbortSignal,
): Promise<readonly DurableOfficePartner[]> {
  const response = await fetch(`${origin()}/office/partners`, {
    credentials: 'include',
    signal,
  });

  if (response.status === 403) {
    const scopedResponse = await fetch(`${origin()}/partner/company-profile`, {
      credentials: 'include',
      signal,
    });
    if (!scopedResponse.ok) {
      throw new Error(await errorMessage(scopedResponse));
    }
    const scopedBody = (await scopedResponse.json()) as { partner?: unknown };
    return [asPartner(scopedBody.partner)];
  }

  if (!response.ok) throw new Error(await errorMessage(response));
  const body = (await response.json()) as { partners?: unknown };
  if (!Array.isArray(body.partners)) {
    throw new Error('Platform API returned invalid Office Partner list.');
  }
  return body.partners.map((item) => asPartner(item));
}

export async function saveOfficePartner(
  partnerId: string,
  draft: DurableOfficePartnerDraft,
): Promise<DurableOfficePartner> {
  const response = await fetch(
    `${origin()}/office/partners/${encodeURIComponent(partnerId)}`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(draft),
    },
  );
  if (!response.ok) throw new Error(await errorMessage(response));
  return asPartner(await response.json());
}

export async function createOfficePartner(
  partnerId: string,
  draft: DurableOfficePartnerDraft,
): Promise<DurableOfficePartner> {
  const response = await fetch(`${origin()}/office/partners`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: partnerId, ...draft }),
  });
  if (!response.ok) throw new Error(await errorMessage(response));
  return asPartner(await response.json());
}
