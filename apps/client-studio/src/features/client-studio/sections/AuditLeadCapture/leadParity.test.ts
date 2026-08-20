import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const clientRoot = join(here, '../../../..');
const repoRoot = join(clientRoot, '../../..');

function read(path: string): string {
  return readFileSync(join(repoRoot, path), 'utf8');
}

describe('TASK 49 durable lead delivery parity', () => {
  it('Audit consumes canonical Client runtime Project privacy context', () => {
    const source = read(
      'apps/client-studio/src/features/client-studio/' +
        'sections/AuditLeadCapture/AuditContact.tsx',
    );

    assert.match(source, /useDecisionSessionRuntime/);
    assert.match(source, /analyticsScope/);
    assert.match(source, /company/);
    assert.match(source, /company\.companyId/);
    assert.match(source, /project\.privacyUrl/);
    assert.match(source, /submitDurableLead/);

    assert.equal(
      source.includes('@embed-engine/platform-access'),
      false,
      'Audit UI must not import authoritative registry/platform data directly',
    );

    assert.equal(
      source.includes('await fetch('),
      false,
      'Audit UI must use the shared durable submission helper',
    );
  });

  it('Client Provider derives Project privacy from canonical Project binding', () => {
    const source = read(
      'apps/client-studio/src/features/client-studio/' +
        'runtime/DecisionSessionRuntimeProvider.tsx',
    );

    assert.match(
      source,
      /companyId:\s*projectBind\.project\.partner\.companyId/,
    );

    assert.match(
      source,
      /privacyUrl:\s*projectBind\.project\.project\.privacyUrl/,
    );

    assert.match(source, /hydrateDurableProjectPrivacy/);
    assert.match(source, /hydrateDurableCompanyContact/);

    assert.equal(
      source.includes('privacyUrl: window'),
      false,
    );

    assert.equal(
      source.includes('privacyUrl: root.dataset'),
      false,
    );

    assert.equal(
      source.includes('partner.privacyUrl'),
      false,
    );
    assert.equal(source.includes('kontakt@astav.cz'), false);
    assert.equal(source.includes('data-contact-phone'), false);
    assert.equal(source.includes('data-contact-email'), false);
  });

  it('durable lead helper owns the single public lead endpoint', () => {
    const helper = read(
      'apps/client-studio/src/features/client-studio/' +
        'sections/AuditLeadCapture/durableLeadSubmission.ts',
    );

    assert.match(helper, /\/public\/leads/);
    assert.match(helper, /createDurableLeadPayload/);
    assert.match(helper, /response\.ok/);

    const audit = read(
      'apps/client-studio/src/features/client-studio/' +
        'sections/AuditLeadCapture/AuditContact.tsx',
    );

    assert.equal(audit.includes('/public/leads'), false);
  });

  it('Workspace Host does not own a separate privacy or lead transport channel', () => {
    const source = read(
      'apps/workspace-host/src/WorkspaceHostApp.tsx',
    );

    assert.equal(source.includes('/public/leads'), false);
    assert.equal(source.includes('privacyUrl='), false);
    assert.equal(source.includes('data-client-privacy'), false);
    assert.equal(source.includes('contactPhone='), false);
    assert.equal(source.includes('contactEmail='), false);
  });

  it('Embed launcher does not expose caller-controlled privacy configuration', () => {
    const embedRoot = join(repoRoot, 'packages/embed/src');
    const files = [
      'index.ts',
      'mount.ts',
      'Embed.ts',
    ];

    const existing = files
      .map((name) => {
        try {
          return readFileSync(join(embedRoot, name), 'utf8');
        } catch {
          return '';
        }
      })
      .join('\n');

    assert.equal(
      /privacyUrl\s*[?:]/.test(existing),
      false,
      'public Embed API must not expose privacyUrl as caller authority',
    );
    assert.equal(
      /contactPhone|contactEmail|partnerPhone|partnerEmail/.test(existing),
      false,
      'public Embed API must not expose caller-controlled contact',
    );
  });
});
