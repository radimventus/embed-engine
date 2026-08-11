import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { AnalyticsEvent } from '../analytics';
import { projectDecisionActivity } from './DecisionActivityEngine';

function createBase(sessionId: string, at: number) {
  return {
    sessionId,
    decisionSessionId: `${sessionId}:decision`,
    at,
    surfaceId: null,
    runtimeContextRef: null,
  } as const;
}

describe('Decision Activity Engine', () => {
  it('does not fabricate bootstrap activity for the first visitor', () => {
    const events: AnalyticsEvent[] = [
      {
        ...createBase('s1', 1),
        type: 'experience.event',
        experienceEventType: 'floorplan.opened',
        payload: Object.freeze({ floor: '0' }),
      },
    ];

    const snapshot = projectDecisionActivity(events);
    assert.equal(snapshot.bootstrapMode, true);
    const liveItems = snapshot.layers.find((layer) => layer.id === 'live')!.items;
    assert.equal(liveItems.length, 1);
    assert.equal(liveItems[0]!.message, 'V této relaci: otevřel půdorys.');
    assert.equal(
      snapshot.layers.find((layer) => layer.id === 'popularity')!.items.length,
      0,
    );
  });

  it('projects popularity, behavior, preference and live layers independently', () => {
    const events: AnalyticsEvent[] = [
      {
        ...createBase('s1', 1),
        type: 'experience.event',
        experienceEventType: 'house.saved',
        payload: Object.freeze({}),
      },
      {
        ...createBase('s2', 2),
        type: 'experience.event',
        experienceEventType: 'house.saved',
        payload: Object.freeze({}),
      },
      {
        ...createBase('s3', 3),
        type: 'experience.event',
        experienceEventType: 'house.saved',
        payload: Object.freeze({}),
      },
      {
        ...createBase('s1', 4),
        type: 'experience.event',
        experienceEventType: 'floorplan.opened',
        payload: Object.freeze({}),
      },
      {
        ...createBase('s2', 5),
        type: 'experience.event',
        experienceEventType: 'floorplan.opened',
        payload: Object.freeze({}),
      },
      {
        ...createBase('s3', 6),
        type: 'runtime.signal',
        runtimeEventType: 'RoomSelected',
        payload: Object.freeze({ roomId: 'living-room' }),
      },
      {
        ...createBase('s1', 7),
        type: 'experience.event',
        experienceEventType: 'priority.completed',
        payload: Object.freeze({ priorityIds: 'energy,layout' }),
      },
      {
        ...createBase('s2', 8),
        type: 'experience.event',
        experienceEventType: 'priority.completed',
        payload: Object.freeze({ priorityIds: 'energy,privacy' }),
      },
      {
        ...createBase('s3', 9),
        type: 'experience.event',
        experienceEventType: 'priority.completed',
        payload: Object.freeze({ priorityIds: 'layout,energy' }),
      },
      {
        ...createBase('s3', 10),
        type: 'experience.event',
        experienceEventType: 'contact.submitted',
        payload: Object.freeze({}),
      },
    ];

    const snapshot = projectDecisionActivity(events);
    assert.equal(snapshot.bootstrapMode, false);
    assert.match(
      snapshot.layers.find((layer) => layer.id === 'popularity')!.items[0]!.message,
      /^3 zájemců si přidalo tento dům mezi oblíbené\./,
    );
    assert.ok(
      snapshot.layers.find((layer) => layer.id === 'behavior')!.items.length > 0,
    );
    assert.match(
      snapshot.layers.find((layer) => layer.id === 'behavior')!.items[0]!.message,
      /zájemců začne prohlídku/,
    );
    assert.match(
      snapshot.layers.find((layer) => layer.id === 'preference')!.items[0]!.message,
      /energetickou úspornost/,
    );
    assert.match(
      snapshot.layers.find((layer) => layer.id === 'live')!.items[0]!.message,
      /odeslal kontaktní formulář/,
    );
  });
});
