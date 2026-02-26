# Backup & Restore Runbook

## Backup Strategy

- Enable Firestore export to Cloud Storage daily (off-peak UTC).
- Keep rolling 30-day backups.
- Keep monthly snapshots for 12 months.

## Restore Drill (Monthly)

1. Select a backup snapshot from the previous week.
2. Restore into a staging Firebase project.
3. Validate:
   - `app_config/daily_jokes`
   - Firestore indexes deploy cleanly
   - Function health checks pass
4. Record drill result in release log.

## Incident Restore Procedure

1. Freeze writes (maintenance mode / deploy lock).
2. Identify recovery point objective (RPO).
3. Restore from nearest valid export.
4. Re-deploy:
   - Firestore rules
   - Firestore indexes
   - Cloud Functions
5. Run smoke tests on staging, then production.

## Success Criteria

- Recovery time objective (RTO) under 60 minutes.
- No unauthorized data exposure during restore.
