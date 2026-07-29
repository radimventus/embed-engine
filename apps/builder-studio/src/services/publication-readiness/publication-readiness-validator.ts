import type {
  InitializePublicationReadinessInput,
  PublicationReadinessEvent,
  PublicationReadinessIndexEntry,
  PublicationReadinessPackage,
  ValidatePublicationReadinessInput,
} from '../../model';
import {
  buildInitialPublicationReadinessPackage,
  createBasicPublicationReadinessStrategy,
  type PublicationReadinessStrategy,
} from './basic-publication-readiness-strategy';
import {
  createPublicationReadinessIndex,
  type PublicationReadinessIndex,
} from './publication-readiness-index';

export type PublicationReadinessValidatorOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: PublicationReadinessStrategy;
  readonly index?: PublicationReadinessIndex;
};

export type PublicationReadinessValidator = {
  initialize(
    input: InitializePublicationReadinessInput,
  ): PublicationReadinessPackage;
  validate(
    packageId: string,
    input: ValidatePublicationReadinessInput,
  ): PublicationReadinessPackage;
  evaluate(packageId: string): PublicationReadinessPackage;
  publish(packageId: string): PublicationReadinessPackage;
  dispose(packageId: string): PublicationReadinessPackage;
  getPublicationReadiness(packageId: string): PublicationReadinessPackage | null;
  listPublicationReadinessReports(): readonly PublicationReadinessPackage[];
  findPublicationReadiness(
    publicationId: string,
  ): PublicationReadinessPackage | null;
  getEvents(): readonly PublicationReadinessEvent[];
  getIndex(): readonly PublicationReadinessIndexEntry[];
};

export function createPublicationReadinessValidator(
  options: PublicationReadinessValidatorOptions = {},
): PublicationReadinessValidator {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicPublicationReadinessStrategy();
  const index = options.index ?? createPublicationReadinessIndex();

  const packages = new Map<string, PublicationReadinessPackage>();
  const events: PublicationReadinessEvent[] = [];

  const emit = (
    type: PublicationReadinessEvent['type'],
    packageId: string,
    reportId: string | null,
    publicationId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('publication-readiness-event'),
      type,
      packageId,
      reportId,
      publicationId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): PublicationReadinessPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Publication readiness package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: PublicationReadinessPackage): PublicationReadinessPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) {
        throw new Error('Publication readiness validator requires sessionId.');
      }
      let pkg = store(buildInitialPublicationReadinessPackage(input, createId, now));
      if (input.publication !== undefined) {
        pkg = this.validate(pkg.id, input.publication);
      }
      return pkg;
    },

    validate(packageId, input) {
      const pkg = requirePackage(packageId);
      if (!strategy.supports(input)) {
        throw new Error('Publication readiness strategy does not support this input.');
      }
      const report = strategy.validate(input, createId);
      const next: PublicationReadinessPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        report,
        metadata: {
          ...pkg.metadata,
          title: report.metadata.title,
          status: 'Validated',
          notes: 'Publication readiness validated.',
        },
      };
      store(next);
      emit(
        'PublicationReadinessValidated',
        next.id,
        next.report.id,
        next.report.publicationId,
        `Validated readiness for ${next.report.publicationId}.`,
      );
      emit(
        report.status === 'NOT_READY'
          ? 'PublicationReadinessFailed'
          : 'PublicationReadinessPassed',
        next.id,
        next.report.id,
        next.report.publicationId,
        report.status === 'NOT_READY'
          ? `Readiness failed for ${next.report.publicationId}.`
          : `Readiness passed for ${next.report.publicationId}.`,
      );
      return next;
    },

    evaluate(packageId) {
      const pkg = requirePackage(packageId);
      const report = strategy.evaluate(pkg.report);
      const next: PublicationReadinessPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        report,
        metadata: {
          ...pkg.metadata,
          status: 'Validated',
          notes: 'Publication readiness evaluated.',
        },
      };
      store(next);
      return next;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      if (pkg.report.status === 'NOT_READY') {
        throw new Error('Cannot publish NOT_READY readiness report.');
      }
      const next: PublicationReadinessPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published readiness decision.',
        },
      };
      store(next);
      emit(
        'PublicationReadinessPublished',
        next.id,
        next.report.id,
        next.report.publicationId,
        `Published readiness decision for ${next.report.publicationId}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: PublicationReadinessPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed readiness package (read-only archive).',
        },
      };
      store(next);
      return next;
    },

    getPublicationReadiness(packageId) {
      return packages.get(packageId) ?? null;
    },

    listPublicationReadinessReports() {
      return [...packages.values()];
    },

    findPublicationReadiness(publicationId) {
      return (
        [...packages.values()].find(
          (item) => item.report.publicationId === publicationId,
        ) ?? null
      );
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
