import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createValidationDashboardApi } from './validation-dashboard-api';
import { createValidationAggregator } from './validation-aggregator';
import { createValidationDashboardService } from './validation-dashboard-service';

describe('ValidationDashboardService', () => {
  it('aggregates validator snapshots into a deterministic report', () => {
    const service = createValidationDashboardService({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
      now: () => new Date('2026-07-29T10:00:00.000Z'),
    });
    const api = createValidationDashboardApi(service);

    const sources = {
      workspace: {
        valid: true,
        issues: [],
        validatedAt: '2026-07-29T10:00:00.000Z',
      },
      assets: {
        valid: false,
        issues: [
          {
            code: 'asset',
            severity: 'error' as const,
            message: 'Asset location uri is required.',
          },
        ],
        validatedAt: '2026-07-29T10:00:00.000Z',
      },
      metadata: {
        valid: true,
        issues: [
          {
            code: 'seo',
            severity: 'warning' as const,
            message: 'SEO title should stay under 70 characters.',
          },
        ],
        validatedAt: '2026-07-29T10:00:00.000Z',
      },
      publication: {
        id: 'pub-report-1',
        publicationId: 'pub-1',
        status: 'READY_WITH_WARNINGS' as const,
        checks: [
          {
            id: 'title',
            name: 'Title present',
            result: 'pass' as const,
            severity: 'info' as const,
            message: 'Title is set.',
          },
          {
            id: 'version',
            name: 'Version format',
            result: 'warning' as const,
            severity: 'warning' as const,
            message: 'Version is informal.',
          },
        ],
        warnings: ['Version is informal.'],
        errors: [],
        metadata: {
          title: 'Pub',
          notes: '',
          objectId: 'obj-1',
          version: '1.0.0',
        },
      },
      exportCertification: {
        valid: true,
        issues: [],
        validatedAt: '2026-07-29T10:00:00.000Z',
      },
    };

    const first = api.evaluateProject('harmony-124', sources);
    const second = api.evaluateProject('harmony-124', sources);

    assert.equal(first.overallStatus, 'BLOCKED');
    assert.equal(first.readinessScore, second.readinessScore);
    assert.equal(first.summary.blockedCount, 1);
    assert.equal(first.summary.warningCount, 2);
    assert.ok(first.checks.some((check) => check.source === 'ASSETS'));
    assert.ok(first.checks.some((check) => check.source === 'PUBLICATION'));
    assert.ok(
      api.listEvents().some((event) => event.type === 'ValidationStarted'),
    );
    assert.ok(
      api.listEvents().some((event) => event.type === 'ValidationCompleted'),
    );
    assert.ok(
      api.listEvents().some((event) => event.type === 'ValidationReportGenerated'),
    );
  });

  it('maps empty sources to READY with score 100', () => {
    const api = createValidationDashboardApi();
    const report = api.evaluateProject('family-98', {});
    assert.equal(report.overallStatus, 'READY');
    assert.equal(report.readinessScore, 100);
    assert.equal(report.checks.length, 0);
  });

  it('refreshes an existing report without inventing rules', () => {
    const api = createValidationDashboardApi();
    const created = api.evaluateProject('villa-168', {
      workspace: {
        valid: false,
        issues: [
          {
            code: 'project',
            severity: 'error',
            message: 'Project name is required.',
          },
        ],
        validatedAt: '2026-07-29T10:00:00.000Z',
      },
    });
    const refreshed = api.refreshValidation(created.id, {
      workspace: {
        valid: true,
        issues: [],
        validatedAt: '2026-07-29T10:01:00.000Z',
      },
    });
    assert.equal(refreshed.id, created.id);
    assert.equal(refreshed.overallStatus, 'READY');
    assert.equal(
      api.findValidationReport(created.id)?.overallStatus,
      'READY',
    );
    assert.equal(api.listValidationReports().length, 1);
  });

  it('allows CUSTOM checks without changing dashboard API', () => {
    const aggregator = createValidationAggregator();
    const report = aggregator.aggregate(
      'harmony-124',
      {
        customChecks: [
          {
            id: 'custom-1',
            source: 'CUSTOM',
            severity: 'WARNING',
            title: 'Partner checklist',
            description: 'External checklist warning.',
            status: 'WARNING',
            recommendation: 'Review partner checklist.',
            metadata: { code: 'partner', notes: 'Injected custom check.' },
          },
        ],
      },
      {
        createId: (() => {
          let n = 0;
          return (prefix: string) => {
            n += 1;
            return `${prefix}-${n}`;
          };
        })(),
        now: () => '2026-07-29T10:00:00.000Z',
      },
    );
    assert.equal(report.overallStatus, 'WARNING');
    assert.equal(report.checks[0]?.source, 'CUSTOM');
  });
});
