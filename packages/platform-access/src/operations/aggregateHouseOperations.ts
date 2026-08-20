import {
  HIGH_INTENT_THRESHOLD,
  type HouseOperationalAggregate,
  type HouseOperationalCase,
} from './operationalTypes';

export function aggregateHouseOperations(
  cases: readonly HouseOperationalCase[],
): HouseOperationalAggregate {
  const priorityMap = new Map<string, number>();
  const journeyMap = new Map<string, number>();

  for (const item of cases) {
    for (const tag of item.profilZajemce.tags) {
      priorityMap.set(tag, (priorityMap.get(tag) ?? 0) + 1);
    }
    for (const step of item.profilZajemce.journey) {
      if (step.completed !== true) continue;
      journeyMap.set(step.module, (journeyMap.get(step.module) ?? 0) + 1);
    }
  }

  const priorityCounts = [...priorityMap.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'cs'));

  const journeyModuleCounts = [...journeyMap.entries()]
    .map(([module, completedCount]) => ({ module, completedCount }))
    .sort((a, b) => b.completedCount - a.completedCount || a.module.localeCompare(b.module, 'cs'));

  return {
    caseCount: cases.length,
    convertedCount: cases.filter(
      (item) => item.conversion.status === 'accepted',
    ).length,
    highIntentCount: cases.filter(
      (item) => item.profilZajemce.score >= HIGH_INTENT_THRESHOLD,
    ).length,
    priorityCounts,
    journeyModuleCounts,
  };
}
