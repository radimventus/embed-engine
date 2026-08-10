import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  AUDIT_HERO_FREEZE,
  AUDIT_HERO_TITLE_MAX_CHARS,
  resolveAuditHero,
} from './auditHeroPresentation';

const here = dirname(fileURLToPath(import.meta.url));

function read(name: string): string {
  return readFileSync(join(here, name), 'utf8');
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('Audit Freeze shell (CAP UX 42)', () => {
  it('restores land panels and simple Freeze form', () => {
    const shell = stripComments(read('AuditLeadCapture.tsx'));
    assert.match(shell, /SituationSelect/);
    assert.match(shell, /AssessmentWorkflow/);
    assert.match(shell, /AuditContact/);
    assert.match(shell, /audit-lead-capture/);
    assert.match(shell, /audit-final-footer/);
    assert.match(shell, /CONIS • Conversion Intelligence System/);
    assert.match(shell, /Radim Věntus/);
    assert.equal(shell.includes('ConversionContextStrip'), false);
    assert.equal(shell.includes('ConversionCtaSelect'), false);
    assert.equal(shell.includes('ConversionLeadForm'), false);
    assert.equal(shell.includes('commercial-conversion'), false);

    const panel = read('audit-panel.ts');
    assert.match(panel, /MÁM POZEMEK/);
    assert.match(panel, /HLEDÁM POZEMEK/);
    assert.match(panel, /LAND_OPTIONS/);
    assert.match(panel, /WORKFLOW_BY_LAND/);
    assert.match(panel, /AUDIT_ACCENT = colors\.brand\.gold/);
    assert.match(panel, /AUDIT_PRIVACY_HREF/);
    assert.equal(panel.includes('webpartnera.cz'), false);

    const form = stripComments(read('AuditContact.tsx'));
    assert.match(form, /ODESLAT POPTÁVKU/);
    assert.match(form, /mailto:/);
    assert.match(form, /AUDIT_PRIVACY_HREF/);
    assert.equal(form.includes('COMMERCIAL_CONSENT'), false);
  });

  it('keeps land selection state and scrolls to the assessment workflow', () => {
    const shell = stripComments(read('AuditLeadCapture.tsx'));
    const select = stripComments(read('SituationSelect.tsx'));
    const workflow = stripComments(read('AssessmentWorkflow.tsx'));

    assert.match(shell, /setLandOption\(value\)/);
    assert.match(shell, /scrollToSection\(AUDIT_ASSESSMENT_WORKFLOW_ID\)/);
    assert.match(select, /onClick=\{\(\) => onChange\(option\.value\)\}/);
    assert.match(workflow, /AUDIT_ASSESSMENT_WORKFLOW_ID = 'audit-assessment-workflow'/);
    assert.match(workflow, /id=\{AUDIT_ASSESSMENT_WORKFLOW_ID\}/);
  });

  it('limits intelligence to the three hero lines', () => {
    const transition = stripComments(read('AuditTransition.tsx'));
    assert.match(transition, /resolveAuditHero/);
    assert.match(transition, /audit-hero-title/);
    assert.match(transition, /audit-hero-subtitle/);
    assert.match(transition, /audit-hero-highlight/);

    assert.equal(AUDIT_HERO_FREEZE.title, 'Tento dům vás zaujal.');
    assert.ok(AUDIT_HERO_FREEZE.title.length <= AUDIT_HERO_TITLE_MAX_CHARS);

    const freeze = resolveAuditHero();
    assert.deepEqual(freeze, AUDIT_HERO_FREEZE);
    assert.ok(freeze.title.length <= AUDIT_HERO_TITLE_MAX_CHARS);
    assert.equal(freeze.title.includes('. '), false);

    const withPlot = resolveAuditHero({ priorityIds: ['plot', 'layout'] });
    assert.notEqual(withPlot.title, AUDIT_HERO_FREEZE.title);
    assert.ok(withPlot.title.length <= AUDIT_HERO_TITLE_MAX_CHARS);
    assert.equal(withPlot.title.includes('. '), false);

    const withRecommendation = resolveAuditHero({
      recommendation: 'value-led-exploration',
    });
    assert.equal(withRecommendation.title, 'A teď poslední krok.');
    assert.ok(withRecommendation.title.length <= AUDIT_HERO_TITLE_MAX_CHARS);
    assert.equal(withRecommendation.title.includes('. '), false);
  });

  it('keeps Audit presentation-only — no Runtime dispatch in section', () => {
    const files = readdirSync(here).filter(
      (name) =>
        (name.endsWith('.tsx') || name.endsWith('.ts')) &&
        !name.endsWith('.test.ts'),
    );

    for (const name of files) {
      const source = stripComments(read(name));
      assert.equal(
        source.includes('dispatch('),
        false,
        `${name} must not dispatch Runtime commands`,
      );
      assert.equal(
        source.includes('composeDecision'),
        false,
        `${name} must not compose semantics`,
      );
    }
  });
});
