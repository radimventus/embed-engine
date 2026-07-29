import type {
  DashboardValidationReport,
  InitializeValidationDashboardInput,
  ValidationDashboardEvent,
  ValidationDashboardEventType,
  ValidationDashboardIndexEntry,
} from '../../model';
import {
  createValidationAggregator,
  type ValidationAggregator,
  type ValidationSourceSnapshot,
} from './validation-aggregator';
import {
  createValidationDashboardIndex,
  type ValidationDashboardIndex,
} from './validation-dashboard-index';

export type ValidationDashboardServiceOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly aggregator?: ValidationAggregator;
  readonly index?: ValidationDashboardIndex;
};

/**
 * Validation Dashboard service — aggregation only.
 * Does not mutate project/assets/metadata, does not publish, no AI.
 */
export type ValidationDashboardService = {
  initialize(input: InitializeValidationDashboardInput): DashboardValidationReport;
  evaluateProject(
    projectId: string,
    sources: ValidationSourceSnapshot,
  ): DashboardValidationReport;
  refresh(
    reportId: string,
    sources: ValidationSourceSnapshot,
  ): DashboardValidationReport;
  getValidationReport(reportId: string): DashboardValidationReport | null;
  findByProject(projectId: string): DashboardValidationReport | null;
  listReports(): readonly DashboardValidationReport[];
  dispose(reportId: string): DashboardValidationReport;
  getEvents(): readonly ValidationDashboardEvent[];
  getIndex(): readonly ValidationDashboardIndexEntry[];
};

export function createValidationDashboardService(
  options: ValidationDashboardServiceOptions = {},
): ValidationDashboardService {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const aggregator = options.aggregator ?? createValidationAggregator();
  const index = options.index ?? createValidationDashboardIndex();

  const reports = new Map<string, DashboardValidationReport>();
  const latestByProject = new Map<string, string>();
  const lastSources = new Map<string, ValidationSourceSnapshot>();
  const events: ValidationDashboardEvent[] = [];
  const disposed = new Set<string>();

  const emit = (
    type: ValidationDashboardEventType,
    projectId: string,
    reportId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('validation-dashboard-event'),
      type,
      projectId,
      reportId,
      at: now().toISOString(),
      message,
    });
  };

  const store = (report: DashboardValidationReport): DashboardValidationReport => {
    reports.set(report.id, report);
    latestByProject.set(report.projectId, report.id);
    index.index(report);
    return report;
  };

  return {
    initialize(input) {
      if (!input.projectId.trim()) {
        throw new Error('Validation dashboard requires projectId.');
      }
      const projectId = input.projectId.trim();
      const report = aggregator.aggregate(
        projectId,
        {},
        {
          createId,
          now: () => now().toISOString(),
          title: input.title,
        },
      );
      lastSources.set(report.id, {});
      store(report);
      emit(
        'ValidationReportGenerated',
        projectId,
        report.id,
        `Generated validation report for ${projectId}.`,
      );
      emit(
        'ValidationReportUpdated',
        projectId,
        report.id,
        `Initialized validation dashboard for ${projectId}.`,
      );
      return report;
    },

    evaluateProject(projectId, sources) {
      const normalized = projectId.trim();
      if (!normalized) {
        throw new Error('projectId is required.');
      }
      emit(
        'ValidationStarted',
        normalized,
        latestByProject.get(normalized) ?? null,
        `Validation started for ${normalized}.`,
      );
      try {
        const report = aggregator.aggregate(normalized, sources, {
          createId,
          now: () => now().toISOString(),
        });
        lastSources.set(report.id, sources);
        store(report);
        emit(
          'ValidationCompleted',
          normalized,
          report.id,
          `Validation completed: ${report.overallStatus} (${report.readinessScore}%).`,
        );
        emit(
          'ValidationReportGenerated',
          normalized,
          report.id,
          `Generated validation report for ${normalized}.`,
        );
        emit(
          'ValidationReportUpdated',
          normalized,
          report.id,
          `Validation report updated for ${normalized}.`,
        );
        return report;
      } catch (error) {
        throw error;
      }
    },

    refresh(reportId, sources) {
      const existing = reports.get(reportId);
      if (existing === undefined || disposed.has(reportId)) {
        throw new Error(`Validation report not found: ${reportId}`);
      }
      emit(
        'ValidationStarted',
        existing.projectId,
        reportId,
        `Refresh started for ${existing.projectId}.`,
      );
      try {
        const nextSources = sources ?? lastSources.get(reportId) ?? {};
        const report = aggregator.aggregate(existing.projectId, nextSources, {
          createId,
          now: () => now().toISOString(),
          title: existing.metadata.title,
        });
        // Keep stable report id on refresh for getReport continuity.
        const refreshed: DashboardValidationReport = {
          ...report,
          id: reportId,
        };
        lastSources.set(reportId, nextSources);
        store(refreshed);
        emit(
          'ValidationCompleted',
          refreshed.projectId,
          refreshed.id,
          `Validation refreshed: ${refreshed.overallStatus} (${refreshed.readinessScore}%).`,
        );
        emit(
          'ValidationReportGenerated',
          refreshed.projectId,
          refreshed.id,
          `Generated validation report for ${refreshed.projectId}.`,
        );
        emit(
          'ValidationReportUpdated',
          refreshed.projectId,
          refreshed.id,
          `Validation report refreshed for ${refreshed.projectId}.`,
        );
        return refreshed;
      } catch (error) {
        throw error;
      }
    },

    getValidationReport(reportId) {
      if (disposed.has(reportId)) return null;
      return reports.get(reportId) ?? null;
    },

    findByProject(projectId) {
      const reportId = latestByProject.get(projectId);
      if (reportId === undefined || disposed.has(reportId)) return null;
      return reports.get(reportId) ?? null;
    },

    listReports() {
      return [...reports.values()].filter((report) => !disposed.has(report.id));
    },

    dispose(reportId) {
      const report = reports.get(reportId);
      if (report === undefined) {
        throw new Error(`Validation report not found: ${reportId}`);
      }
      disposed.add(reportId);
      if (latestByProject.get(report.projectId) === reportId) {
        latestByProject.delete(report.projectId);
      }
      emit(
        'ValidationReportUpdated',
        report.projectId,
        reportId,
        `Disposed validation report ${reportId}.`,
      );
      return report;
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list().filter((entry) => !disposed.has(entry.reportId));
    },
  };
}
