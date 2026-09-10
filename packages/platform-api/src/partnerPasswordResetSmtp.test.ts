import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createPartnerPasswordResetMail,
  readPartnerPasswordResetSmtpConfig,
  SmtpPartnerPasswordResetDelivery,
  type PartnerPasswordResetSmtpConfig,
} from './partnerPasswordResetSmtp';

const config: PartnerPasswordResetSmtpConfig = {
  host: 'smtp.conis.test',
  port: 587,
  secure: false,
  user: 'mailer@conis.test',
  password: 'secret-for-test',
  from: 'CONIS <mailer@conis.test>',
  resetUrl: 'https://conis.cz/studio/',
};

test('reads the shared SMTP environment contract without exposing partial configuration', () => {
  assert.equal(
    readPartnerPasswordResetSmtpConfig({
      SMTP_HOST: 'smtp.conis.test',
      SMTP_USER: 'mailer@conis.test',
    }),
    null,
  );

  assert.deepEqual(
    readPartnerPasswordResetSmtpConfig({
      SMTP_HOST: 'smtp.conis.test',
      SMTP_PORT: '465',
      SMTP_SECURE: 'true',
      SMTP_USER: 'mailer@conis.test',
      SMTP_PASS: 'mail-password',
      SMTP_FROM: 'CONIS <mailer@conis.test>',
      PARTNER_PASSWORD_RESET_URL:
        'https://conis.cz/studio/',
    }),
    {
      host: 'smtp.conis.test',
      port: 465,
      secure: true,
      user: 'mailer@conis.test',
      password: 'mail-password',
      from: 'CONIS <mailer@conis.test>',
      resetUrl: 'https://conis.cz/studio/',
    },
  );
});

test('rejects unsafe production reset URLs', () => {
  assert.throws(
    () =>
      readPartnerPasswordResetSmtpConfig({
        SMTP_HOST: 'smtp.conis.test',
        SMTP_USER: 'mailer@conis.test',
        SMTP_PASSWORD: 'mail-password',
        PARTNER_PASSWORD_RESET_URL:
          'http://attacker.example/reset',
      }),
    /must use HTTPS/,
  );
});

test('mail contains one encoded single-use link and no password', () => {
  const mail = createPartnerPasswordResetMail(config, {
    email: 'partner@conis.test',
    token: 'token with unsafe/+characters',
    expiresAt: '2026-09-10T14:00:00.000Z',
  });

  assert.equal(mail.to, 'partner@conis.test');
  assert.equal(mail.subject, 'CONIS – nastavení nového hesla');

  const text = String(mail.text);
  const url = new URL(
    text.match(/https:\/\/\S+/)?.[0] ?? '',
  );

  assert.equal(
    url.origin + url.pathname,
    'https://conis.cz/studio/',
  );
  assert.equal(
    url.searchParams.get('resetToken'),
    'token with unsafe/+characters',
  );
  assert.equal(text.includes('secret-for-test'), false);
});

test('SMTP delivery sends the canonical reset message', async () => {
  const sent: unknown[] = [];
  const delivery = new SmtpPartnerPasswordResetDelivery(
    config,
    {
      async sendMail(input) {
        sent.push(input);
        return {};
      },
    },
  );

  await delivery.sendPasswordReset({
    email: 'partner@conis.test',
    token: 'opaque-token-109',
    expiresAt: '2026-09-10T14:00:00.000Z',
  });

  assert.equal(sent.length, 1);
  assert.equal(
    (sent[0] as { to?: string }).to,
    'partner@conis.test',
  );
  assert.match(
    String((sent[0] as { text?: string }).text),
    /resetToken=opaque-token-109/,
  );
});
