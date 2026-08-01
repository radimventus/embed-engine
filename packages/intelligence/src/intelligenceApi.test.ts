import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  analyzeViaBuilderAdapter,
  analyzeViaManagerAdapter,
  analyzeViaSalesAdapter,
  createEmptyIntelligenceContext,
  gradeForScore,
  type IntelligenceProjectContext,
} from './index';
import {
  analyzeProject,
  buildInsights,
  buildRecommendations,
  computeDecisionScore,
  buildDecisionReadiness,
} from './api/intelligenceApi';
import { EXPERIENCE_MODULE_CATALOG_FIXTURE } from './fixtures/defaultExperienceFixture';

function defaultExperienceContext(
  projectId: string,
): IntelligenceProjectContext {
  const empty = createEmptyIntelligenceContext(projectId);
  return {
    ...empty,
    experience: {
      modules: EXPERIENCE_MODULE_CATALOG_FIXTURE.map((module) => ({
        id: module.id,
        label: module.label,
        enabled: true,
      })),
      faqItems: [
        {
          question: 'Jak Experience pomáhá s rozhodováním?',
          answer: 'Provede vás prioritami.',
        },
        {
          question: 'Mohu se vrátit k prohlídce?',
          answer: 'Ano.',
        },
      ],
      heroCta: 'Začít',
      priorityEnabled: true,
    },
    media: {
      heroAlt: '',
      documentTitles: ['Bungalov 4KK'],
      documentUrls: ['/docs/technical.pdf'],
      energyClass: 'B',
    },
    knowledge: {
      categories: [
        {
          id: 'energy',
          label: 'Energie',
          health: 'complete',
          itemCount: 1,
          summary: 'ok',
        },
        {
          id: 'financing',
          label: 'Financování',
          health: 'partial',
          itemCount: 1,
          summary: 'pouze cena',
        },
      ],
      completeCount: 1,
      partialCount: 1,
      missingCount: 0,
    },
  };
}

describe('intelligenceApi (EPIC-BX-12)', () => {
  it('builds four deterministic coaches without LLM', () => {
    const model = analyzeProject(defaultExperienceContext('intel-test'));
    assert.equal(model.coaches.length, 4);
    assert.ok(model.coaches.every((coach) => typeof coach.score === 'number'));
    assert.ok(Array.isArray(model.recommendations));
    assert.ok(Array.isArray(model.insights));
  });

  it('Quality Coach recommends on missing hero/gallery', () => {
    const model = analyzeProject(defaultExperienceContext('quality-test'));
    const quality = model.coaches.find((coach) => coach.id === 'quality');
    assert.ok(quality);
    assert.ok(quality.findings.some((item) => item.id.includes('hero')));
    assert.ok(
      quality.findings.some(
        (item) =>
          item.target === 'media-studio' ||
          item.target === 'rooms' ||
          item.target === 'plans',
      ),
    );
  });

  it('Conversion Coach evaluates Experience structure only', () => {
    const model = analyzeProject(defaultExperienceContext('conversion-test'));
    const conversion = model.coaches.find((coach) => coach.id === 'conversion');
    assert.ok(conversion);
    assert.equal(conversion.id, 'conversion');
    assert.ok(
      conversion.findings.every(
        (item) => item.target === 'experience' || item.target === 'knowledge',
      ),
    );
  });

  it('Knowledge Coach uses rules for energy/heating/financing', () => {
    const model = analyzeProject(defaultExperienceContext('knowledge-coach-test'));
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
    const model = analyzeProject(defaultExperienceContext('decision-coach-test'));
    const decision = model.coaches.find((coach) => coach.id === 'decision');
    assert.ok(decision);
    assert.equal(decision.id, 'decision');
    assert.ok(typeof decision.score === 'number');
  });

  it('Decision Readiness produces score and grade from pillars', () => {
    const readiness = buildDecisionReadiness(
      defaultExperienceContext('readiness-intel'),
    );
    assert.equal(readiness.pillars.length, 6);
    assert.ok(readiness.score >= 0 && readiness.score <= 100);
    assert.equal(gradeForScore(94), 'A');
    assert.equal(gradeForScore(81), 'B');
  });

  it('public API surfaces recommendations, score and insights', () => {
    const ctx = defaultExperienceContext('api-surface');
    const recommendations = buildRecommendations(ctx);
    const insights = buildInsights(ctx);
    const score = computeDecisionScore(ctx);
    assert.ok(recommendations.length > 0);
    assert.ok(insights.length > 0);
    assert.equal(score.max, 100);
    assert.ok(score.value >= 0 && score.value <= 100);
  });

  it('Builder, Manager and Sales adapters share the same engine', () => {
    const ctx = defaultExperienceContext('adapter-parity');
    const builder = analyzeViaBuilderAdapter(ctx);
    const manager = analyzeViaManagerAdapter(ctx);
    const sales = analyzeViaSalesAdapter(ctx);
    assert.deepEqual(builder.recommendations, manager.recommendations);
    assert.deepEqual(manager.score, sales.score);
    assert.equal(builder.coaches.length, sales.coaches.length);
  });

  it('recommendations expose editor targets', () => {
    const model = analyzeProject(defaultExperienceContext('rec-nav-test'));
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
        ].includes(item.target),
      );
    }
  });
});
