import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import type { CapabilityId } from '@embed-engine/capabilities';

import { useActiveSection } from './useActiveSection';
import { COMMERCIAL_SECTION_NAV } from '../commercial/commercialVocabulary';
import { CUSTOMER_SUCCESS_SECTION_NAV } from '../customer-success/customerSuccessVocabulary';
import { LAUNCH_SECTION_NAV } from '../launch/launchVocabulary';
import { PLATFORM_OPS_SECTION_NAV } from '../operations-center/platformOpsVocabulary';
import { PRODUCT_LEARNING_SECTION_NAV } from '../product-learning/productLearningVocabulary';
import { OPERATIONS_SECTION_NAV } from '../operations/operationsVocabulary';

type ManagerNavContextValue = {
  readonly activeSectionId: string | null;
  readonly activeCapabilityId: CapabilityId;
  readonly allSectionIds: readonly string[];
};

const ManagerNavContext = createContext<ManagerNavContextValue | null>(null);

function resolveCapability(sectionId: string | null): CapabilityId {
  if (sectionId === null) return 'launch-center';
  if (
    sectionId === 'manager-work-center' ||
    sectionId.startsWith('mwc-')
  ) {
    return 'operations';
  }
  if (sectionId.startsWith('lc-')) return 'launch-center';
  if (sectionId.startsWith('poc-')) return 'operations-center';
  if (sectionId.startsWith('cm-')) return 'commercial-platform';
  if (sectionId.startsWith('pl-')) return 'product-learning';
  if (sectionId.startsWith('cs-')) return 'customer-success';
  return 'operations';
}

/**
 * Shared scroll-spy for Manager work center + capability projections.
 */
export function ManagerNavProvider({ children }: { readonly children: ReactNode }) {
  const allSectionIds = useMemo(
    () => [
      'manager-work-center',
      'mwc-dropoff',
      'mwc-factors',
      'mwc-improvements',
      ...LAUNCH_SECTION_NAV.map((item) => item.id),
      ...PLATFORM_OPS_SECTION_NAV.map((item) => item.id),
      ...COMMERCIAL_SECTION_NAV.map((item) => item.id),
      ...PRODUCT_LEARNING_SECTION_NAV.map((item) => item.id),
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
