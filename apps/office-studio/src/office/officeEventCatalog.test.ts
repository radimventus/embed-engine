import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  formatOfficeEventTime,
  listRecentOfficeEvents,
  OFFICE_EVENT_CATALOG,
} from './officeEventCatalog.ts';

describe('officeEventCatalog (OF-01)', () => {
  it('exposes the MVP partner lifecycle events', () => {
    const labels = OFFICE_EVENT_CATALOG.map((event) => event.label);
    assert.ok(labels.includes('Partner vytvořen'));
    assert.ok(labels.includes('Nabídka odeslána'));
    assert.ok(labels.includes('Objednávka potvrzena'));
    assert.ok(labels.includes('Platba přijata'));
    assert.ok(labels.includes('Builder otevřen'));
  });

  it('lists recent events newest first', () => {
    const recent = listRecentOfficeEvents(3);
    assert.equal(recent.length, 3);
    assert.ok(
      new Date(recent[0]!.occurredAt).getTime() >=
        new Date(recent[1]!.occurredAt).getTime(),
    );
  });

  it('formats timestamps for Czech locale', () => {
    const label = formatOfficeEventTime('2026-08-03T07:05:00.000Z');
    assert.ok(label.length > 0);
  });
});
