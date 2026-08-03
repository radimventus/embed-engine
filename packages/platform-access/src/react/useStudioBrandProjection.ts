import { useMemo } from 'react';

import {
  projectPartnerBrand,
  type StudioBrandProjection,
} from '../pilot/projectPartnerBrand';
import { usePlatformSession } from './SessionProvider';

/**
 * PE-02 — resolve unified partner brand for Manager / Sales (session-bound).
 */
export function useStudioBrandProjection(): StudioBrandProjection {
  const { session, bootstrap } = usePlatformSession();
  return useMemo(
    () =>
      projectPartnerBrand({
        companyId: session?.companyId ?? bootstrap?.company.id ?? null,
        fallbackCompanyName: bootstrap?.company.name ?? null,
      }),
    [
      session?.companyId,
      bootstrap?.company.id,
      bootstrap?.company.name,
    ],
  );
}
