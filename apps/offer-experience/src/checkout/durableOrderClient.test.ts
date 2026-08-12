import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildDurableOrderPayload,
  fetchDurableProformaPdf,
  issueDurableProforma,
  persistDurableOrder,
} from './durableOrderClient';
import { buildOrderDraft } from './checkoutRuntime';
import { resolvePublicOffer } from '../offer/offerRegistry';

const offer = resolvePublicOffer('domy-s-energi')!;
const payload = buildDurableOrderPayload(
  buildOrderDraft(
    offer,
    'starter',
    {
      companyName: 'Domy s energií s.r.o.',
      contactName: 'Jana Energetická',
      email: 'jana@domysenergii.cz',
      phone: '+420777200300',
      ico: '06123456',
      note: '',
    },
    true,
  ),
  {
    orderId: 'OFF-TEST-001',
    createdAt: '2026-08-12T12:00:00.000Z',
    termsAcceptedAt: '2026-08-12T11:59:00.000Z',
  },
);

describe('durable Offer order client', () => {
  it('builds the canonical terms acceptance payload', () => {
    assert.equal(payload.termsVersion, '1.0');
    assert.equal(payload.termsAcceptedAt, '2026-08-12T11:59:00.000Z');
    assert.equal(payload.partner.companyName, 'Domy s energií s.r.o.');
    assert.equal(payload.package.id, 'starter');
    assert.equal(payload.priceCzk, 14_970);
  });

  it('treats a matching pre-existing order as an idempotent retry', async () => {
    const requests: string[] = [];
    const request = async (input: RequestInfo | URL): Promise<Response> => {
      requests.push(String(input));
      return new Response(JSON.stringify(payload), {
        status: requests.length === 1 ? 409 : 200,
        headers: { 'content-type': 'application/json' },
      });
    };

    const persisted = await persistDurableOrder(
      payload,
      request,
      'http://127.0.0.1:4310',
    );

    assert.deepEqual(persisted, payload);
    assert.deepEqual(requests, [
      'http://127.0.0.1:4310/local-pilot/orders',
      'http://127.0.0.1:4310/local-pilot/orders/OFF-TEST-001',
    ]);
  });

  it('rejects confirmation when the durable write fails', async () => {
    await assert.rejects(
      persistDurableOrder(
        payload,
        async () => new Response('', { status: 500 }),
        'http://127.0.0.1:4310',
      ),
      /nepodařilo uložit/i,
    );
  });

  it('uses the issued proforma and PDF endpoints without local payment calculations', async () => {
    const proforma = {
      proformaId: 'proforma-OFF-TEST-001',
      number: 'PF-2026-TEST001',
      orderId: payload.orderId,
      issuedAt: '2026-08-12T12:00:00.000Z',
      dueDate: '2026-08-26T12:00:00.000Z',
      amountCzk: 14_970,
      variableSymbol: 'OFFTEST001',
      bankAccount: {
        accountNumber: '2303345128/2010',
        iban: 'CZ1520100000002303345128',
        bankName: 'Fio banka',
      },
      spdPayload: 'SPD*1.0*AM:14970.00*X-VS:OFFTEST001',
    };
    const request = async (input: RequestInfo | URL): Promise<Response> => {
      const url = String(input);
      return new Response(
        JSON.stringify(
          url.endsWith('/pdf')
            ? { attachment: { bytesBase64: 'JVBERi0=' } }
            : proforma,
        ),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    };

    assert.deepEqual(
      await issueDurableProforma(payload.orderId, request, 'http://127.0.0.1:4310'),
      proforma,
    );
    assert.equal(
      (await fetchDurableProformaPdf(payload.orderId, request, 'http://127.0.0.1:4310'))
        .attachment.bytesBase64,
      'JVBERi0=',
    );
  });
});
