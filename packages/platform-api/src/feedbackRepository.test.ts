import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {FileFeedbackRepository} from './feedbackRepository';
import {createPlatformApiServer} from './index';

test('Manager feedback is durable, scoped by session, retrievable by admin and fails closed', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-feedback-'));
  const files = new FileFeedbackRepository(dir);
  let fail = false;
  const repository = {create: (input: Parameters<typeof files.create>[0]) => fail ? Promise.reject(new Error('disk')) : files.create(input),
    list: () => files.list(), get: (id: string) => files.get(id), updateNotification: (id:string,input:Parameters<typeof files.updateNotification>[1])=>files.updateNotification(id,input)};
  const sessions = {resolve: async (token: string) => token === 'missing' ? null : {
    user: {id: 'user-1', roles: [token === 'admin' ? 'conis-admin' : 'manager']}, companyId: 'company-1', projectId: 'project-1'}};
  const server = createPlatformApiServer(undefined,undefined,undefined,undefined,undefined,sessions as never,
    undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,repository);
  try {
    await new Promise<void>(resolve => server.listen(0,'127.0.0.1',resolve));
    const address = server.address(); assert.ok(address && typeof address !== 'string');
    const url = `http://127.0.0.1:${address.port}/public/auth/manager-feedback`;
    const send = (body: unknown, token='manager') => fetch(url, {method:'POST', headers:{'content-type':'application/json', cookie:`__Host-conis_partner_session=${token}`}, body:JSON.stringify(body)});
    assert.equal((await send({message:'A'}, 'missing')).status,401);
    assert.equal((await send({message:' '})).status,400);
    const response = await send({message:'  Prosím upravit přehled.  ', userId:'forged', projectId:'forged', surface:'CLIENT', currentUrl:'https://conis.cz/studio/workspace/?token=secret#private'});
    assert.equal(response.status,201);
    const {feedbackId} = await response.json() as {feedbackId:string};
    const restored = await new FileFeedbackRepository(dir).get(feedbackId);
    assert.equal(restored!.message,'Prosím upravit přehled.');
    assert.equal(restored!.userId,'user-1'); assert.equal(restored!.projectId,'project-1');
    assert.equal(restored!.surface,'MANAGER'); assert.equal(restored!.status,'NEW');
    assert.equal(restored!.notificationStatus,'NOT_CONFIGURED');
    assert.equal(restored!.currentUrl,'https://conis.cz/studio/workspace/');
    assert.ok(restored!.createdAt);
    assert.equal((await fetch(url,{headers:{cookie:'__Host-conis_partner_session=manager'}})).status,403);
    const read = await fetch(`${url}/${feedbackId}`,{headers:{cookie:'__Host-conis_partner_session=admin'}});
    assert.deepEqual(await read.json(),restored);
    fail=true;
    assert.equal((await send({message:'Fail'})).status,503);
    assert.equal((await files.list()).length,1);
    fail=false;
    await Promise.all([send({message:'B'}),send({message:'C'})]);
    assert.equal((await new FileFeedbackRepository(dir).list()).length,3);
    // Execute the production UI request controller and client against the real HTTP handler.
    const {submitManagerFeedback} = await import('../../platform-access/src/api/managerFeedback');
    const {createFeedbackSubmission} = await import('../../platform-shell/src/feedbackSubmission');
    const originalFetch = globalThis.fetch;
    const states: string[] = [];
    globalThis.fetch = (_request, init) => originalFetch(url, {...init,
      headers: {...init?.headers, cookie: '__Host-conis_partner_session=manager'}});
    try {
      const submit = createFeedbackSubmission(submitManagerFeedback, state => states.push(state.status));
      assert.equal(await submit('Celá cesta z Manageru'), true);
      assert.deepEqual(states, ['pending', 'success']);
      const stored = await new FileFeedbackRepository(dir).list();
      assert.ok(stored.some(entry => entry.message === 'Celá cesta z Manageru' && entry.userId === 'user-1'));
      fail = true;
      assert.equal(await submit('Neuložená zpráva'), false);
      assert.deepEqual(states.slice(-2), ['pending', 'error']);
      assert.equal((await files.list()).length, 4);
    } finally {globalThis.fetch = originalFetch;}

  } finally { await new Promise<void>(resolve => server.close(() => resolve())); await rm(dir,{recursive:true,force:true}); }
});
