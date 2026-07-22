import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { REFERENCE_HOUSE_PACKAGE } from '@embed-engine/object-house';
import {
  createFixedClock,
  createDecisionSessionRuntime,
} from '@embed-engine/runtime';

import { projectDecisionPresentation } from '../../runtime/projectDecisionPresentation';

const here = dirname(fileURLToPath(import.meta.url));

function read(name: string): string {
  return readFileSync(join(here, name), 'utf8');
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('Decision Terminal (CSCB-05)', () => {
  it('projects Story / Moves / Drivers / Outcome from Runtime Context only', () => {
    const runtime = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-living' }, 2);
    runtime.dispatch(
      { type: 'ChangePriority', priorityIds: ['plot', 'layout', 'energy'] },
      3,
    );

    const decision = runtime.getExperience()!.context.decision;
    const view = projectDecisionPresentation({
      terminal: decision.terminal,
      story: decision.story,
      moves: decision.moves,
      focus: decision.focus,
      priorityIds: decision.priorityIds,
    });

    assert.equal(view.terminalId, decision.terminal.id);
    assert.equal(view.summary.recommendation, decision.terminal.outcome.recommendation);
    assert.equal(view.story.id, decision.story.id);
    assert.deepEqual(
      view.story.chapters.map((chapter) => chapter.key),
      decision.story.chapters.map((chapter) => chapter.key),
    );
    assert.deepEqual(
      view.moves.moves.map((move) => move.id),
      decision.moves.moves.map((move) => move.id),
    );
    assert.deepEqual(view.drivers.priorityIds, ['plot', 'layout', 'energy']);
    assert.equal(view.outcome.status, decision.terminal.outcome.status);
    assert.deepEqual(
      view.outcome.strengths,
      decision.terminal.outcome.rationale,
    );
  });

  it('preserves Runtime Story and Move order without local reordering', () => {
    const runtime = createDecisionSessionRuntime({
      clock: createFixedClock(10),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 10,
    });
    runtime.dispatch({ type: 'ChangePriority', priorityIds: ['privacy'] }, 11);
    const decision = runtime.getExperience()!.context.decision;
    const view = projectDecisionPresentation({
      terminal: decision.terminal,
      story: decision.story,
      moves: decision.moves,
      focus: decision.focus,
      priorityIds: decision.priorityIds,
    });

    const chapterOrders = view.story.chapters.map((chapter) => chapter.order);
    const moveOrders = view.moves.moves.map((move) => move.order);
    assert.deepEqual(chapterOrders, [...chapterOrders].sort((a, b) => a - b));
    assert.deepEqual(moveOrders, [...moveOrders].sort((a, b) => a - b));
    assert.deepEqual(chapterOrders, decision.story.chapters.map((c) => c.order));
    assert.deepEqual(moveOrders, decision.moves.moves.map((m) => m.order));
  });

  it('live Terminal UI reads Runtime Context only — no Object Package semantics', () => {
    const files = readdirSync(here).filter(
      (name) =>
        (name.endsWith('.tsx') || name.endsWith('.ts')) &&
        !name.endsWith('.test.ts') &&
        !name.includes('useDecisionTerminal') &&
        !name.includes('OutcomeCommitment') &&
        !name.includes('TerminalShell'),
    );

    for (const name of files) {
      const source = stripComments(read(name));
      assert.equal(
        source.includes('@embed-engine/object-house'),
        false,
        `${name} must not import Object Package`,
      );
      assert.equal(
        source.includes('getDecisionFactors'),
        false,
        `${name} must not compute decision factors`,
      );
      assert.equal(
        source.includes('composeDecision'),
        false,
        `${name} must not compose semantics`,
      );
      assert.equal(source.includes('dispatch('), false, `${name} must not dispatch`);
    }

    const terminal = read('DecisionTerminal.tsx');
    assert.match(terminal, /projectDecisionPresentation/);
    assert.match(terminal, /DecisionSummary/);
    assert.match(terminal, /DecisionDrivers/);
    assert.match(terminal, /OutcomeCards/);
    assert.match(terminal, /DecisionStoryPanel/);
    // First-view hierarchy: Summary → Drivers → Outcomes → Story (CSCB-05A)
    const summaryAt = terminal.indexOf('<DecisionSummary');
    const driversAt = terminal.indexOf('<DecisionDrivers');
    const outcomesAt = terminal.indexOf('<OutcomeCards');
    const storyAt = terminal.indexOf('<DecisionStoryPanel');
    assert.ok(summaryAt < driversAt && driversAt < outcomesAt && outcomesAt < storyAt);
  });
});
