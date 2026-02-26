# Firebase Backend Hardening

This directory contains launch hardening assets for Blisse backend operations.

## Included

- `firestore.rules`: deny-by-default rules with scoped user access and read-only app config.
- `firestore.indexes.json`: required indexes for reactivation candidate queries.
- `functions/index.js`: server-side validation, idempotency, abuse controls, scheduled jobs.
- `daily_jokes.seed.json`: seed bank for `app_config/daily_jokes`.
- `feature_flags.seed.json`: seed values for `feature_flags/mobile`.

## Deploy

1. Install Firebase CLI and authenticate.
2. In `firebase/functions` run:
   - `npm install`
3. From repo root run:
   - `firebase deploy --only firestore:rules,firestore:indexes`
   - `firebase deploy --only functions`

## Function Summary

- `ingestAnonymousEvent` (`onCall`):
  - Validates incoming event payload.
  - Enforces idempotency using `idempotencyKey`.
  - Applies per-hour rate limiting per hashed user key.
  - Writes aggregated counters only (no personalized profile storage).

- `refreshDailyJokeOfTheDay` (`onSchedule` daily UTC):
  - Resolves current joke from `app_config/daily_jokes`.
  - Writes daily teaser/punchline to `app_config/daily_joke_today`.

- `queueReactivationCandidates` (`onSchedule` every 6 hours):
  - Adds inactive-but-recent users with push opt-in into `reactivation_queue`.
  - Uses only technical metadata needed for notification workflows.

- `logNotificationFailure` (`onCall`):
  - Stores sanitized failure diagnostics in `notification_failures`.

## Privacy Guardrails

- User identifiers are hashed server-side before storage in backend logs.
- Firestore rules deny all unknown client reads/writes.
- App config remains read-only to clients.
