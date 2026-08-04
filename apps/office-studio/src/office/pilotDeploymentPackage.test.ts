/**
 * PT-18 — Pilot Deployment Preparation package validation.
 * Docs-only CAP — asserts deliverables exist and cover required ops sections.
 */

import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(
  here,
  '../../../../docs/platform/office/pilot-deployment',
);

function read(name: string): string {
  return readFileSync(join(packageRoot, name), 'utf8');
}

describe('PT-18 pilot deployment package', () => {
  it('ships all deployment deliverables with required operational coverage', () => {
    const required = [
      'README.md',
      'pilot-configuration-template.md',
      'pilot-configuration.template.json',
      'deployment-checklist.md',
      'monitoring-checklist.md',
      'rollback-plan.md',
      'pilot-handbook.md',
    ] as const;

    for (const file of required) {
      assert.ok(
        existsSync(join(packageRoot, file)),
        `missing deliverable ${file}`,
      );
    }

    const config = read('pilot-configuration-template.md');
    assert.match(config, /Partner identity|partnerId/i);
    assert.match(config, /Mailbox|mailboxId|SMTP/i);
    assert.match(config, /Branding/i);
    assert.match(config, /workflow|waiting_payment|pilot_ready/i);
    assert.match(config, /electronic_order|Document/i);
    assert.match(config, /Starter|package/i);

    const json = JSON.parse(read('pilot-configuration.template.json')) as {
      partner: { partnerId: string; contactEmail: string };
      mailbox: { mailboxId: string };
      workflow: { statusPath: string[] };
      documents: { types: string[] };
      packages: { defaultPackageName: string };
    };
    assert.equal(json.partner.partnerId, 'p-dse');
    assert.ok(json.partner.contactEmail.includes('@'));
    assert.equal(json.mailbox.mailboxId, 'mbx-conis-contact');
    assert.ok(json.workflow.statusPath.includes('pilot_ready'));
    assert.ok(json.documents.types.includes('electronic_order'));
    assert.equal(json.packages.defaultPackageName, 'Starter');

    const deploy = read('deployment-checklist.md');
    assert.match(deploy, /SMTP/);
    assert.match(deploy, /IMAP/);
    assert.match(deploy, /DNS/);
    assert.match(deploy, /SSL/);
    assert.match(deploy, /Document Runtime/);
    assert.match(deploy, /Automation Runtime/);
    assert.match(deploy, /Office configuration/);
    assert.match(deploy, /Offer configuration/);
    assert.match(deploy, /without oral briefing|ústního/i);

    const monitor = read('monitoring-checklist.md');
    assert.match(monitor, /Workflow Runtime/);
    assert.match(monitor, /Business Automation/);
    assert.match(monitor, /Mail Session/);
    assert.match(monitor, /Conversation Runtime/);
    assert.match(monitor, /Document Runtime/);
    assert.match(monitor, /Office Tasks/);
    assert.match(monitor, /\*\*Verification\*\*/);
    assert.match(monitor, /\*\*Expected state\*\*/);
    assert.match(monitor, /\*\*Diagnostic\*\*/);

    const rollback = read('rollback-plan.md');
    assert.match(rollback, /Rollback Procedure/);
    assert.match(rollback, /Partner data is retained|data is retained/i);
    assert.match(rollback, /Failed deployment|failed deployment/i);
    assert.match(rollback, /configuration/i);
    assert.match(rollback, /SMTP|Mail|communication/i);
    assert.match(rollback, /last known-good|last functional/i);

    const handbook = read('pilot-handbook.md');
    assert.match(handbook, /Pilot Operations Handbook/);
    assert.match(handbook, /Deployment procedure|postup nasazení/i);
    assert.match(handbook, /OfferAccepted|smoke/i);
    assert.match(handbook, /Common issues|běžných problém/i);
    assert.match(handbook, /Contact|kontakt/i);
    assert.match(handbook, /Post-deployment checklist/);
    assert.match(handbook, /without improvisation|improviz|without oral/i);

    const index = read('README.md');
    assert.match(index, /Deployment Checklist/);
    assert.match(index, /Monitoring Checklist/);
    assert.match(index, /Rollback Procedure/);
    assert.match(index, /Pilot Operations Handbook/);
    assert.match(index, /Configuration Template/);
    assert.match(index, /Handover/);
  });
});
