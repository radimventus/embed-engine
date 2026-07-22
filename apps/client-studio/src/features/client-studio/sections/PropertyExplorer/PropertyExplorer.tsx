import { useMemo, useState } from 'react';

import { SECTION_SURFACE_CLASS } from '../../section-surface';
import { PILOT_SECTION_IDS } from '../../pilot/pilotVocabulary';
import { FeatureGroups } from './FeatureGroups';
import { KeyMetrics } from './KeyMetrics';
import { ObjectSummary } from './ObjectSummary';
import { PropertyExplorerNav } from './PropertyExplorerNav';
import type { PropertyFeatureGroupId } from './propertyExplorerModel';
import { usePropertyFeatureGroups } from './usePropertyFeatureGroups';

/**
 * Property Explorer — Object Discovery Decision Surface (CSCB-02 / SR-003).
 * Answers: “Co tento dům skutečně nabízí?”
 * Reads Runtime Context / house projection only. No Object Package. No dispatch.
 */
export function PropertyExplorer() {
  const groups = usePropertyFeatureGroups();
  const [activeGroupId, setActiveGroupId] =
    useState<PropertyFeatureGroupId>('layout');

  const activeGroup = useMemo(
    () => groups.find((group) => group.id === activeGroupId) ?? groups[0]!,
    [activeGroupId, groups],
  );

  return (
    <section
      id={PILOT_SECTION_IDS.propertyExplorer}
      tabIndex={-1}
      aria-label="Property Explorer"
      className={`scroll-mt-header ${SECTION_SURFACE_CLASS}`}
    >
      <ObjectSummary />
      <KeyMetrics />
      <PropertyExplorerNav
        groups={groups}
        activeId={activeGroup.id}
        onSelect={setActiveGroupId}
      />
      <FeatureGroups group={activeGroup} />
    </section>
  );
}
