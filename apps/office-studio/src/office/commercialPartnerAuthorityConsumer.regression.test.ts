import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

function source(relative: string): string {
  return readFileSync(join(here, relative), 'utf8');
}

test(
  'durable Office Partner authority invalidates every customer consumer',
  () => {
    const context = source('./PilotWorkspaceContext.tsx');
    const complete = source(
      '../features/pilot-workspace/terminal/CompleteOrderScreen.tsx',
    );
    const payment = source(
      '../features/pilot-workspace/terminal/PaymentScreen.tsx',
    );

    // Provider owns the async authority transition.
    assert.match(context, /hydrateOfficePartnersFromServer/);
    assert.match(
      context,
      /setPartnerAuthorityRevision\(\(current\) => current \+ 1\)/,
    );

    // Revision must be part of shared context, not a disconnected local state.
    assert.match(
      context,
      /readonly partnerAuthorityRevision: number/,
    );
    assert.match(
      context,
      /partnerAuthorityRevision,/,
    );

    // Existing order screen must discard seed-derived customer state
    // after durable Partner authority arrives even when project id is unchanged.
    assert.match(
      complete,
      /activeCase\.id,[\s\S]*partnerAuthorityReady,[\s\S]*partnerAuthorityRevision/,
    );

    // Existing payment/proforma must be rebuilt for the same case
    // when the customer authority changes.
    assert.match(
      payment,
      /\[activeCase, partnerAuthorityReady, partnerAuthorityRevision\]/,
    );
  },
);
