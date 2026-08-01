export type {
  CommercialEdition,
  CommercialPlan,
  TrialStatus,
  RenewalState,
  CompanySubscriptionProjection,
  CapabilityEntitlementRow,
  LicenseProjection,
  UpgradeRecommendation,
  CommercialCompanyRow,
  CommercialDashboard,
  CommercialExecutiveView,
  CommercialPlatformReport,
} from './domain/types';

export {
  entitlementsAllowedByPlan,
  isCapabilityAvailableOnPlan,
  GROWTH_SIGNAL_CAPABILITIES,
  BUILDER_USAGE_CAPABILITIES,
} from './engine/planEntitlements';

export { buildCommercialPlatformReport } from './engine/buildCommercialPlatformReport';
