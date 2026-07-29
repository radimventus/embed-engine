import type {
  DashboardValidationReport,
  InitializeValidationDashboardInput,
  ValidationDashboardEvent,
  ValidationDashboardIndexEntry,
} from '../../model';
import type { ValidationSourceSnapshot } from './validation-aggregator';
import {
  createValidationDashboardService,
  type ValidationDashboardService,
} from './validation-dashboard-service';

export type ValidationDashboardApi = {
  evaluateProject(
    projectId: string,
    sources: ValidationSourceSnapshot,
  ): DashboardValidationReport;
  refreshValidation(
    reportId: string,
    sources?: ValidationSourceSnapshot,
  ): DashboardValidationReport;
  findValidationReport(reportId: string): DashboardValidationReport | null;
  findValidationReportByProject(
    projectId: string,
  ): DashboardValidationReport | null;
  listValidationReports(): readonly DashboardValidationReport[];
  initializeDashboard(
    input: InitializeValidationDashboardInput,
  ): DashboardValidationReport;
  disposeValidation(reportId: string): DashboardValidationReport;
  listEvents(): readonly ValidationDashboardEvent[];
  listIndex(): readonly ValidationDashboardIndexEntry[];
};

export function createValidationDashboardApi(
  service?: ValidationDashboardService,
): ValidationDashboardApi {
  const dashboard = service ?? createValidationDashboardService();

  return {
    evaluateProject(projectId, sources) {
      return dashboard.evaluateProject(projectId, sources);
    },

    refreshValidation(reportId, sources = {}) {
      return dashboard.refresh(reportId, sources);
    },

    findValidationReport(reportId) {
      return dashboard.getValidationReport(reportId);
    },

    findValidationReportByProject(projectId) {
      return dashboard.findByProject(projectId);
    },

    listValidationReports() {
      return dashboard.listReports();
    },

    initializeDashboard(input) {
      return dashboard.initialize(input);
    },

    disposeValidation(reportId) {
      return dashboard.dispose(reportId);
    },

    listEvents() {
      return dashboard.getEvents();
    },

    listIndex() {
      return dashboard.getIndex();
    },
  };
}
