# Android Release Setup

Last updated: 2026-03-23

This document defines the expected local setup for Android Play submission from this repo.

## Current repo configuration

`eas.json` now includes Android submit configuration under `submit.production.android`:

- `serviceAccountKeyPath`: `./credentials/google-play-service-account.json`
- `track`: `internal`
- `releaseStatus`: `draft`

This means:
- the first safe submission target is **Internal testing**
- the Play release will be created as a **draft**
- nothing is pushed to production by default

## Required local credential

Place the Google Play service account JSON key at:

`credentials/google-play-service-account.json`

This file is gitignored and must **not** be committed.

## How to create the key

1. Open Google Play Console
2. Go to:
   - `Setup`
   - `API access`
3. Link a Google Cloud project if not already linked
4. Create or select a service account
5. Grant the service account the required Play Console permissions
6. In Google Cloud Console, create a JSON key for that service account
7. Save the file locally as:
   - `credentials/google-play-service-account.json`

## Recommended minimum Play permissions

For initial Android submission automation, grant only what is needed:

- View app information and download bulk reports
- Manage testing tracks and releases
- View financial data is **not** required
- Admin-level permissions are **not** recommended unless necessary

Use the lowest permission set that still allows upload to the internal track.

## Expected commands

### 1. Build Android store artifact

```bash
eas build --platform android --profile production
```

### 2. Submit to Google Play internal track

```bash
eas submit --platform android --profile production
```

Because the configured track is `internal`, this will target internal testing unless overridden.

## Before first Android submission

Confirm all of the following:

1. `google-services.json` is present locally
2. `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` exists in EAS production environment
3. Android subscription products exist in Play Console
4. RevenueCat Android app/products/offering are configured
5. Account deletion page is live:
   - `https://www.blisse.online/delete-account`
6. Play Data Safety form answers are ready:
   - see `docs/PLAY_DATA_SAFETY_ANSWERS.md`

## Notes

- `app.json` versioning is local-source managed through EAS auto-increment
- Android `versionCode` must continue increasing for each store build
- If you later want closed testing or production instead of internal, update:
  - `submit.production.android.track`

