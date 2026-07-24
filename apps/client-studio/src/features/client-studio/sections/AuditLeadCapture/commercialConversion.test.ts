import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  COMMERCIAL_CTAS,
  enabledCommercialCtas,
  findCommercialCta,
} from '../../pilot/commercialConversion';
import { createTestBuilderRuntime } from '../../runtime/builderPackageTestInstall';
import {
  buildConversionRuntimeSnapshot,
  formatSnapshotForMailto,
} from './ConversionContextStrip';

const here = dirname(fileURLToPath(import.meta.url));

function read(name: string): string {
  return readFileSync(join(here, name), 'utf8');
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('Commercial Conversion (CSCB-07)', () => {
  it('exposes configurable enabled CTAs', () => {
    const enabled = enabledCommercialCtas();
    assert.ok(enabled.length >= 4);
    assert.deepEqual(
      enabled.map((cta) => cta.id),
      COMMERCIAL_CTAS.filter((cta) => cta.enabled).map((cta) => cta.id),
    );
    assert.equal(findCommercialCta('request-offer')?.labelCs, 'Vyžádat nabídku');
  });

  it('projects Runtime snapshot without reinterpretation', () => {
    const runtime = createTestBuilderRuntime();
    runtime.dispatch(
      { type: 'ChangePriority', priorityIds: ['energy', 'layout', 'plot'] },
      2,
    );
    const decision = runtime.getExperience()!.context.decision;
    const snapshot = buildConversionRuntimeSnapshot({
      recommendation: decision.terminal.outcome.recommendation,
      status: decision.terminal.outcome.status,
      focusRoomName: decision.focus.focusRoomName,
      focusReason: decision.focus.focusReason,
      priorityIds: decision.priorityIds,
      recommendedNextAction: decision.terminal.outcome.recommendedNextAction,
      terminalId: decision.terminal.id,
    });

    assert.equal(snapshot.recommendation, decision.terminal.outcome.recommendation);
    assert.deepEqual(snapshot.priorityIds, ['energy', 'layout', 'plot']);
    assert.equal(snapshot.terminalId, decision.terminal.id);

    const mailto = formatSnapshotForMailto(snapshot);
    assert.match(mailto, /Kontext rozhodnutí/);
    assert.match(mailto, /Terminal:/);
    assert.match(mailto, /Energie/);
  });

  it('conversion UI is presentation + transport only', () => {
    const files = readdirSync(here).filter(
      (name) =>
        (name.endsWith('.tsx') || name.endsWith('.ts')) &&
        !name.endsWith('.test.ts') &&
        !name.includes('SituationSelect') &&
        !name.includes('AssessmentWorkflow') &&
        !name.includes('AuditContact'),
    );

    for (const name of files) {
      const source = stripComments(read(name));
      assert.equal(
        source.includes('getDecisionFactors'),
        false,
        `${name} must not compute decision factors`,
      );
      assert.equal(
        source.includes('composeDecision'),
        false,
        `${name} must not compose semantics`,
      );
      assert.equal(
        source.includes('dispatch('),
        false,
        `${name} must not dispatch Runtime commands`,
      );
      assert.equal(
        /crm|leadScore|eligibility/i.test(source),
        false,
        `${name} must not contain CRM/scoring logic`,
      );
    }

    const shell = read('AuditLeadCapture.tsx');
    assert.match(shell, /ConversionContextStrip/);
    assert.match(shell, /ConversionCtaSelect/);
    assert.match(shell, /ConversionLeadForm/);
    assert.match(shell, /commercial-conversion/);

    const form = read('ConversionLeadForm.tsx');
    assert.match(form, /mailto:/);
    assert.match(form, /conversion-consent/);
    assert.match(form, /COMMERCIAL_CONSENT_TEXT_CS/);
  });
});
