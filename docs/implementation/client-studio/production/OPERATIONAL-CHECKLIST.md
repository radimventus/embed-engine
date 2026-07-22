# Operational Checklist — Client Studio

Use before every pilot day and after every deploy.

## Deploy day

- [ ] `pnpm install --frozen-lockfile`
- [ ] typecheck green
- [ ] unit tests green
- [ ] production build green
- [ ] preview smoke on `4174`
- [ ] `dist/` has no `*.map`
- [ ] media assets present in published host
- [ ] HTTPS live URL responds
- [ ] SPA deep-link / refresh returns app shell
- [ ] version dataset present on `<html>`

## Configuration

- [ ] Legacy runtime env unset
- [ ] No legacy query on pilot URL
- [ ] mailto recipient correct
- [ ] AI Advisor policy understood (visible + placeholder)

## Journey smoke (5 minutes)

- [ ] Bootstrap → journey (no empty shell)
- [ ] Hero media or fallback
- [ ] Room navigation updates media
- [ ] Priority change updates Terminal presentation
- [ ] Conversion consent → mailto or graceful error
- [ ] ErrorBoundary not visible

## Observability

- [ ] Console clean of Runtime dumps
- [ ] Analytics does not block UI (memory sink OK)
- [ ] Support knows how to read version from DOM

## Sign-off

| Role | Name | Date |
| --- | --- | --- |
| Engineer | | |
| Pilot operator | | |
