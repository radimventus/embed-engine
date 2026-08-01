/**
 * EPIC-BX-09 — Decision Coach: personas + Decision Path + Runtime priority profiles.
 * No LLM — uses Preview personas (ChangePriority profiles) and Experience path.
 */

import { loadExperienceComposition } from '../experience-composer/experienceComposerStorage';
import type { ExperienceModuleId } from '../experience-composer/experienceComposition';
import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import { buildDecisionPath } from '../preview-center/decisionPath';
import { PREVIEW_PERSONAS } from '../preview-center/previewPersonas';
import type { CoachFinding, CoachReport } from './intelligenceTypes';

const CRITICAL_STEPS: readonly ExperienceModuleId[] = [
  'hero',
  'priority',
  'house-navigator',
  'faq',
  'lead-capture',
];

export function buildDecisionCoach(input: {
  readonly projectId: string;
  readonly snapshot: HousePackageEditSnapshot | null;
}): CoachReport {
  const findings: CoachFinding[] = [];
  const composition = loadExperienceComposition(
    input.projectId,
    input.snapshot?.working.heroRelativePath,
  );
  const path = buildDecisionPath({
    projectId: input.projectId,
    heroRelativePath: input.snapshot?.working.heroRelativePath,
  });
  const enabledIds = new Set(
    path.filter((step) => step.enabled).map((step) => step.id),
  );
  const disabledCritical = CRITICAL_STEPS.filter((id) => !enabledIds.has(id));

  for (const stepId of disabledCritical) {
    findings.push({
      id: `decision-path-missing-${stepId}`,
      title: `Decision Path bez kroku ${stepId}`,
      detail: 'Důležitý krok Experience není aktivní — persona ho nenavštíví.',
      severity: 'high',
      nav: 'experience',
    });
  }

  const neverVisited = path.filter((step) => !step.enabled);
  if (neverVisited.length > 0) {
    findings.push({
      id: 'decision-never-visited',
      title: 'Části Experience nejsou nikdy navštíveny',
      detail: `Vypnuto: ${neverVisited.map((step) => step.label).join(', ')}.`,
      severity: neverVisited.length >= 2 ? 'high' : 'medium',
      nav: 'experience',
    });
  }

  for (const persona of PREVIEW_PERSONAS) {
    const needsLayout = persona.priorityIds.includes('layout');
    const needsEnergy = persona.priorityIds.includes('energy');
    const hasNavigator = enabledIds.has('house-navigator');
    const hasFaq = enabledIds.has('faq');

    if (needsLayout && !hasNavigator) {
      findings.push({
        id: `decision-persona-${persona.id}-layout`,
        title: `${persona.label}: neuvidí dispozici`,
        detail: 'Persona potřebuje layout priority, ale House Navigator je vypnutý.',
        severity: 'high',
        nav: 'preview-center',
      });
    }

    if (needsEnergy && !hasFaq && composition.configs.faq.items.length < 1) {
      findings.push({
        id: `decision-persona-${persona.id}-energy`,
        title: `${persona.label}: chybí energetický kontext`,
        detail: 'Persona má energy priority — doplňte FAQ nebo Knowledge.',
        severity: 'medium',
        nav: 'knowledge',
      });
    }
  }

  if (!composition.configs.priority.enabled) {
    findings.push({
      id: 'decision-no-priority-runtime',
      title: 'Runtime nedostane Decision Signal',
      detail: 'Priority modul je vypnutý — ChangePriority se neaplikuje.',
      severity: 'high',
      nav: 'preview-center',
    });
  }

  const unique = dedupeFindings(findings);
  const penalty = unique.reduce(
    (sum, item) =>
      sum + (item.severity === 'high' ? 16 : item.severity === 'medium' ? 9 : 4),
    0,
  );

  return {
    id: 'decision',
    label: 'Decision Coach',
    description: 'Decision Path a persony přes Runtime priority.',
    findings: unique,
    score: Math.max(0, Math.min(100, 100 - penalty)),
  };
}

function dedupeFindings(findings: readonly CoachFinding[]): CoachFinding[] {
  const seen = new Set<string>();
  const result: CoachFinding[] = [];
  for (const finding of findings) {
    if (seen.has(finding.id)) continue;
    seen.add(finding.id);
    result.push(finding);
  }
  return result;
}
