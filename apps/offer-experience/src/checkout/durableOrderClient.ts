import type { CheckoutOrderDraft } from './checkoutRuntime';

export type DurableOrderPayload = {
  readonly orderId: string;
  readonly offerSlug: string;
  readonly companyId: string;
  readonly partnerId: string;
  readonly createdAt: string;
  readonly partner: {
    readonly partnerName: string;
    readonly companyName: string;
    readonly contactName: string;
    readonly email: string;
    readonly phone: string;
    readonly ico: string | null;
  };
  readonly package: {
    readonly id: string;
    readonly name: string;
    readonly licenseLabel: string;
    readonly trialDays: number;
  };
  readonly priceCzk: number;
  readonly termsVersion: '1.0';
  readonly termsAcceptedAt: string;
};

export type DurableProforma = {
  readonly proformaId: string;
  readonly number: string;
  readonly orderId: string;
  readonly issuedAt: string;
  readonly dueDate: string;
  readonly amountCzk: number;
  readonly variableSymbol: string;
  readonly bankAccount: {
    readonly accountNumber: string;
    readonly iban: string;
    readonly bankName: string;
  };
  readonly spdPayload: string;
};

export type DurableProformaPdf = {
  readonly attachment: {
    readonly bytesBase64: string;
  };
};
type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

const TERMS_VERSION = '1.0';

export function buildDurableOrderPayload(
  draft: CheckoutOrderDraft,
  input: {
    readonly orderId: string;
    readonly createdAt: string;
    readonly termsAcceptedAt: string;
    readonly companyId: string;
    readonly partnerId: string;
  },
): DurableOrderPayload {
  return {
    orderId: input.orderId,
    offerSlug: draft.offerSlug,
    companyId: input.companyId,
    partnerId: input.partnerId,
    createdAt: input.createdAt,
    partner: {
      partnerName: draft.partnerName,
      companyName: draft.contact.companyName,
      contactName: draft.contact.contactName,
      email: draft.contact.email,
      phone: draft.contact.phone,
      ico: draft.contact.ico || null,
    },
    package: {
      id: draft.packageId,
      name: draft.packageName,
      licenseLabel: draft.licenseLabel,
      trialDays: draft.trialDays,
    },
    priceCzk: draft.priceCzk,
    termsVersion: TERMS_VERSION,
    termsAcceptedAt: input.termsAcceptedAt,
  };
}

function orderApiOrigin(): string {
  const configuredOrigin = import.meta.env.VITE_PLATFORM_API_ORIGIN;
  return configuredOrigin ?? `http://${window.location.hostname}:4310`;
}

function orderApiUrl(path: string, origin: string): string {
  return `${origin.replace(/\/$/, '')}${path}`;
}

function writeAuthorization(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = new URLSearchParams(window.location.search).get('write')?.trim();
  return token === undefined || token.length === 0
    ? {}
    : { authorization: `Bearer ${token}` };
}

function matchesPersistedOrder(
  persisted: DurableOrderPayload,
  expected: DurableOrderPayload,
): boolean {
  return (
    persisted.orderId === expected.orderId &&
    persisted.createdAt === expected.createdAt &&
    persisted.priceCzk === expected.priceCzk &&
    persisted.termsVersion === expected.termsVersion &&
    persisted.termsAcceptedAt === expected.termsAcceptedAt &&
    persisted.partner.email === expected.partner.email &&
    persisted.package.id === expected.package.id
  );
}

export async function persistDurableOrder(
  payload: DurableOrderPayload,
  request: FetchLike = fetch,
  apiOrigin = orderApiOrigin(),
): Promise<DurableOrderPayload> {
  const create = await request(orderApiUrl('/local-pilot/orders', apiOrigin), {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...writeAuthorization() },
    body: JSON.stringify(payload),
  });
  if (create.status === 201) {
    return await create.json() as DurableOrderPayload;
  }
  if (create.status === 409) {
    const existing = await request(
      orderApiUrl(
        `/local-pilot/orders/${encodeURIComponent(payload.orderId)}`,
        apiOrigin,
      ),
    );
    if (existing.ok) {
      const persisted = await existing.json() as DurableOrderPayload;
      if (matchesPersistedOrder(persisted, payload)) return persisted;
    }
  }
  throw new Error('Objednávku se nepodařilo uložit. Zkuste potvrzení opakovat.');
}

export async function issueDurableProforma(
  orderId: string,
  request: FetchLike = fetch,
  apiOrigin = orderApiOrigin(),
): Promise<DurableProforma> {
  const response = await request(
    orderApiUrl(`/local-pilot/orders/${encodeURIComponent(orderId)}/proforma`, apiOrigin),
    { method: 'POST', headers: writeAuthorization() },
  );
  if (response.status === 201 || response.status === 200) {
    return await response.json() as DurableProforma;
  }
  throw new Error('Proformu se nepodařilo vystavit.');
}

export async function fetchDurableProformaPdf(
  orderId: string,
  request: FetchLike = fetch,
  apiOrigin = orderApiOrigin(),
): Promise<DurableProformaPdf> {
  const response = await request(
    orderApiUrl(`/local-pilot/orders/${encodeURIComponent(orderId)}/proforma/pdf`, apiOrigin),
  );
  if (response.ok) return await response.json() as DurableProformaPdf;
  throw new Error('Proforma PDF se nepodařilo vytvořit.');
}
