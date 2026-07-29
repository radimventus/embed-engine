import type {
  DashboardValidationReport,
  InitializePublishWizardInput,
  PublicationHistoryEntry,
  PublicationSession,
  PublishPrepareInput,
  PublishSummary,
  PublishWizardEvent,
  PublishWizardEventType,
  PublishedArtifact,
} from '../../model';
import {
  createBasicPublishStrategy,
  createPublishValidator,
  type PublishStrategy,
  type PublishValidator,
} from './basic-publish-strategy';
import {
  createPublicationHistory,
  type PublicationHistory,
} from './publication-history';

export type PublishWizardServiceOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: PublishStrategy;
  readonly validator?: PublishValidator;
  readonly history?: PublicationHistory;
};

/**
 * Publish Wizard service — orchestration only.
 * Uses Validation Dashboard + Export Certification + existing Manifest references.
 */
export type PublishWizardService = {
  initialize(input: InitializePublishWizardInput): PublicationSession;
  startPublish(projectId: string, title?: string): PublicationSession;
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
  publish(sessionId: string): {
    readonly session: PublicationSession;
    readonly artifact: PublishedArtifact;
  };
  finish(sessionId: string): PublicationSession;
  dispose(sessionId: string): PublicationSession;
  getSession(sessionId: string): PublicationSession | null;
  getSummary(sessionId: string): PublishSummary | null;
  findPublication(publicationId: string): PublishedArtifact | null;
  findLatestPublication(projectId: string): PublishedArtifact | null;
  listPublications(projectId?: string): readonly PublishedArtifact[];
  getEvents(): readonly PublishWizardEvent[];
  getHistory(): readonly PublicationHistoryEntry[];
};

