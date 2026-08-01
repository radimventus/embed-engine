import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import type { CapabilityId } from '@embed-engine/capabilities';

import { useActiveSection } from './useActiveSection';
import { PARTNER_SECTION_IDS } from '../partnerNav';

type ManagerNavContextValue = {
  readonly activeSectionId: string | null;
  readonly activeCapabilityId: CapabilityId;
  readonly allSectionIds: readonly string[];
};

const ManagerNavContext = createContext<ManagerNavContextValue | null>(null);

function resolveCapability(sectionId: string | null): CapabilityId {
  if (sectionId === null) return 'operations';
  if (
    sectionId === 'manager-work-center' ||
    sectionId.startsWith('mwc-')
  ) {
    return 'operations';
  }
  if (sectionId.startsWith('poc-')) return 'operations-center';
  if (sectionId.startsWith('pl-')) return 'product-learning';
  return 'operations';
}

/**
 * PR-026 — scroll-spy for partner sections only.
 */
export function ManagerNavProvider({ children }: { readonly children: ReactNode }) {
  const allSectionIds = useMemo(() => [...PARTNER_SECTION_IDS], []);
  const activeSectionId = useActiveSection(allSectionIds);
  const activeCapabilityId = resolveCapability(activeSectionId);

  const value = useMemo(
    () => ({
      activeSectionId,
      activeCapabilityId,
      allSectionIds,
    }),
    [activeSectionId, activeCapabilityId, allSectionIds],
  );

  return (
    <ManagerNavContext.Provider value={value}>
      {children}
    </ManagerNavContext.Provider>
  );
}

export function useManagerNav(): ManagerNavContextValue {
  const ctx = useContext(ManagerNavContext);
  if (ctx === null) {
    throw new Error('useManagerNav requires ManagerNavProvider');
  }
  return ctx;
}
