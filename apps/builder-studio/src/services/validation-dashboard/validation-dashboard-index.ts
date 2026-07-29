import type {
  DashboardValidationReport,
  ValidationDashboardIndexEntry,
} from '../../model';

export type ValidationDashboardIndex = {
  index(report: DashboardValidationReport): readonly ValidationDashboardIndexEntry[];
  find(reportId: string): ValidationDashboardIndexEntry | null;
  list(): readonly ValidationDashboardIndexEntry[];
  rebuild(
    reports: readonly DashboardValidationReport[],
  ): readonly ValidationDashboardIndexEntry[];
};

export function createValidationDashboardIndex(): ValidationDashboardIndex {
  let entries: ValidationDashboardIndexEntry[] = [];

  return {
    index(report) {
      const next: ValidationDashboardIndexEntry = {
        reportId: report.id,
        projectId: report.projectId,
        overallStatus: report.overallStatus,
        readinessScore: report.readinessScore,
        generatedAt: report.generatedAt,
      };
      entries = [
        ...entries.filter((entry) => entry.reportId !== report.id),
        next,
      ].sort((left, right) =>
        right.generatedAt.localeCompare(left.generatedAt),
      );
      return [next];
    },

    find(reportId) {
      return entries.find((entry) => entry.reportId === reportId) ?? null;
    },

    list() {
      return [...entries];
    },

    rebuild(reports) {
      entries = [];
      for (const report of reports) {
        this.index(report);
      }
      return [...entries];
    },
  };
}
