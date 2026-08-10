/**
 * CAP-PLAT-02d.2 / CAP-PLAT-04i — Manager presentation labels from CPL slices.
 * No parallel Company / Project / House adapters.
 *
 * CAP-PLAT-04i helper: `{company.name} · {house.heroLabel | house.name} · {project.name}`
 */

import type { CanonicalProjectProjection } from '@embed-engine/platform-access';

import { resolveCanonicalRuntimeBindingFromSession } from './managerCanonicalBind';

export type ManagerCanonicalIdentityLabels = {
  readonly companyLabel: string;
  readonly projectLabel: string;
  readonly houseLabel: string;
  readonly logoLabel: string | null;
  readonly helperLine: string;
  readonly projection: CanonicalProjectProjection | null;
};

const DEFAULT_HELPER =
  'Analýza konverzního trychtýře a klíčových rozhodovacích faktorů zákazníků.';

/**
 * Session projectId → CPL presentation identity (Company / Project / House).
 */
export function resolveManagerCanonicalIdentity(
  sessionProjectId: string | null | undefined,
): ManagerCanonicalIdentityLabels {
  const binding = resolveCanonicalRuntimeBindingFromSession(
    sessionProjectId?.trim() || null,
  );
  const projection = binding.project;
  if (projection === null || projection.house === null) {
    return {
      companyLabel: '—',
      projectLabel: '—',
      houseLabel: '—',
      logoLabel: null,
      helperLine: DEFAULT_HELPER,
      projection: null,
    };
  }

  const companyLabel =
    projection.partner.companyName.trim() || projection.partner.companyId;
  const projectLabel =
    projection.project.name.trim() || projection.project.projectId;
  const houseLabel =
    projection.house.name.trim() || projection.house.houseId;
  const hero = projection.branding.heroLabel.trim();
  const houseHeroOrName = hero.length > 0 ? hero : houseLabel;
  const helperParts = [companyLabel, houseHeroOrName, projectLabel].filter(
    (part) => part.length > 0 && part !== '—',
  );

  return {
    companyLabel,
    projectLabel,
    houseLabel,
    logoLabel: projection.branding.logoLabel.trim() || null,
    helperLine:
      helperParts.length > 0 ? helperParts.join(' · ') : DEFAULT_HELPER,
    projection,
  };
}
