import assert from 'node:assert/strict';
import test from 'node:test';
import {getManagerFeedback, listManagerFeedback, submitManagerFeedback} from './managerFeedback';

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

test('Office feedback client reads list and detail with the authenticated session', async () => {
  const original=globalThis.fetch;
  const calls:string[]=[];
  globalThis.fetch=async (url,input)=>{
    calls.push(String(url)); assert.equal(input?.credentials,'include');
    return Response.json(calls.length===1 ? {entries:[{feedbackId:'id-1'}]} : {feedbackId:'id-1',message:'Detail'});
  };
  try {
    assert.equal((await listManagerFeedback())[0]!.feedbackId,'id-1');
    assert.equal((await getManagerFeedback('id-1')).message,'Detail');
    assert.match(calls[0]!,/manager-feedback$/); assert.match(calls[1]!,/manager-feedback\/id-1$/);
  } finally {globalThis.fetch=original;}
});
