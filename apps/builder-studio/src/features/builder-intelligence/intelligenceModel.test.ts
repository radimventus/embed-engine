import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { gradeForScore } from '@embed-engine/intelligence';

import { buildBuilderIntelligenceModel } from './builderIntelligenceAdapter';
import { buildDecisionReadiness } from './decisionReadinessBridge';

describe('builderIntelligence adapter (EPIC-BX-12)', () => {
  it('delegates to Intelligence Core via Builder Adapter', () => {
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
    const model = buildBuilderIntelligenceModel({
      projectId: 'quality-test',
      snapshot: null,
      validationReport: null,
    });
    const quality = model.coaches.find((coach) => coach.id === 'quality');
    assert.ok(quality);
    assert.ok(quality.findings.some((item) => item.id.includes('hero')));
    assert.ok(
      quality.findings.some(
        (item) =>
          item.nav === 'media-studio' ||
          item.nav === 'rooms' ||
          item.nav === 'plans',
      ),
    );
  });

  it('Conversion Coach evaluates Experience structure only', () => {
    const model = buildBuilderIntelligenceModel({
      projectId: 'conversion-test',
      snapshot: null,
      validationReport: null,
    });
    const conversion = model.coaches.find((coach) => coach.id === 'conversion');
    assert.ok(conversion);
    assert.equal(conversion.id, 'conversion');
    assert.ok(
      conversion.findings.every(
        (item) => item.nav === 'experience' || item.nav === 'knowledge',
      ),
    );
  });

  it('Knowledge Coach uses rules for energy/heating/financing', () => {
    const model = buildBuilderIntelligenceModel({
      projectId: 'knowledge-coach-test',
      snapshot: null,
      validationReport: null,
    });
    const knowledge = model.coaches.find((coach) => coach.id === 'knowledge');
    assert.ok(knowledge);
    assert.ok(
      knowledge.findings.some(
        (item) =>
          item.id.includes('heating') ||
          item.id.includes('financing') ||
          item.id.includes('energy') ||
          item.id.includes('knowledge'),
      ),
    );
  });

  it('Decision Coach checks path and persona coverage', () => {
    const model = buildBuilderIntelligenceModel({
      projectId: 'decision-coach-test',
      snapshot: null,
      validationReport: null,
    });
    const decision = model.coaches.find((coach) => coach.id === 'decision');
    assert.ok(decision);
    assert.equal(decision.id, 'decision');
    assert.ok(typeof decision.score === 'number');
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
