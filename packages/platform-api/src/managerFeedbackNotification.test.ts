import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createPlatformApiServer} from './index';
import {FileFeedbackRepository, type ManagerFeedback} from './feedbackRepository';
import {createManagerFeedbackNotifier, type FeedbackNotificationEvent} from './managerFeedbackNotification';

const environment = {SMTP_HOST:'smtp.test', SMTP_USER:'mailer@conis.test', SMTP_PASSWORD:'private', SMTP_FROM:'CONIS <mailer@conis.test>', MANAGER_FEEDBACK_EMAIL_TO:'support@conis.test'};

test('HTTP persists before SMTP, includes context, and email failures do not undo feedback', async () => {
  const directory = await mkdtemp(join(tmpdir(),'conis-feedback-mail-'));
  const files = new FileFeedbackRepository(directory);
  const logs: FeedbackNotificationEvent[] = [];
  let storageFails=false, mailFails=false, calls=0;
  const notify = createManagerFeedbackNotifier(environment, {async sendMail(mail) {
    calls++;
    const text=String(mail.text);
    const id=text.match(/feedbackId: (.+)/)![1]!;
    const stored=await new FileFeedbackRepository(directory).get(id);
    assert.ok(stored, 'record must already be durably readable');
    assert.equal(mail.to, environment.MANAGER_FEEDBACK_EMAIL_TO);
    assert.equal(mail.from, environment.SMTP_FROM);
    for (const part of [stored.createdAt, id, 'user-1','project-1','company-1','surface: MANAGER','https://conis.cz/studio/manager/','Test zprávy']) assert.ok(text.includes(part),part);
    assert.ok(!text.includes(environment.SMTP_PASSWORD));
    if(mailFails) throw new Error('SMTP secret-containing error must not be logged');
    return {messageId:'provider-message-1'};
  }}, event=>logs.push(event));
  const repository={create:(input:Parameters<typeof files.create>[0])=>storageFails ? Promise.reject(new Error('disk')) : files.create(input), get:(id:string)=>files.get(id), list:()=>files.list(), updateNotification:(id:string,input:Parameters<typeof files.updateNotification>[1])=>files.updateNotification(id,input)};
  const sessions={resolve:async()=>({user:{id:'user-1',roles:['manager']},companyId:'company-1',projectId:'project-1'})};
  const server=createPlatformApiServer(undefined,undefined,undefined,undefined,undefined,sessions as never,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,repository,notify);
  try {
    await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
    const addr=server.address(); assert.ok(addr && typeof addr!=='string');
    const send=()=>fetch(`http://127.0.0.1:${addr.port}/public/auth/manager-feedback`,{method:'POST',headers:{cookie:'__Host-conis_partner_session=test','content-type':'application/json'},body:JSON.stringify({message:'Test zprávy',currentUrl:'https://conis.cz/studio/manager/'})});
    assert.equal((await send()).status,201);
    assert.equal(calls,1); assert.equal(logs[0]!.status,'SENT');
    assert.equal((await files.list())[0]!.notificationStatus,'SENT');
    assert.equal((await files.list())[0]!.notificationProviderId,'provider-message-1');
    mailFails=true;
    assert.equal((await send()).status,201);
    assert.equal(calls,2); assert.equal(logs[1]!.status,'FAILED');
    assert.equal(logs[1]!.reason,'SMTP_ERROR');
    const records=await new FileFeedbackRepository(directory).list();
    assert.equal(records.length,2); assert.equal(records[0]!.notificationStatus,'FAILED');
    assert.match(records[0]!.notificationError!,/secret-containing/);
    storageFails=true;
    assert.equal((await send()).status,503);
    assert.equal(calls,2); assert.equal(logs.length,2);
  } finally {await new Promise<void>(resolve=>server.close(()=>resolve())); await rm(directory,{recursive:true,force:true});}
});

test('recipient fallback and missing/invalid configuration are explicit and logged', async () => {
  const entry: ManagerFeedback={feedbackId:'id',createdAt:'2026-09-13T10:00:00Z',userId:null,companyId:null,projectId:null,surface:'MANAGER',currentUrl:null,message:'Text',status:'NEW'};
  const logs:FeedbackNotificationEvent[]=[];
  const sent:unknown[]=[];
  const transport={async sendMail(mail:unknown){sent.push(mail);}};
  await createManagerFeedbackNotifier({...environment,MANAGER_FEEDBACK_EMAIL_TO:'',NOTIFICATION_EMAIL:'admin@conis.test'},transport,e=>logs.push(e))(entry);
  assert.equal((sent[0] as {to:string}).to,'admin@conis.test');
  await createManagerFeedbackNotifier({},transport,e=>logs.push(e))(entry);
  assert.equal(logs.at(-1)!.reason,'RECIPIENT_MISSING');
  await createManagerFeedbackNotifier({MANAGER_FEEDBACK_EMAIL_TO:'support@conis.test'},transport,e=>logs.push(e))(entry);
  assert.equal(logs.at(-1)!.reason,'SMTP_MISSING');
  await createManagerFeedbackNotifier({...environment,MANAGER_FEEDBACK_EMAIL_TO:'invalid\r\nBcc: other@example.com'},transport,e=>logs.push(e))(entry);
  assert.equal(logs.at(-1)!.reason,'INVALID_CONFIG');
  assert.equal(sent.length,1);
});
