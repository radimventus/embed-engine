import assert from 'node:assert/strict';
import test from 'node:test';
import {submitManagerFeedback} from './managerFeedback';

test('Manager transport requires a durable receipt and uses authenticated POST', async () => {
  const original = globalThis.fetch;
  let status = 503;
  let payload: unknown = {error: 'disk failure'};
  globalThis.fetch = async (_url, input) => {
    assert.equal(input?.method, 'POST');
    assert.equal(input?.credentials, 'include');
    assert.equal(JSON.parse(input?.body as string).message, 'Zpráva');
    return new Response(JSON.stringify(payload), {status});
  };
  try {
    await assert.rejects(submitManagerFeedback('Zpráva'));
    status=200; payload={ok:true};
    await assert.rejects(submitManagerFeedback('Zpráva'));
    status=201; payload={feedbackId:'record-1'};
    assert.deepEqual(await submitManagerFeedback('Zpráva'), {feedbackId:'record-1'});
  } finally {globalThis.fetch=original;}
});
