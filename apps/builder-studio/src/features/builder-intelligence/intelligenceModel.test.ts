import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildBuilderIntelligenceModel } from './intelligenceModel';
import { buildConversionCoach } from './conversionCoach';
import { buildDecisionCoach } from './decisionCoach';
import { buildDecisionReadiness, gradeForScore } from './decisionReadiness';
import { buildKnowledgeCoach } from './knowledgeCoach';
import { buildQualityCoach } from './qualityCoach';

describe('builderIntelligence (EPIC-BX-09)', () => {
  it('builds four deterministic coaches without LLM', () => {
    const model = buildBuilderIntelligenceModel({
      projectId: 'intel-test',
      snapshot: null,
      validationReport: null,
    });
    assert.equal(model.coaches.length, 4);
    assert.ok(model.coaches.every((coach) => typeof coach.score === 'number'));
    assert.ok(Array.isArray(model.recommendations));
  });

  it('Quality Coach recommends on missing hero/gallery', () => {
    const report = buildQualityCoach({
      projectId: 'quality-test',
      snapshot: null,
    });
    assert.ok(report.findings.some((item) => item.id.includes('hero')));
    assert.ok(report.findings.some((item) => item.nav === 'media-studio' || item.nav === 'rooms' || item.nav === 'plans'));
  });

  it('Conversion Coach evaluates Experience structure only', () => {
    const report = buildConversionCoach({
      projectId: 'conversion-test',
      snapshot: null,
    });
    assert.equal(report.id, 'conversion');
    assert.ok(report.findings.every((item) => item.nav === 'experience' || item.nav === 'knowledge'));
  });

  it('Knowledge Coach uses rules for energy/heating/financing', () => {
    const report = buildKnowledgeCoach({
      projectId: 'knowledge-coach-test',
      snapshot: null,
    });
    assert.ok(
      report.findings.some(
        (item) =>
          item.id.includes('heating') ||
          item.id.includes('financing') ||
          item.id.includes('energy') ||
          item.id.includes('knowledge'),
      ),
    );
  });

  it('Decision Coach checks path and persona coverage', () => {
    const report = buildDecisionCoach({
      projectId: 'decision-coach-test',
      snapshot: null,
    });
    assert.equal(report.id, 'decision');
    assert.ok(typeof report.score === 'number');
  });

  it('Decision Readiness produces score and grade from pillars', () => {
    const readiness = buildDecisionReadiness({
      projectId: 'readiness-intel',
      snapshot: null,
      validationReport: null,
    });
    assert.equal(readiness.pillars.length, 6);
    assert.ok(readiness.score >= 0 && readiness.score <= 100);
    assert.equal(gradeForScore(94), 'A');
    assert.equal(gradeForScore(81), 'B');
  });

  it('recommendations open editors via nav targets', () => {
    const model = buildBuilderIntelligenceModel({
      projectId: 'rec-nav-test',
      snapshot: null,
      validationReport: null,
    });
    for (const item of model.recommendations) {
      assert.ok(
        [
          'media-studio',
          'experience',
          'knowledge',
          'rooms',
          'plans',
          'preview-center',
          'gallery',
          'overview',
        ].includes(item.nav),
      );
    }
  });
});
