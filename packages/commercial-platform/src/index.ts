export type {
  CommercialEdition,
  CommercialPlan,
  TrialStatus,
  CompanySubscriptionProjection,
  CapabilityEntitlementRow,
  LicenseProjection,
  UpgradeRecommendation,
  CommercialDashboard,
  CommercialExecutiveView,
  CommercialPlatformReport,
} from './domain/types';

export {
  entitlementsAllowedByPlan,
  isCapabilityAvailableOnPlan,
  GROWTH_SIGNAL_CAPABILITIES,
} from './engine/planEntitlements';

export { buildCommercialPlatformReport } from './engine/buildCommercialPlatformReport';
