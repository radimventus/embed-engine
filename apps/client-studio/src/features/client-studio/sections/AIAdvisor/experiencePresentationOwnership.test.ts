import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  formatDecisionKeyCs,
} from '../../pilot/decisionTerminalLabels';
import { formatOutcomeStatusCs } from '../../pilot/pilotVocabulary';
import { createTestBuilderRuntime } from '../../runtime/builderPackageTestInstall';
import {
  advisorIntroFromAiContext,
  faqItemsForExperience,
  faqItemsFromAiContext,
} from './experiencePresentation';
import { decisionReportPreviewFromTerminal } from '../DecisionReportPreview/DecisionReportPreviewViewModel';
import { recommendationViewFromTerminal } from '../PriorityEngine/RecommendationViewModel';
import { coachFaqItemsFromPriorities } from '../PriorityEngine/priorityCoachingDialogue';

describe('Runtime presentation ownership (ED-DA-01R)', () => {
  it('recommendation / FAQ / report preview project Terminal / AIContext only', () => {
    const layoutRuntime = createTestBuilderRuntime();
    layoutRuntime.dispatch(
      { type: 'ChangePriority', priorityIds: ['layout'] },
      2,
    );

    const designRuntime = createTestBuilderRuntime();
    designRuntime.dispatch(
      { type: 'ChangePriority', priorityIds: ['design'] },
      2,
    );

    const layout = layoutRuntime.getExperience()!.context.decision;
    const design = designRuntime.getExperience()!.context.decision;

    const recommendation = recommendationViewFromTerminal(layout.terminal);
    assert.equal(
      recommendation.title,
      formatDecisionKeyCs(layout.terminal.outcome.recommendation),
    );
    assert.equal(
      recommendation.matchScore,
      Math.round(layout.terminal.outcome.confidence * 100),
    );
    assert.deepEqual(
      recommendation.strengths,
      layout.terminal.outcome.rationale.map((key) => formatDecisionKeyCs(key)),
    );
    assert.deepEqual(
      recommendation.considerations,
      layout.terminal.outcome.unresolvedQuestions.map((key) =>
        formatDecisionKeyCs(key),
      ),
    );

    const faq = faqItemsFromAiContext(layout.ai);
    assert.equal(faq.length, layout.ai.outcome.rationale.length);
    assert.equal(
      faq[0]?.question,
      formatDecisionKeyCs(layout.ai.outcome.rationale[0]!),
    );
    assert.equal(
      faq[0]?.answer,
      formatOutcomeStatusCs(layout.ai.outcome.status),
    );
    assert.equal(
      advisorIntroFromAiContext(layout.ai),
      formatDecisionKeyCs(layout.ai.outcome.recommendation),
    );

    const preview = decisionReportPreviewFromTerminal(layout.terminal);
    assert.equal(
      preview.title,
      formatDecisionKeyCs(layout.terminal.outcome.recommendation),
    );
    assert.equal(
      preview.summary,
      formatOutcomeStatusCs(layout.terminal.outcome.status),
    );
    assert.deepEqual(
      preview.priorities,
      layout.terminal.outcome.completedMoveIds.map((id) =>
        formatDecisionKeyCs(id),
      ),
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

  it('presentation coaching FAQ derives from priorities without Runtime mutation', () => {
    const coach = coachFaqItemsFromPriorities(['privacy', 'plot']);
    assert.ok(coach.length > 3);
    assert.equal(coach[0]!.id, 'coach-faq:privacy');
    assert.equal(coach[1]!.id, 'coach-faq:plot');
    assert.match(coach[0]!.question, /soukromí/i);

    const layoutRuntime = createTestBuilderRuntime();
    layoutRuntime.dispatch(
      { type: 'ChangePriority', priorityIds: ['layout', 'privacy'] },
      2,
    );
    const decision = layoutRuntime.getExperience()!.context.decision;
    const experienceFaq = faqItemsForExperience({
      ai: decision.ai,
      priorityIds: decision.priorityIds,
    });
    assert.ok(experienceFaq.length > 3);
    assert.equal(experienceFaq[0]!.id, 'coach-faq:layout');
    assert.match(experienceFaq[0]!.question, /\?$/);
  });
});
