import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { FileOrderRepository } from './orderRepository';
import { FileProformaRepository } from './proformaRepository';

test('stores and invoices the introductory sales-video product for 9 970 CZK', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'prodejni-video-order-'));
  const orderPath = join(directory, 'orders.json');
  const proformaPath = join(directory, 'proformas.json');
  const now = () => new Date('2026-10-14T10:00:00.000Z');

  try {
    const orders = new FileOrderRepository(orderPath);
    const created = await orders.create({
      orderId: 'prodejni-video-test-001',
      offerSlug: 'realivideo',
      companyId: 'company-realivideo',
      partnerId: 'partner-realivideo',
      createdAt: now().toISOString(),
      partner: {
        partnerName: 'Jan Test',
        companyName: 'Test s.r.o.',
        contactName: 'Jan Test',
        email: 'test@example.cz',
        phone: '+420 700 000 000',
        ico: '27082440',
        address: 'Praha',
      },
      package: {
        id: 'prodejni-video-9970-intro',
        name: 'Prodejní video + tuning 6 obrázků',
        licenseLabel: 'Prodejní video pro web a sociální sítě',
        trialDays: 0,
      },
      priceCzk: 9_970,
      termsVersion: 'realivideo-v1',
      termsAcceptedAt: now().toISOString(),
    });

    const proformas = new FileProformaRepository(proformaPath, now);
    const issued = await proformas.issue(created);
    const reloaded = await new FileProformaRepository(proformaPath, now).getByOrderId(created.orderId);

    assert.equal(created.package.id, 'prodejni-video-9970-intro');
    assert.equal(created.priceCzk, 9_970);
    assert.equal(issued.proforma.amountCzk, 9_970);
    assert.equal(issued.proforma.bankAccount.accountNumber, '3452548011/3030');
    assert.equal(issued.proforma.bankAccount.iban, 'CZ3530300000003452548011');
    assert.match(issued.proforma.spdPayload, /AM:9970\.00/);
    assert.match(issued.proforma.spdPayload, /X-VS:20260010/);
    assert.deepEqual(reloaded, issued.proforma);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
