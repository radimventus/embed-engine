import assert from 'node:assert/strict';
import test from 'node:test';
import {renderToStaticMarkup} from 'react-dom/server';
import {PlatformHeader} from './PlatformHeader';
import {createFeedbackSubmission, type FeedbackSubmissionState} from './feedbackSubmission';

test('Manager actions retain feedback/logout and remove demo or unused items only in Manager', () => {
  const manager = renderToStaticMarkup(<PlatformHeader activeStudioId="manager" accountRole="manager" onLogout={() => undefined} />);
  assert.match(manager, /Zpětná vazba/);
  assert.match(manager, /Uživatelské menu/);
  assert.doesNotMatch(manager, /Oznámení|oznámění|oznámení|Profil|Nastavení|Vstupní stránka/);
  for (const role of ['conis-admin','project-admin','builder','salesman']) for (const surface of ['client','builder','sales','office','manager'] as const) {
    const other = renderToStaticMarkup(<PlatformHeader activeStudioId={surface} accountRole={role} onLogout={() => undefined} />);
    assert.match(other, /Zpětná vazba/);
    assert.match(other, /Oznámení/);
    assert.match(other, /Uživatelské menu/);
  }
});

test('submission waits for persistence, rejects double submit and permits retry after failure', async () => {
  let calls = 0;
  let resolve!: () => void;
  let reject!: (reason: Error) => void;
  const states: FeedbackSubmissionState[] = [];
  const submit = createFeedbackSubmission(() => {calls++; return new Promise<{feedbackId: string}>((yes,no) => {resolve=() => yes({feedbackId:'record'}); reject=no;});}, s => states.push(s));
  const first = submit('První zpráva');
  assert.equal(await submit('Druhý klik'), false);
  assert.equal(calls, 1);
  assert.deepEqual(states.map(s => s.status), ['pending']);
  reject(new Error('Storage unavailable'));
  assert.equal(await first, false);
  assert.equal(states.at(-1)!.status, 'error');
  assert.ok(!states.some(s => s.status === 'success'));
  const retry = submit('První zpráva');
  resolve();
  assert.equal(await retry, true);
  assert.equal(states.at(-1)!.status, 'success');
  assert.equal(calls, 2);
});

test('missing persistence receipt never becomes a successful UI submission', async () => {
  const states: FeedbackSubmissionState[] = [];
  const submit = createFeedbackSubmission(async () => undefined, state => states.push(state));
  assert.equal(await submit('Zpráva'), false);
  assert.equal(states.at(-1)!.status, 'error');
});
