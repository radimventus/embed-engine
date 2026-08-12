import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { resetHouseKnowledgeForTests } from '../knowledge/houseKnowledgeStore';
import { resetHousePriorityFaqForTests } from '../priority-faq/housePriorityFaqStore';
import { resetHouseSpecificationsForTests } from '../specification/houseSpecificationStore';
import { getCanonicalHouseRuntimeContext } from './canonicalHouseRuntimeContext';
import { selectCanonicalHouseKnowledge } from './selectCanonicalHouseKnowledge';

const PRIORITIES = [
  'plot',
  'layout',
  'privacy',
  'design',
  'energy',
  'operating-costs',
  'quality',
  'maintenance',
] as const;

function priorityTriples(): readonly (readonly string[])[] {
  return PRIORITIES.flatMap((first, firstIndex) =>
    PRIORITIES.slice(firstIndex + 1).flatMap((second, secondOffset) =>
      PRIORITIES.slice(firstIndex + secondOffset + 2).map((third) => [
        first,
        second,
        third,
      ]),
    ),
  );
}

describe('canonical Priority knowledge selection', () => {
  beforeEach(() => {
    resetHouseSpecificationsForTests();
    resetHouseKnowledgeForTests();
    resetHousePriorityFaqForTests();
  });

  it('selects source-backed facts, interpretations, and guardrails for all visible priorities', () => {
    const context = getCanonicalHouseRuntimeContext('modern-4kk');
    assert.ok(context);

    for (const priority of PRIORITIES) {
      const selection = selectCanonicalHouseKnowledge(context, [priority]);
      assert.equal(selection.canonicalHouseId, 'modern-4kk');
      assert.ok(selection.facts.length > 0, `${priority} facts`);
      assert.ok(selection.interpretations.length > 0, `${priority} interpretations`);
      assert.ok(selection.guardrails.length > 0, `${priority} guardrails`);
      assert.ok(
        selection.interpretations.every((interpretation) =>
          selection.facts.some((fact) => fact.id === interpretation.factId),
        ),
        `${priority} interpretation must belong to a selected fact`,
      );
    }
  });

  it('does not turn Design or Layout priority into a configuration intent', () => {
    const context = getCanonicalHouseRuntimeContext('modern-4kk');
    assert.ok(context);

    const selection = selectCanonicalHouseKnowledge(context, ['design', 'layout']);
    assert.ok(
      selection.guardrails.some((guardrail) =>
        guardrail.includes('konfigurátor'),
      ),
    );
    assert.ok(
      selection.guardrails.some((guardrail) =>
        guardrail.includes('estetický vkus'),
      ),
    );
  });

  it('provides three distinct payoff-ready atoms for energy, costs, and quality', () => {
    const context = getCanonicalHouseRuntimeContext('modern-4kk');
    assert.ok(context);

    const selection = selectCanonicalHouseKnowledge(context, [
      'energy',
      'operating-costs',
      'quality',
    ]);
    const payoffFacts = selection.facts
      .filter(
        (fact) =>
          fact.factPoint !== undefined &&
          fact.interpretationPoint !== undefined &&
          fact.safeInterpretation !== undefined,
      )
      .slice(0, 3);

    assert.deepEqual(
      payoffFacts.map((fact) => fact.id),
      [
        'dse-integrated-energy',
        'product-construction-system',
        'product-diffusion-open-envelope',
      ],
    );
    assert.equal(new Set(payoffFacts.map((fact) => fact.id)).size, 3);
  });

  it('provides at least three distinct payoff-ready atoms for every valid selection', () => {
    const context = getCanonicalHouseRuntimeContext('modern-4kk');
    assert.ok(context);

    for (const priorities of priorityTriples()) {
      const payoffFacts = selectCanonicalHouseKnowledge(context, priorities)
        .facts.filter(
          (fact) =>
            fact.factPoint !== undefined &&
            fact.interpretationPoint !== undefined &&
            fact.safeInterpretation !== undefined,
        );

      assert.ok(
        payoffFacts.length >= 3,
        `${priorities.join(',')} needs three payoff-ready facts`,
      );
      assert.equal(
        new Set(payoffFacts.map((fact) => fact.id)).size,
        payoffFacts.length,
      );
    }
  });
});
