import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildDecisionContext,
  projectPriorityPipelineStory,
} from '@embed-engine/runtime';

import {
  projectExperienceFromDecisionContext,
  projectExperienceFromPriorityIds,
} from './projectDecisionStoryExperience';

describe('PT-003 Experience reads Decision Context', () => {
  it('projection texts come from DecisionContext only', () => {
    const story = projectPriorityPipelineStory(
      ['energy', 'layout', 'privacy'],
      10,
    );
    const context = buildDecisionContext(story);
    const projection = projectExperienceFromDecisionContext(context);

    assert.equal(projection.interpretation.headline, context.headline);
    assert.equal(projection.interpretation.body, context.summary);
    assert.deepEqual(
      projection.recommendedSectionOrder.map((s) => s.label),
      [...context.recommendations],
    );
    assert.equal(projection.highlight.primaryPriorityId, context.focusPriority);
    assert.equal(projection.context, context);
  });

  it('energy vs design Context projections differ without UI rules', () => {
    const energy = projectExperienceFromPriorityIds([
      'energy',
      'layout',
      'privacy',
    ]);
    const design = projectExperienceFromPriorityIds([
      'design',
      'layout',
      'privacy',
    ]);

    assert.notEqual(
      energy.interpretation.headline,
      design.interpretation.headline,
    );
    assert.notEqual(energy.interpretation.body, design.interpretation.body);
    assert.notDeepEqual(
      energy.context.recommendations,
      design.context.recommendations,
    );
    assert.equal(energy.context.focusPriority, 'energy');
    assert.equal(design.context.focusPriority, 'design');
  });
});
