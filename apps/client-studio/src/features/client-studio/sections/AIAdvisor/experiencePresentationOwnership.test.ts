import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { REFERENCE_HOUSE_PACKAGE } from '@embed-engine/object-house';
import {
  createFixedClock,
  createDecisionSessionRuntime,
} from '@embed-engine/runtime';

import {
  advisorIntroFromAiContext,
  faqItemsFromAiContext,
} from './experiencePresentation';
import { decisionReportPreviewFromTerminal } from '../DecisionReportPreview/DecisionReportPreviewViewModel';
import { recommendationViewFromTerminal } from '../PriorityEngine/RecommendationViewModel';

describe('Runtime presentation ownership (ED-DA-01R)', () => {
  it('recommendation / FAQ / report preview project Terminal / AIContext only', () => {
    const layoutRuntime = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    layoutRuntime.dispatch(
      { type: 'ChangePriority', priorityIds: ['layout'] },
      2,
    );

    const designRuntime = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    designRuntime.dispatch(
      { type: 'ChangePriority', priorityIds: ['design'] },
      2,
    );

    const layout = layoutRuntime.getExperience()!.context.decision;
    const design = designRuntime.getExperience()!.context.decision;

    const recommendation = recommendationViewFromTerminal(layout.terminal);
    assert.equal(recommendation.title, layout.terminal.outcome.recommendation);
    assert.equal(recommendation.matchScore, layout.terminal.outcome.confidence);
    assert.deepEqual(
      recommendation.strengths,
      layout.terminal.outcome.rationale,
    );
    assert.deepEqual(
      recommendation.considerations,
      layout.terminal.outcome.unresolvedQuestions,
    );

    const faq = faqItemsFromAiContext(layout.ai);
    assert.equal(faq.length, layout.ai.outcome.rationale.length);
    assert.equal(faq[0]?.question, layout.ai.outcome.rationale[0]);
    assert.equal(faq[0]?.answer, layout.ai.outcome.status);
    assert.equal(
      advisorIntroFromAiContext(layout.ai),
      layout.ai.outcome.recommendation,
    );

    const preview = decisionReportPreviewFromTerminal(layout.terminal);
    assert.equal(preview.title, layout.terminal.outcome.recommendation);
    assert.equal(preview.summary, layout.terminal.outcome.status);
    assert.deepEqual(
      preview.priorities,
      layout.terminal.outcome.completedMoveIds,
    );

    assert.notEqual(
      layout.terminal.outcome.recommendation,
      design.terminal.outcome.recommendation,
    );
    assert.notDeepEqual(
      recommendationViewFromTerminal(layout.terminal),
      recommendationViewFromTerminal(design.terminal),
    );
    assert.notDeepEqual(
      faqItemsFromAiContext(layout.ai),
      faqItemsFromAiContext(design.ai),
    );
  });
});
