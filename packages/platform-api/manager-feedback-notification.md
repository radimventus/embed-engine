# Manager feedback notification

The durable feedback file remains canonical. Only a successful repository write
triggers an SMTP notification; SMTP failure does not change the record or turn
its HTTP 201 receipt into an error. There is no automatic retry/outbox in this
minimal notification path.

## Configuration

Set `MANAGER_FEEDBACK_EMAIL_TO` to one internal mailbox. If unset or blank,
`NOTIFICATION_EMAIL` is used when configured. No recipient address is hardcoded;
`SMTP_FROM` and `SMTP_USER` are not treated as recipients.

The notification reuses Platform API's Nodemailer transport and configuration:
`SMTP_HOST`, `SMTP_PORT` (default 587), `SMTP_SECURE`, `SMTP_USER`,
`SMTP_PASSWORD` (or `SMTP_PASS`), and `SMTP_FROM` (defaults to SMTP_USER).
Password-reset delivery continues to use the same configuration and behavior.
The feedback transport uses 10-second connection/greeting timeouts and a
15-second socket timeout.

## Diagnosis

Structured logs use `event=manager_feedback_notification` and `feedbackId`:

- `SENT`: SMTP accepted the send; not proof of inbox delivery.
- `FAILED`: `SMTP_ERROR` or `INVALID_CONFIG` (unexpected adapter errors use
  `DELIVERY_ERROR`).
- `NOT_CONFIGURED`: `RECIPIENT_MISSING` or `SMTP_MISSING`.

Logs omit message text, recipient addresses, SMTP responses and credentials.
Look up the canonical record through the existing authenticated admin endpoint
`GET /public/auth/manager-feedback/:feedbackId`. Notification status is logged,
not mixed into the feedback workflow's `status=NEW`.

The email includes createdAt, feedbackId, userId, companyId, projectId, surface,
currentUrl and message. Category is included if present; the current UI does not
collect a category. Text is sent as plain text, not interpreted as HTML.
