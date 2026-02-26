# Backend Observability Baseline

## Dashboards (Recommended)

- Cloud Functions:
  - Invocation count
  - Error rate
  - P95/P99 latency
- Firestore:
  - Read/write volume
  - Rejected operations
- Push workflows:
  - Reactivation queue size
  - Notification failure rate

## Alerts

- Function error rate > 2% for 10 minutes
- Function p95 latency > 1500ms for 10 minutes
- `notification_failures` count spikes > 3x baseline
- `reactivation_queue` backlog older than 6 hours

## Logging Standards

- Use structured logs with:
  - function name
  - event type
  - status
  - sanitized reason code
- Never log raw user identifiers or free-text message bodies.
