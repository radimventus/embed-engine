import type {
  ActiveProjectModel,
  BuildResult,
  PublishResult,
  ReadinessIssue,
  ReadinessReport,
} from '../../model';

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function collectionReadyPercent(
  collections: ActiveProjectModel['assets']['media'],
): number {
  if (collections.length === 0) {
    return 0;
  }
  const ready = collections.filter(
    (item) => item.state === 'Ready' && item.files.length > 0,
  ).length;
  return clampPercent((ready / collections.length) * 100);
}

/**
 * ReadinessService (EPIC-BLD-06).
 * Evaluates Builder authoring readiness only — no Runtime interpretation.
 */
export function createReadinessService(): {
  evaluate(input: {
    readonly project: ActiveProjectModel;
    readonly latestBuild: BuildResult | null;
    readonly latestPublish: PublishResult | null;
  }): ReadinessReport;
} {
  return {
    evaluate({ project, latestBuild, latestPublish }) {
      const errors: ReadinessIssue[] = [];
      const warnings: ReadinessIssue[] = [];
      const recommendations: string[] = [];

      const mediaPercent = collectionReadyPercent(project.assets.media);
      const layoutPercent = collectionReadyPercent(project.assets.layout);
      const knowledgePercent = collectionReadyPercent(project.assets.knowledge);

      const hero = project.assets.media.find(
        (item) => item.categoryId === 'hero',
      );
      if (hero === undefined || hero.files.length === 0) {
        errors.push({
          code: 'HERO_MISSING',
          severity: 'error',
          message: 'Chybí Hero asset.',
          recommendation: 'Nahrajte Hero v sekci Média.',
        });
      }

      const layoutFiles = project.assets.layout.reduce(
        (sum, item) => sum + item.files.length,
        0,
      );
      if (layoutFiles === 0) {
        errors.push({
          code: 'LAYOUT_EMPTY',
          severity: 'error',
          message: 'Dispozice je prázdná.',
          recommendation: 'Přidejte alespoň jeden Layout resource.',
        });
      }

      if (knowledgePercent < 34) {
        warnings.push({
          code: 'KNOWLEDGE_LOW',
          severity: 'warning',
          message: 'Málo knowledge dokumentů.',
          recommendation: 'Doplňte PDF / DOCX / XLSX.',
        });
      }

      let buildPercent = 0;
      if (latestBuild === null) {
        recommendations.push('Spusťte Build po dokončení obsahu.');
      } else if (latestBuild.success) {
        buildPercent = 100;
      } else {
        buildPercent = 40;
        errors.push({
          code: 'BUILD_FAILED',
          severity: 'error',
          message: 'Poslední Build není úspěšný.',
          recommendation: 'Opravte chyby Buildu a spusťte znovu.',
        });
      }

      let publishPercent = 0;
      if (latestPublish === null) {
        recommendations.push('Po úspěšném Buildu spusťte Publish.');
      } else if (latestPublish.success) {
        publishPercent = 100;
      } else {
        publishPercent = 30;
        errors.push({
          code: 'PUBLISH_FAILED',
          severity: 'error',
          message: 'Poslední Publish selhal.',
          recommendation: 'Zkontrolujte ProjectPackage a zkuste Publish znovu.',
        });
      }

      if (errors.length === 0 && latestBuild === null) {
        recommendations.push('Projekt je blízko ReadyForBuild.');
      }

      const overallPercent = clampPercent(
        mediaPercent * 0.25 +
          layoutPercent * 0.25 +
          knowledgePercent * 0.15 +
          buildPercent * 0.2 +
          publishPercent * 0.15,
      );

      return {
        projectId: project.projectId,
        overallPercent,
        mediaPercent,
        layoutPercent,
        knowledgePercent,
        buildPercent,
        publishPercent,
        errors,
        warnings,
        recommendations: [
          ...recommendations,
          ...errors.map((item) => item.recommendation),
          ...warnings.map((item) => item.recommendation),
        ],
      };
    },
  };
}

export type ReadinessService = ReturnType<typeof createReadinessService>;
