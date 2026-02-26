# Data Retention Policy (Operational)

## Purpose

Define retention windows for backend operational data and enforce minimum-storage behavior.

## Retention Windows

- `idempotency_keys`: 48 hours
- `rate_limits`: 2 hours
- `notification_failures`: 30 days
- `analytics_daily`: 18 months (aggregated counters only)
- `reactivation_queue`: 14 days
- `users` technical fields (non-PII): until account deletion or 12 months inactivity

## Enforcement

Use a scheduled cleanup function (recommended weekly) that deletes expired documents by `expiresAt`.

## Data Minimization Rules

- Do not store names, emails, free-text messages, or relationship-sensitive details in Firestore backend collections.
- Free-text support/idea submissions remain in Formspree -> Gmail only.
- Analytics are anonymous and aggregate-only.
