import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DEFAULT_PILOT_BRANDING_HERO,
  DEFAULT_PILOT_BRANDING_LOGO,
} from '../domain/partnerBranding';
import {
  resetPartnerBrandingStore,
  upsertPartnerBranding,
} from './partnerBrandingStore';
import { projectPartnerBrand } from './projectPartnerBrand';

describe('PE-02 Brand Projection', () => {
  it('projects company, logo and hero from the branding store', () => {
    resetPartnerBrandingStore();
    upsertPartnerBranding({
      companyId: 'company-pilot-domu',
      firmName: 'Pilot Domů',
      logoLabel: 'Pilot Domů Mark',
      heroLabel: 'Pilot Domů Hero',
    });

    const brand = projectPartnerBrand({ companyId: 'company-pilot-domu' });
    assert.equal(brand.personalized, true);
    assert.equal(brand.companyName, 'Pilot Domů');
    assert.equal(brand.tradeMark, 'Pilot Domů');
    assert.equal(brand.logoLabel, 'Pilot Domů Mark');
    assert.equal(brand.heroLabel, 'Pilot Domů Hero');
  });

  it('falls back to defaults without inventing a second brand source', () => {
    resetPartnerBrandingStore();
    const brand = projectPartnerBrand({
      companyId: 'company-missing',
      fallbackCompanyName: 'Nordhaus',
    });
    assert.equal(brand.personalized, false);
    assert.equal(brand.companyName, 'Nordhaus');
    assert.equal(brand.logoLabel, DEFAULT_PILOT_BRANDING_LOGO);
    assert.equal(brand.heroLabel, DEFAULT_PILOT_BRANDING_HERO);
  });
});
