# Blisse Launch Readiness Checklist
Last updated: February 15, 2026

## 1) Release-Blocking Gates (Strict)
- [x] `GATE-01` Repo builds cleanly
  - Evidence: `npm run lint` passed with 0 errors/warnings.
  - Evidence: `npx tsc --noEmit` passed.
- [x] `GATE-02` Dependency vulnerability gate
  - Evidence: `npm audit --omit=dev --package-lock-only --json` reports `0` vulnerabilities.
- [x] `GATE-03` Expo config schema validity
  - Evidence: invalid `app.json` key `privacy` removed.
  - Evidence: `npx expo-doctor` no longer fails schema check.
- [x] `GATE-04` Firebase auth sync loop stability
  - Evidence: auth initialization retry loop + `onAuthStateChanged` subscription present.
  - Evidence: periodic auth refresh loop present (`AUTH_SYNC_LOOP_MS`).
- [x] `GATE-05` PostHog anonymized analytics only
  - Evidence: `personProfiles: 'never'`.
  - Evidence: `setDefaultPersonProperties: false`.
  - Evidence: `disableGeoip: true`.
  - Evidence: session replay and lifecycle capture disabled.
  - Evidence: analytics properties are sanitized + allowlisted before capture.
- [x] `GATE-06` Formspree direct-contact-only payload
  - Evidence: payload keys are allowlisted to `type/category/ideaType/message/submittedAt`.
  - Evidence: message is required and length-limited before submission.
- [x] `GATE-07` No app-side personalized analytics payloads
  - Evidence: analytics capture path sends only allowlisted metadata (`contentType/category/mood/feature/level`) plus anonymous base flags.

## 2) Blockers Cleared One by One
1. `BLOCKER-A` ESLint warnings in `App.tsx`
   - Status: cleared.
   - Fixes: hook dependencies, unused symbols/params, strict lint cleanup.
2. `BLOCKER-B` npm audit high vulnerability (`@isaacs/brace-expansion@5.0.0`)
   - Status: cleared.
   - Fixes: override to `5.0.1` + lockfile updated.
3. `BLOCKER-C` Expo schema failure (`app.json` had deprecated `privacy`)
   - Status: cleared.
   - Fix: removed invalid key.
4. `BLOCKER-D` PostHog privacy hardening not strict enough
   - Status: cleared.
   - Fixes: typed options + anonymous-only safeguards.
5. `BLOCKER-E` Formspree payload could include unintended fields
   - Status: cleared.
   - Fixes: payload sanitizer + required message check.
6. `BLOCKER-F` Trilingual parity (app/site/legal) incomplete
   - Status: cleared in codebase.
   - Fixes:
     - EN/ES/PT localization coverage wired for app UI, content, and legal modals.
     - Site language selector added on landing + legal pages with persistent selection.
     - Terms/Privacy localized and aligned to Israel governing law + Tel Aviv courts.

## 3) Remaining Manual Go/No-Go Checks (Outside Local Code)
- [ ] `MANUAL-01` Verify Firebase Console rules/providers for production.
- [ ] `MANUAL-02` Verify PostHog project settings align with anonymous-only policy.
- [ ] `MANUAL-03` Verify Formspree form routes to the target Gmail inbox in production.
- [ ] `MANUAL-04` Run iOS TestFlight and Android internal test on physical devices.
- [ ] `MANUAL-06` Complete Android EN/ES/PT localization QA matrix (iOS already validated).
- [ ] `MANUAL-05` Final App Store / Play Store listing compliance review.

## 4) Current Launch Verdict
- Codebase blockers found in-repo are cleared.
- External platform checks are still required before final store submission.
