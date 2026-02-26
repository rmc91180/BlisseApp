# iOS Beta Runbook (Post-Hardening)

## Build and Upload

1. Ensure `app.json` has target `ios.buildNumber` (increment for every upload).
2. Build:
   - `eas build --platform ios --profile production`
3. Submit:
   - `eas submit --platform ios --profile production`
4. Confirm build appears in App Store Connect TestFlight.

## Pre-TestFlight Config Checks

1. Firebase:
   - Firestore rules/indexes deployed.
   - `app_config/daily_jokes` exists.
   - `feature_flags/mobile` exists (or defaults are acceptable).
2. PostHog:
   - Anonymous capture only (`personProfiles: never`, no identify calls).
3. Formspree:
   - Endpoint active and email delivery verified.

## Test Matrix (Must Pass)

1. Auth and onboarding:
   - Email sign up/sign in.
   - Apple sign in.
   - Legal acceptance flow.
2. Core navigation:
   - Home / Explore / Favorites / Profile.
   - Detail pages for position/foreplay/oral/massage/roleplay.
3. Input UX:
   - Notes modal typing while keyboard is open.
   - Contact modal typing + send.
   - Ideas modal typing + send.
4. Localization:
   - EN/ES/PT switch and persistence.
   - No clipped text on key screens.
5. Engagement:
   - Daily tease visible and punchline reveal works.
   - Weekly recap card visible.
   - Seasonal modal includes games + all content sections.
6. Reliability:
   - Put device offline, submit contact/idea, verify queued behavior.
   - Reconnect and verify queued messages flush.

## Go / No-Go Gates

- `npm run check:release` passes.
- `npm run ui:smoke` passes.
- No P0/P1 defects in beta matrix.
- Crash-free smoke run in TestFlight devices.
- Privacy/legal links live and correct jurisdiction text.

## Optional Device Automation

If Maestro is installed:

- `npm run ui:e2e:ios`
- `npm run ui:e2e:android`
