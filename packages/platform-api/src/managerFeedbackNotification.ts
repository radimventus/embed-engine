import type {SendMailOptions} from 'nodemailer';
import type {ManagerFeedback} from './feedbackRepository';
import {createConisMailTransport, readConisSmtpConfig, type ConisMailTransport} from './partnerPasswordResetSmtp';

export type FeedbackNotificationEvent = {
  event: 'manager_feedback_notification'; feedbackId: string;
  status: 'SENT' | 'FAILED' | 'NOT_CONFIGURED'; reason?: 'RECIPIENT_MISSING' | 'SMTP_MISSING' | 'INVALID_CONFIG' | 'SMTP_ERROR';
  providerId?: string; error?: string;
};
export type FeedbackNotificationOutcome = Omit<FeedbackNotificationEvent, 'event' | 'feedbackId'>;
export type FeedbackNotifier = (entry: ManagerFeedback) => Promise<FeedbackNotificationOutcome>;
export type FeedbackNotificationLogger = (event: FeedbackNotificationEvent) => void;

export function managerFeedbackMail(entry: ManagerFeedback, from: string, recipient: string): SendMailOptions {
  return {from, to: recipient, subject: `CONIS – Manager feedback ${entry.feedbackId}`,
    text: [
      `createdAt: ${entry.createdAt}`, `feedbackId: ${entry.feedbackId}`,
      `userId: ${entry.userId ?? 'neuvedeno'}`, `companyId: ${entry.companyId ?? 'neuvedeno'}`,
      `projectId: ${entry.projectId ?? 'neuvedeno'}`, `surface: ${entry.surface}`,
      `currentUrl: ${entry.currentUrl ?? 'neuvedeno'}`,
      ...('category' in entry && typeof entry.category === 'string' ? [`category: ${entry.category}`] : []),
      '', entry.message,
    ].join('\n')};
}

/** Notification only: never mutates or rolls back the canonical feedback record. */
export function createManagerFeedbackNotifier(
  environment: NodeJS.ProcessEnv = process.env,
  transport?: ConisMailTransport,
  logger: FeedbackNotificationLogger = event => console.info(JSON.stringify(event)),
): FeedbackNotifier {
  const recipient = environment.MANAGER_FEEDBACK_EMAIL_TO?.trim() || environment.NOTIFICATION_EMAIL?.trim() || '';
  let smtp: ReturnType<typeof readConisSmtpConfig> = null;
  let unavailable: Pick<FeedbackNotificationEvent, 'status' | 'reason'> | undefined;
  try {
    if (!recipient) unavailable = {status: 'NOT_CONFIGURED', reason: 'RECIPIENT_MISSING'};
    else if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(recipient)) unavailable = {status: 'FAILED', reason: 'INVALID_CONFIG'};
    else {
      smtp = readConisSmtpConfig(environment);
      if (!smtp) unavailable = {status: 'NOT_CONFIGURED', reason: 'SMTP_MISSING'};
      else transport ??= createConisMailTransport(smtp, {connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000});
    }
  } catch { unavailable = {status: 'FAILED', reason: 'INVALID_CONFIG'}; }
  return async entry => {
    let outcome: FeedbackNotificationOutcome | undefined = unavailable;
    if (!outcome) {
      try {
        const result = await transport!.sendMail(managerFeedbackMail(entry, smtp!.from, recipient));
        const providerId = typeof result === 'object' && result !== null && 'messageId' in result && typeof result.messageId === 'string'
          ? result.messageId : undefined;
        outcome = {status: 'SENT', ...(providerId ? {providerId} : {})};
      } catch (error) {
        const value = error as {code?: unknown; command?: unknown; message?: unknown};
        let detail = [value.code, value.command, value.message].filter(part => typeof part === 'string' && part.length > 0).join(' · ');
        for (const secret of [environment.SMTP_PASSWORD, environment.SMTP_PASS, environment.SMTP_USER]) {
          if (secret?.trim()) detail = detail.split(secret).join('[REDACTED]');
        }
        detail = detail.slice(0, 500);
        outcome = {status: 'FAILED', reason: 'SMTP_ERROR', ...(detail ? {error: detail} : {})};
      }
    }
    // Log only identifiers/outcome: never SMTP credentials or feedback text.
    try { logger({event: 'manager_feedback_notification', feedbackId: entry.feedbackId, ...outcome}); }
    catch { /* A logging failure must not turn a durable submission into a failed one. */ }
    return outcome;
  };
}
