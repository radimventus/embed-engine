/**
 * CAP-OP-09 / CAP-OP-10 — Mail transport public surface for Office wiring.
 * Re-exports session types only — no live IMAP/SMTP clients.
 */

export type {
  MailSyncReport,
  PilotMailTransportSession,
  SystemMailDraft,
} from './mailTransportService';
export { createMailTransportSession } from './mailTransportService';
export {
  createPilotMailSession,
  wirePilotMailTransportSession,
  DEFAULT_PILOT_MAILBOX_ID,
} from './createPilotMailSession';
export {
  createOfferDeliveryMailSession,
  PILOT_MAIL_RELAY_PATH,
} from './createOfferDeliveryMailSession';
export {
  getConversationMailStore,
  resetConversationMailStore,
  storeConversationsForCase,
  storeMessagesForConversation,
  listStoreMailboxes,
} from './conversationMailStore';
