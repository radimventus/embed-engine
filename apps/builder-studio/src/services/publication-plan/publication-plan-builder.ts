import type {
  BuildPublicationPlanInput,
  InitializePublicationPlanInput,
  PublicationPlan,
  PublicationPlanEvent,
  PublicationPlanIndexEntry,
  PublicationPlanPackage,
  PublicationPlanValidation,
} from '../../model';
import {
  buildInitialPublicationPlanPackage,
  createBasicPublicationPlanStrategy,
  createPublicationPlanValidator,
  type PublicationPlanStrategy,
  type PublicationPlanValidator,
} from './basic-publication-plan-strategy';
import {
  createPublicationPlanIndex,
  type PublicationPlanIndex,
} from './publication-plan-index';

export type PublicationPlanBuilderOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: PublicationPlanStrategy;
  readonly validator?: PublicationPlanValidator;
  readonly index?: PublicationPlanIndex;
};

export type PublicationPlanBuilder = {
  initialize(input: InitializePublicationPlanInput): PublicationPlanPackage;
  build(packageId: string, input: BuildPublicationPlanInput): PublicationPlanPackage;
  validate(packageId: string): PublicationPlanValidation;
  publish(packageId: string): PublicationPlanPackage;
  dispose(packageId: string): PublicationPlanPackage;
  getPackage(packageId: string): PublicationPlanPackage | null;
  listPackages(): readonly PublicationPlanPackage[];
  listPublicationPlans(): readonly PublicationPlan[];
  findPublicationPlan(rootArtifactId: string): PublicationPlan | null;
  getEvents(): readonly PublicationPlanEvent[];
  getIndex(): readonly PublicationPlanIndexEntry[];
};

export function createPublicationPlanBuilder(
  options: PublicationPlanBuilderOptions = {},
): PublicationPlanBuilder {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicPublicationPlanStrategy();
  const validator = options.validator ?? createPublicationPlanValidator({ now });
  const index = options.index ?? createPublicationPlanIndex();

  const packages = new Map<string, PublicationPlanPackage>();
  const events: PublicationPlanEvent[] = [];

  const emit = (
    type: PublicationPlanEvent['type'],
    packageId: string,
    planId: string | null,
    rootArtifactId: string | null,
    message: string,
  ) => {
    events.push({
      eventId: createId('publication-plan-event'),
      type,
      packageId,
      planId,
      rootArtifactId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): PublicationPlanPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Publication plan package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: PublicationPlanPackage): PublicationPlanPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) {
        throw new Error('Publication plan builder requires sessionId.');
      }
      let pkg = store(buildInitialPublicationPlanPackage(input, createId, now));
      if (input.plan !== undefined) {
        pkg = this.build(pkg.id, input.plan);
      }
      return pkg;
    },

    build(packageId, input) {
      const pkg = requirePackage(packageId);
      if (!strategy.supports(input)) {
        throw new Error('Publication plan strategy does not support this input.');
      }
      const plan = strategy.build(input, createId);
      const next: PublicationPlanPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        plan,
        validation: null,
        metadata: {
          ...pkg.metadata,
          title: plan.metadata.title,
          status: 'Active',
          notes: 'Built publication plan.',
        },
      };
      store(next);
      emit(
        'PublicationPlanBuilt',
        next.id,
        next.plan.id,
        next.plan.rootArtifactId,
        `Built publication plan for ${next.plan.rootArtifactId}.`,
      );
      return next;
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const strategyIssues = strategy.validate(pkg.plan);
      const nextValidation: PublicationPlanValidation = {
        ...validation,
        valid: validation.valid && strategyIssues.length === 0,
        issues: [
          ...validation.issues,
          ...strategyIssues.map((message) => ({
            code: 'plan-strategy',
            severity: 'error' as const,
            message,
          })),
        ],
      };
      const nextPlan: PublicationPlan = {
        ...pkg.plan,
        status:
          nextValidation.valid ? 'Valid' : 'Invalid',
      };
      const next: PublicationPlanPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        plan: nextPlan,
        validation: nextValidation,
      };
      store(next);
      emit(
        nextValidation.valid
          ? 'PublicationPlanValidated'
          : 'PublicationPlanInvalidated',
        next.id,
        next.plan.id,
        next.plan.rootArtifactId,
        nextValidation.valid
          ? `Validated publication plan ${next.plan.rootArtifactId}.`
          : `Publication plan invalid for ${next.plan.rootArtifactId}.`,
      );
      return nextValidation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? this.validate(packageId);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid publication plan.');
      }
      const next: PublicationPlanPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        plan: {
          ...pkg.plan,
          status: 'Published',
        },
        validation,
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published publication plan artifact.',
        },
      };
      store(next);
      emit(
        'PublicationPlanPublished',
        next.id,
        next.plan.id,
        next.plan.rootArtifactId,
        `Published plan ${next.plan.rootArtifactId}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: PublicationPlanPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed publication plan package (read-only archive).',
        },
      };
      store(next);
      return next;
    },

    getPackage(packageId) {
      return packages.get(packageId) ?? null;
    },

    listPackages() {
      return [...packages.values()];
    },

    listPublicationPlans() {
      return [...packages.values()].map((pkg) => pkg.plan);
    },

    findPublicationPlan(rootArtifactId) {
      return (
        [...packages.values()].find(
          (pkg) => pkg.plan.rootArtifactId === rootArtifactId,
        )?.plan ?? null
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
