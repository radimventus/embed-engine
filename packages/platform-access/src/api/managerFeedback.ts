import {platformApiOrigin} from './platformAccessClient';

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
