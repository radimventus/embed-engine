import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  shouldPrioritizePasswordResetRoute,
  urlWithoutPasswordResetParam,
} from './inviteRouting';

const auth = readFileSync(
  new URL('./AuthShell.tsx', import.meta.url),
  'utf8',
);
const root = readFileSync(
  new URL('./PlatformAccessRoot.tsx', import.meta.url),
  'utf8',
);
const client = readFileSync(
  new URL('../api/platformAccessClient.ts', import.meta.url),
  'utf8',
);

test('password reset URL has priority over a restored session', () => {
  assert.equal(
    shouldPrioritizePasswordResetRoute({
      resetToken: 'token-109',
      hasRestoredSession: true,
    }),
    true,
  );
  assert.equal(
    shouldPrioritizePasswordResetRoute({
      resetToken: '',
      hasRestoredSession: true,
    }),
    false,
  );

  assert.match(root, /shouldPrioritizePasswordResetRoute/);
  assert.match(root, /initialResetToken=\{resetToken\}/);
});

test('completed or cancelled recovery removes the bearer token', () => {
  assert.equal(
    urlWithoutPasswordResetParam(
      'https://conis.cz/studio/?resetToken=secret&studio=manager#top',
    ),
    '/studio/?studio=manager#top',
  );

  assert.match(root, /urlWithoutPasswordResetParam/);
  assert.match(auth, /onPasswordResetFinished\?\.\(\)/);
});

test('AuthShell uses only the authoritative server reset API', () => {
  assert.doesNotMatch(auth, /startPasswordReset/);
  assert.doesNotMatch(auth, /finishPasswordReset/);
  assert.doesNotMatch(auth, /MVP e-mail/);
  assert.doesNotMatch(auth, /Reset token/);

  assert.match(auth, /requestPasswordReset\(email\)/);
  assert.match(auth, /inspectPasswordReset/);
  assert.match(auth, /completePasswordReset/);
  assert.match(auth, /Požádat o nový odkaz/);
});

test('client request never returns or displays a reset token', () => {
  assert.match(
    client,
    /\/public\/auth\/password-reset\/request/,
  );
  assert.match(client, /inspectPasswordReset/);
  assert.match(client, /completePasswordReset/);
  assert.doesNotMatch(auth, /setResetToken/);
});
