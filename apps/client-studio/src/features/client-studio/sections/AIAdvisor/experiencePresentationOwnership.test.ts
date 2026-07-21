import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { composeExperience } from '@embed-engine/core/experience';

import {
  advisorIntroFromExperience,
  faqItemsFromExperience,
} from './experiencePresentation';
import { decisionReportPreviewFromExperience } from '../DecisionReportPreview/DecisionReportPreviewViewModel';
import { recommendationViewFromExperience } from '../PriorityEngine/RecommendationViewModel';

describe('Experience presentation ownership', () => {
  it('recommendation / FAQ / report preview project Experience only', () => {
    const layout = composeExperience({
      object: { id: 'house-modern-01' },
      priorities: { selected: ['layout'] },
    });
    const design = composeExperience({
      object: { id: 'house-modern-01' },
      priorities: { selected: ['design'] },
    });

    const recommendation = recommendationViewFromExperience(layout);
    assert.equal(recommendation.title, layout.title);
    assert.equal(recommendation.matchScore, layout.confidence.score);
    assert.deepEqual(
      recommendation.strengths,
      layout.evidence.map((item) => item.title),
    );
    assert.deepEqual(
      recommendation.considerations,
      layout.concerns.map((item) => item.title),
    );

    const faq = faqItemsFromExperience(layout);
    assert.equal(faq.length, layout.evidence.length);
    assert.equal(faq[0]?.question, layout.evidence[0]?.title);
    assert.equal(faq[0]?.answer, layout.evidence[0]?.description);
    assert.equal(advisorIntroFromExperience(layout), layout.summary);

    const preview = decisionReportPreviewFromExperience(layout);
    assert.equal(preview.title, layout.title);
    assert.equal(preview.summary, layout.summary);
    assert.deepEqual(preview.priorities, layout.focus);

    assert.notEqual(layout.title, design.title);
    assert.notDeepEqual(
      recommendationViewFromExperience(layout),
      recommendationViewFromExperience(design),
    );
    assert.notDeepEqual(
      faqItemsFromExperience(layout),
      faqItemsFromExperience(design),
    );
  });
});