export function createPublishWizardService(
  options: PublishWizardServiceOptions = {},
): PublishWizardService {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicPublishStrategy();
  const validator = options.validator ?? createPublishValidator();
  const history = options.history ?? createPublicationHistory();

  const sessions = new Map<string, PublicationSession>();
  const summaries = new Map<string, PublishSummary>();
  const artifacts = new Map<string, PublishedArtifact>();
  const latestByProject = new Map<string, string>();
  const events: PublishWizardEvent[] = [];

  const emit = (
    type: PublishWizardEventType,
    sessionId: string,
    projectId: string,
    publicationId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('publish-wizard-event'),
      type,
      sessionId,
      projectId,
      publicationId,
      at: now().toISOString(),
      message,
    });
  };

  const requireSession = (sessionId: string): PublicationSession => {
    const session = sessions.get(sessionId);
    if (session === undefined) {
      throw new Error(`Publication session not found: ${sessionId}`);
    }
    return session;
  };

  const storeSession = (session: PublicationSession): PublicationSession => {
    sessions.set(session.id, session);
    return session;
  };

  return {
    initialize(input) {
      return this.startPublish(input.projectId, input.title);
    },

    startPublish(projectId, title) {
      const normalized = projectId.trim();
      if (!normalized) {
        throw new Error('Publish Wizard requires projectId.');
      }
      const stamp = now().toISOString();
      const session: PublicationSession = {
        id: createId('publication-session'),
        projectId: normalized,
        startedAt: stamp,
        finishedAt: null,
        status: 'STARTED',
        validationReportId: null,
        publicationId: null,
        metadata: {
          title: title?.trim() || `Publish · ${normalized}`,
          notes: 'Publish session started.',
          version: null,
          step: 'validation',
        },
      };
      storeSession(session);
      emit(
        'PublishStarted',
        session.id,
        normalized,
        null,
        `Publish started for ${normalized}.`,
      );
      return session;
    },

    loadValidation(sessionId, report, certificationId) {
      const session = requireSession(sessionId);
      const result = validator.validate(report, certificationId);
      if (!result.valid) {
        const failed: PublicationSession = {
          ...session,
          status: 'FAILED',
          metadata: {
            ...session.metadata,
            notes: result.issues.map((issue) => issue.message).join(' '),
            step: 'validation',
          },
        };
        storeSession(failed);
        emit(
          'PublishFailed',
          failed.id,
          failed.projectId,
          null,
          failed.metadata.notes,
        );
        return failed;
      }

      const validated: PublicationSession = {
        ...session,
        status: 'VALIDATED',
        validationReportId: report!.id,
        metadata: {
          ...session.metadata,
          notes: `Validated READY · score ${report!.readinessScore}%.`,
          step: 'summary',
        },
      };
      storeSession(validated);
      emit(
        'PublishValidated',
        validated.id,
        validated.projectId,
        null,
        validated.metadata.notes,
      );
      return validated;
    },

    preparePublication(sessionId, input, report) {
      const session = requireSession(sessionId);
      if (session.status !== 'VALIDATED' && session.status !== 'READY') {
        throw new Error(
          `Session must be VALIDATED before prepare (got ${session.status}).`,
        );
      }
      if (report.overallStatus !== 'READY') {
        throw new Error('Cannot prepare publication without READY validation.');
      }
      if (!strategy.supports(input)) {
        throw new Error('Publish strategy does not support this input.');
      }
      if (input.validationReportId !== report.id) {
        throw new Error('validationReportId must match loaded Validation Dashboard report.');
      }

      const gate = validator.validate(report, input.certificationId);
      if (!gate.valid) {
        throw new Error(gate.issues.map((issue) => issue.message).join(' '));
      }

      const summary = strategy.prepare(input, report);
      summaries.set(sessionId, summary);
      const ready: PublicationSession = {
        ...session,
        status: 'READY',
        validationReportId: report.id,
        metadata: {
          ...session.metadata,
          notes: `Ready to publish v${summary.version}.`,
          version: summary.version,
          step: 'publish',
        },
      };
      storeSession(ready);
      return { session: ready, summary };
    },

    publish(sessionId) {
      const session = requireSession(sessionId);
      if (session.status !== 'READY') {
        throw new Error(
          `Session must be READY before publish (got ${session.status}).`,
        );
      }
      const summary = summaries.get(sessionId);
      if (summary === undefined) {
        throw new Error('Publication summary missing; call preparePublication first.');
      }

      const publishing: PublicationSession = {
        ...session,
        status: 'PUBLISHING',
        metadata: {
          ...session.metadata,
          notes: 'Publishing…',
          step: 'publish',
        },
      };
      storeSession(publishing);

      try {
        const artifact = strategy.publish({
          projectId: session.projectId,
          sessionId,
          summary,
          createId,
          now: () => now().toISOString(),
        });
        history.index(artifact);
        artifacts.set(artifact.id, artifact);
        latestByProject.set(artifact.projectId, artifact.id);

        const published: PublicationSession = {
          ...publishing,
          status: 'PUBLISHED',
          publicationId: artifact.id,
          finishedAt: artifact.publishedAt,
          metadata: {
            ...publishing.metadata,
            notes: `Published ${artifact.id} v${artifact.version}.`,
            version: artifact.version,
            step: 'success',
          },
        };
        storeSession(published);
        emit(
          'PublicationCreated',
          published.id,
          published.projectId,
          artifact.id,
          `Created publication ${artifact.id}.`,
        );
        emit(
          'PublishCompleted',
          published.id,
          published.projectId,
          artifact.id,
          `Publish completed for ${artifact.projectId}.`,
        );
        return { session: published, artifact };
      } catch (error) {
        const failed: PublicationSession = {
          ...publishing,
          status: 'FAILED',
          finishedAt: now().toISOString(),
          metadata: {
            ...publishing.metadata,
            notes:
              error instanceof Error ? error.message : String(error),
            step: 'publish',
          },
        };
        storeSession(failed);
        emit(
          'PublishFailed',
          failed.id,
          failed.projectId,
          null,
          failed.metadata.notes,
        );
        throw error;
      }
    },

    finish(sessionId) {
      const session = requireSession(sessionId);
      if (session.status !== 'PUBLISHED') {
        throw new Error(
          `Session must be PUBLISHED before finish (got ${session.status}).`,
        );
      }
      return storeSession({
        ...session,
        finishedAt: session.finishedAt ?? now().toISOString(),
        metadata: {
          ...session.metadata,
          notes: 'Publish wizard finished.',
          step: 'success',
        },
      });
    },

    dispose(sessionId) {
      const session = requireSession(sessionId);
      return storeSession({
        ...session,
        status:
          session.status === 'PUBLISHED' ? session.status : 'CANCELLED',
        finishedAt: session.finishedAt ?? now().toISOString(),
        metadata: {
          ...session.metadata,
          notes: 'Publish session disposed.',
        },
      });
    },

    getSession(sessionId) {
      return sessions.get(sessionId) ?? null;
    },

    getSummary(sessionId) {
      return summaries.get(sessionId) ?? null;
    },

    findPublication(publicationId) {
      return artifacts.get(publicationId) ?? null;
    },

    findLatestPublication(projectId) {
      const id = latestByProject.get(projectId);
      if (id === undefined) return null;
      return artifacts.get(id) ?? null;
    },

    listPublications(projectId) {
      const all = [...artifacts.values()];
      if (projectId === undefined) return all;
      return all.filter((item) => item.projectId === projectId);
    },

    getEvents() {
      return [...events];
    },

    getHistory() {
      return history.list();
    },
  };
}
