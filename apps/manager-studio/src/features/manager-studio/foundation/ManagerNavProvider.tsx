import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import type { CapabilityId } from '@embed-engine/capabilities';

import { useActiveSection } from './useActiveSection';

type ManagerNavContextValue = {
  readonly activeSectionId: string | null;
  readonly activeCapabilityId: CapabilityId;
  readonly allSectionIds: readonly string[];
};

const ManagerNavContext = createContext<ManagerNavContextValue | null>(null);

/**
 * PR-005 — Scroll-spy pracovního centra (ne capability seznam).
 */
export function ManagerNavProvider({ children }: { readonly children: ReactNode }) {
  const allSectionIds = useMemo(
    () => [
      'manager-work-center',
      'mwc-dropoff',
      'mwc-factors',
      'mwc-improvements',
    ],
    [],
  );
  const activeSectionId = useActiveSection(allSectionIds);
  const activeCapabilityId: CapabilityId = 'operations';

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
