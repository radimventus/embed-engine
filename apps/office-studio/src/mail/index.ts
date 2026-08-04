/**
 * CAP-OP-09 — Mail transport public surface for Conversation Runtime wiring.
 * Re-exports session types only — no live IMAP/SMTP clients.
 */

export type {
  MailSyncReport,
  PilotMailTransportSession,
  SystemMailDraft,
} from './mailTransportService';
export { createMailTransportSession } from './mailTransportService';
export {
  getConversationMailStore,
  resetConversationMailStore,
  storeConversationsForCase,
  storeMessagesForConversation,
  listStoreMailboxes,
} from './conversationMailStore';
