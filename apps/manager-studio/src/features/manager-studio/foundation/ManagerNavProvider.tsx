import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import type { CapabilityId } from '@embed-engine/capabilities';

import { useActiveSection } from './useActiveSection';
import { CUSTOMER_SUCCESS_SECTION_NAV } from '../customer-success/customerSuccessVocabulary';
import { PLATFORM_OPS_SECTION_NAV } from '../operations-center/platformOpsVocabulary';
import { OPERATIONS_SECTION_NAV } from '../operations/operationsVocabulary';

type ManagerNavContextValue = {
  readonly activeSectionId: string | null;
  readonly activeCapabilityId: CapabilityId;
  readonly allSectionIds: readonly string[];
};

const ManagerNavContext = createContext<ManagerNavContextValue | null>(null);

function resolveCapability(sectionId: string | null): CapabilityId {
  if (sectionId === null) return 'operations-center';
  if (sectionId.startsWith('poc-')) return 'operations-center';
  if (sectionId.startsWith('cs-')) return 'customer-success';
  return 'operations';
}

/**
 * Shared scroll-spy for Platform Ops + Customer Success + Operations Terminal.
 */
export function ManagerNavProvider({ children }: { readonly children: ReactNode }) {
  const allSectionIds = useMemo(
    () => [
      ...PLATFORM_OPS_SECTION_NAV.map((item) => item.id),
      ...CUSTOMER_SUCCESS_SECTION_NAV.map((item) => item.id),
      ...OPERATIONS_SECTION_NAV.map((item) => item.id),
    ],
    [],
  );
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
