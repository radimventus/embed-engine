import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createPublishWizardApi } from './publish-wizard-api';
import { createPublishWizardService } from './publish-wizard-service';
import type { DashboardValidationReport } from '../../model';

function readyReport(
  projectId = 'harmony-124',
): DashboardValidationReport {
  return {
    id: 'validation-report-0001',
    projectId,
    overallStatus: 'READY',
    readinessScore: 100,
    checks: [],
    summary: {
      readyCount: 3,
      warningCount: 0,
      blockedCount: 0,
      totalCount: 3,
      notes: 'Project validation passed.',
    },
    generatedAt: '2026-07-29T10:00:00.000Z',
    metadata: {
      title: `Validation · ${projectId}`,
      notes: 'Aggregated from existing validators.',
      sources: ['WORKSPACE', 'ASSETS', 'METADATA'],
    },
  };
}

describe('PublishWizardService', () => {
  it('publishes only when Validation Dashboard is READY and certification exists', () => {
    const service = createPublishWizardService({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
      now: () => new Date('2026-07-29T12:00:00.000Z'),
    });
    const api = createPublishWizardApi(service);
    const report = readyReport();
    const session = api.startPublish('harmony-124');
    const validated = api.loadValidation(
      session.id,
      report,
      'certificate-0001',
    );
    assert.equal(validated.status, 'VALIDATED');

    const result = api.publishProject(
      session.id,
      {
        validationReportId: report.id,
        certificationId: 'certificate-0001',
        manifestId: 'manifest-0001',
        projectTitle: 'Harmony 124',
        assetCount: 2,
        metadataSlug: 'harmony-124',
      },
      report,
      'certificate-0001',
    );

    assert.equal(result.session.status, 'PUBLISHED');
    assert.equal(result.artifact.manifestId, 'manifest-0001');
    assert.equal(result.artifact.certificationId, 'certificate-0001');
    assert.ok(result.artifact.metadata.embedCode.includes(result.artifact.embedId));
    assert.equal(api.findLatestPublication('harmony-124')?.id, result.artifact.id);
    assert.ok(
      api.listEvents().some((event) => event.type === 'PublishCompleted'),
    );
  });

  it('blocks publish when validation is not READY', () => {
    const api = createPublishWizardApi();
    const session = api.startPublish('family-98');
    const blocked: DashboardValidationReport = {
      ...readyReport('family-98'),
      overallStatus: 'BLOCKED',
      readinessScore: 40,
      summary: {
        readyCount: 1,
        warningCount: 0,
        blockedCount: 1,
        totalCount: 2,
        notes: 'Blocked.',
      },
    };
    const validated = api.loadValidation(session.id, blocked, 'certificate-0001');
    assert.equal(validated.status, 'FAILED');
    assert.throws(() => {
      api.publishProject(
        session.id,
        {
          validationReportId: blocked.id,
          certificationId: 'certificate-0001',
          manifestId: 'manifest-0001',
        },
        blocked,
        'certificate-0001',
      );
    }, /VALIDATED|READY|Validation Dashboard/);
  });

  it('blocks publish without export certification', () => {
    const api = createPublishWizardApi();
    const session = api.startPublish('villa-168');
    const validated = api.loadValidation(session.id, readyReport('villa-168'), null);
    assert.equal(validated.status, 'FAILED');
  });

  it('keeps immutable publication history with unique versions', () => {
    const api = createPublishWizardApi(
      createPublishWizardService({
        createId: (() => {
          let n = 0;
          return (prefix: string) => {
            n += 1;
            return `${prefix}-${n}`;
          };
        })(),
        now: () => new Date('2026-07-29T12:00:00.000Z'),
      }),
    );
    const report = readyReport();
    const firstSession = api.startPublish('harmony-124');
    api.loadValidation(firstSession.id, report, 'certificate-0001');
    const first = api.publishProject(
      firstSession.id,
      {
        validationReportId: report.id,
        certificationId: 'certificate-0001',
        manifestId: 'manifest-0001',
        version: '1.0.0',
      },
      report,
      'certificate-0001',
    );

    const secondSession = api.startPublish('harmony-124');
    api.loadValidation(secondSession.id, report, 'certificate-0001');
    const second = api.publishProject(
      secondSession.id,
      {
        validationReportId: report.id,
        certificationId: 'certificate-0001',
        manifestId: 'manifest-0001',
        version: '1.0.1',
      },
      report,
      'certificate-0001',
    );

    assert.notEqual(first.artifact.id, second.artifact.id);
    assert.notEqual(first.artifact.version, second.artifact.version);
    assert.equal(api.listPublications('harmony-124').length, 2);
    assert.equal(api.listHistory().length, 2);
    assert.equal(api.findLatestPublication('harmony-124')?.version, '1.0.1');
  });
});
