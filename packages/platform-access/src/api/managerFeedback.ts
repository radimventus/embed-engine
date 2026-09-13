import {platformApiOrigin} from './platformAccessClient';

export type ManagerFeedbackRecord = {
  feedbackId: string; createdAt: string; userId: string | null; companyId: string | null;
  projectId: string | null; surface: 'MANAGER'; currentUrl: string | null; message: string; status: 'NEW';
  notificationStatus?: 'PENDING' | 'SENT' | 'FAILED' | 'NOT_CONFIGURED';
  notificationError?: string | null; notificationProviderId?: string | null; notifiedAt?: string | null;
};

async function feedbackResponse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error((await response.text()) || 'Feedback se nepodařilo načíst.');
  return response.json() as Promise<T>;
}

export async function listManagerFeedback(): Promise<readonly ManagerFeedbackRecord[]> {
  const response = await fetch(`${platformApiOrigin().replace(/\/$/, '')}/public/auth/manager-feedback`, {credentials: 'include'});
  return (await feedbackResponse<{entries: ManagerFeedbackRecord[]}>(response)).entries;
}

export async function getManagerFeedback(feedbackId: string): Promise<ManagerFeedbackRecord> {
  const response = await fetch(`${platformApiOrigin().replace(/\/$/, '')}/public/auth/manager-feedback/${encodeURIComponent(feedbackId)}`, {credentials: 'include'});
  return feedbackResponse<ManagerFeedbackRecord>(response);
}

export async function submitManagerFeedback(message: string): Promise<{feedbackId: string}> {
  const response = await fetch(`${platformApiOrigin().replace(/\/$/, '')}/public/auth/manager-feedback`, {
    method: 'POST', credentials: 'include', headers: {'content-type': 'application/json'},
    body: JSON.stringify({message, currentUrl: typeof location === 'undefined' ? null : `${location.origin}${location.pathname}`}),
  });
  if (!response.ok) throw new Error('Zpětnou vazbu se nepodařilo uložit. Text zůstal zachován; zkuste to znovu.');
  const body = await response.json() as {feedbackId?: unknown};
  if (typeof body.feedbackId !== 'string' || !body.feedbackId) throw new Error('Server nepotvrdil uložení zprávy.');
  return {feedbackId: body.feedbackId};
}
