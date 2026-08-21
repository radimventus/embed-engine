import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { relatedHousesForContact } from './relatedHousesForContact';
import type { OperationalLeadRecord } from './operationalTypes';

const bungalov = {
  houseId: 'house-bungalov',
  houseName: 'BUNGALOV 4KK',
};
const vpd = {
  houseId: 'house-vpd',
  houseName: 'VÁŠ PRVNÍ DŮM',
};
const otherProjectHouse = {
  houseId: 'house-other-project',
  houseName: 'JINÝ DŮM',
};

function lead(
  overrides: Partial<OperationalLeadRecord> = {},
): OperationalLeadRecord {
  return {
    leadId: 'lead-1',
    companyId: 'company-a',
    projectId: 'project-a',
    houseId: bungalov.houseId,
    createdAt: '2026-08-21T10:00:00.000Z',
    source: 'EMBED',
    intent: 'audit',
    status: 'accepted',
    processingStatus: 'new',
    contact: {
      name: 'Andrej Věntus',
      email: 'andrej@example.cz',
      phone: null,
    },
    decisionSessionId: null,
    ...overrides,
  };
}

const current = {
  companyId: 'company-a',
  projectId: 'project-a',
  houseId: bungalov.houseId,
  houseName: bungalov.houseName,
  origin: 'LEAD' as const,
  contact: {
    name: 'Andrej Věntus',
    email: 'andrej@example.cz',
    phone: null,
  },
};

describe('relatedHousesForContact', () => {
  it('always includes the active House', () => {
    const pills = relatedHousesForContact({
      current,
      projectLeads: [lead()],
      houses: [bungalov, vpd],
    });
    assert.deepEqual(pills, [bungalov]);
  });

  it('adds another House only when the same email has a Lead there', () => {
    const pills = relatedHousesForContact({
      current,
      projectLeads: [
        lead(),
        lead({
          leadId: 'lead-vpd',
          houseId: vpd.houseId,
        }),
      ],
      houses: [bungalov, vpd],
    });
    assert.deepEqual(
      pills.map((item) => item.houseId),
      [bungalov.houseId, vpd.houseId],
    );
  });

  it('does not list a Project House with no Lead for this contact', () => {
    const pills = relatedHousesForContact({
      current,
      projectLeads: [lead()],
      houses: [bungalov, vpd],
    });
    assert.equal(
      pills.some((item) => item.houseId === vpd.houseId),
      false,
    );
  });

  it('does not correlate by display name alone', () => {
    const pills = relatedHousesForContact({
      current,
      projectLeads: [
        lead(),
        lead({
          leadId: 'lead-homonym',
          houseId: vpd.houseId,
          contact: {
            name: 'Andrej Věntus',
            email: 'someone-else@example.cz',
            phone: null,
          },
        }),
      ],
      houses: [bungalov, vpd],
    });
    assert.deepEqual(
      pills.map((item) => item.houseId),
      [bungalov.houseId],
    );
  });

  it('does not leak another Company or Project', () => {
    const pills = relatedHousesForContact({
      current,
      projectLeads: [
        lead(),
        lead({
          leadId: 'lead-company-b',
          companyId: 'company-b',
          houseId: vpd.houseId,
        }),
        lead({
          leadId: 'lead-project-b',
          projectId: 'project-b',
          houseId: otherProjectHouse.houseId,
        }),
      ],
      houses: [bungalov, vpd, otherProjectHouse],
    });
    assert.deepEqual(
      pills.map((item) => item.houseId),
      [bungalov.houseId],
    );
  });

  it('does not invent extra Houses for REFERENCE cases', () => {
    const pills = relatedHousesForContact({
      current: {
        ...current,
        origin: 'REFERENCE',
      },
      projectLeads: [
        lead({
          leadId: 'lead-vpd',
          houseId: vpd.houseId,
        }),
      ],
      houses: [bungalov, vpd],
    });
    assert.deepEqual(pills, [bungalov]);
  });
});
