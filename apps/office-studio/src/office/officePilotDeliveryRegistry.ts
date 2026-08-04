/**
 * PE-07 / PT-CJ-00 — Pilot Delivery public API.
 * Production path: deliverPilotOffer (SMTP + personalized PDF).
 */

export {
  buildPilotDeliveryPreview,
  buildPilotInvitationEmailBody,
  deliverPilot,
  deliverPilotOffer,
  generatePersonalizedPilotOfferPdf,
  verifyPartnerStudioLogin,
  verifyPilotDeliveryReadiness,
} from './pilotOfferDelivery';

export {
  getPilotDelivery,
  listPilotDeliveries,
  resetPilotDeliveryStoreForTests,
} from './officePilotDeliveryStore';
