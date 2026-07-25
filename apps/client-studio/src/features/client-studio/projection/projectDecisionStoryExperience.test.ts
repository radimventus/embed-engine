import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { projectPriorityPipelineStory } from '@embed-engine/runtime';

import {
  projectDecisionStoryExperience,
  projectExperienceFromPriorityIds,
} from './projectDecisionStoryExperience';

describe('PT-002 Decision Story Experience Projection', () => {
  it('projects interpretation, section order, and highlight from Decision Story', () => {
    const story = projectPriorityPipelineStory(
      ['energy', 'layout', 'privacy'],
      10,
    );
    const projection = projectDecisionStoryExperience(story);

    assert.equal(projection.story.primaryPriority, 'energy');
    assert.equal(projection.story.secondaryPriority, 'layout');
    assert.match(projection.interpretation.headline, /Energie/i);
    assert.match(projection.interpretation.body, /energet/i);
    assert.equal(projection.interpretation.primaryLabel, 'Energie');
    assert.equal(projection.highlight.primaryPriorityId, 'energy');
    assert.ok(projection.highlight.relatedPriorityIds.includes('operating-costs'));
    assert.equal(projection.recommendedSectionOrder[0]?.id, 'ai-advisor');
    assert.match(
      projection.recommendedSectionOrder[0]?.label ?? '',
      /energie/i,
    );
  });

  it('energy vs design projections are visibly different (PT-002 validation)', () => {
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
      energy.recommendedSectionOrder.map((s) => s.label),
      design.recommendedSectionOrder.map((s) => s.label),
    );
    assert.equal(energy.highlight.primaryPriorityId, 'energy');
    assert.equal(design.highlight.primaryPriorityId, 'design');
    assert.notDeepEqual(
      energy.highlight.relatedPriorityIds,
      design.highlight.relatedPriorityIds,
    );
  });

  it('does not invent primary when Decision Story is empty', () => {
    const projection = projectExperienceFromPriorityIds([]);
    assert.equal(projection.story.primaryPriority, null);
    assert.equal(projection.highlight.primaryPriorityId, null);
    assert.equal(projection.interpretation.primaryLabel, null);
    assert.equal(projection.recommendedSectionOrder.length, 3);
  });
});
