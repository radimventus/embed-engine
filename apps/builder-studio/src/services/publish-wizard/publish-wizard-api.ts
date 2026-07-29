import type {
  DashboardValidationReport,
  InitializePublishWizardInput,
  PublicationHistoryEntry,
  PublicationSession,
  PublishPrepareInput,
  PublishSummary,
  PublishWizardEvent,
  PublishedArtifact,
} from '../../model';
import {
  createPublishWizardService,
  type PublishWizardService,
} from './publish-wizard-service';

export type PublishWizardApi = {
  startPublish(projectId: string, title?: string): PublicationSession;
  publishProject(
    sessionId: string,
    input: PublishPrepareInput,
    report: DashboardValidationReport,
    certificationId: string,
  ): {
    readonly session: PublicationSession;
    readonly summary: PublishSummary;
    readonly artifact: PublishedArtifact;
  };
  loadValidation(
    sessionId: string,
    report: DashboardValidationReport | null,
    certificationId: string | null,
  ): PublicationSession;
  preparePublication(
    sessionId: string,
    input: PublishPrepareInput,
    report: DashboardValidationReport,
  ): { readonly session: PublicationSession; readonly summary: PublishSummary };
  findPublication(publicationId: string): PublishedArtifact | null;
  findLatestPublication(projectId: string): PublishedArtifact | null;
  listPublications(projectId?: string): readonly PublishedArtifact[];
  getSession(sessionId: string): PublicationSession | null;
  getSummary(sessionId: string): PublishSummary | null;
  finishPublish(sessionId: string): PublicationSession;
  disposePublish(sessionId: string): PublicationSession;
  initializeWizard(input: InitializePublishWizardInput): PublicationSession;
  listEvents(): readonly PublishWizardEvent[];
  listHistory(): readonly PublicationHistoryEntry[];
};

export function createPublishWizardApi(
  service?: PublishWizardService,
): PublishWizardApi {
  const wizard = service ?? createPublishWizardService();

  return {
    startPublish(projectId, title) {
      return wizard.startPublish(projectId, title);
    },

    loadValidation(sessionId, report, certificationId) {
      return wizard.loadValidation(sessionId, report, certificationId);
    },

    preparePublication(sessionId, input, report) {
      return wizard.preparePublication(sessionId, input, report);
    },

    publishProject(sessionId, input, report, certificationId) {
      const prepared = wizard.preparePublication(
        sessionId,
        { ...input, certificationId },
        report,
      );
      const published = wizard.publish(prepared.session.id);
      const finished = wizard.finish(published.session.id);
      return {
        session: finished,
        summary: prepared.summary,
        artifact: published.artifact,
      };
    },

    findPublication(publicationId) {
      return wizard.findPublication(publicationId);
    },

    findLatestPublication(projectId) {
      return wizard.findLatestPublication(projectId);
    },

    listPublications(projectId) {
      return wizard.listPublications(projectId);
    },

    getSession(sessionId) {
      return wizard.getSession(sessionId);
    },

    getSummary(sessionId) {
      return wizard.getSummary(sessionId);
    },

    finishPublish(sessionId) {
      return wizard.finish(sessionId);
    },

    disposePublish(sessionId) {
      return wizard.dispose(sessionId);
    },

    initializeWizard(input) {
      return wizard.initialize(input);
    },

    listEvents() {
      return wizard.getEvents();
    },

    listHistory() {
      return wizard.getHistory();
    },
  };
}
