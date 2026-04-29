# Play Data Safety Answers

Last updated: 2026-03-23

This document maps Blisse's current Android codebase to Google Play's Data Safety form.

Scope reviewed:
- `App.tsx`
- `src/services/analytics.ts`
- `src/services/auth.tsx`
- `src/services/firebase.ts`
- `src/services/backendEvents.ts`
- `src/services/subscription.tsx`
- `src/store/useStore.ts`
- `app.json`

Relevant Google sources:
- Data Safety section overview: https://support.google.com/googleplay/android-developer/answer/10787469
- User Data policy / account deletion: https://support.google.com/googleplay/android-developer/answer/10144311
- Google Play Help summary of user-facing data types: https://support.google.com/googleplay/answer/11416267

## High-level answers

### Does the app collect or share any of the required user data types?
- **Yes**

### Is all user data encrypted in transit?
- **Yes**

Reason:
- Firebase Authentication / Firestore / Cloud Functions use HTTPS/TLS
- RevenueCat uses HTTPS/TLS
- PostHog uses HTTPS/TLS
- Formspree submissions use HTTPS/TLS

### Do you provide a way for users to request that their data is deleted?
- **Yes**

Current implementation:
- In-app account deletion exists in `App.tsx`
- Public deletion URL should be: `https://www.blisse.online/delete-account`

## Important declaration principle

For Google Play Data Safety:
- **Collected** means data leaves the device and is processed by the app or a service provider.
- Transfers to processors/service providers acting on our behalf are still part of **collection**.
- They are **not necessarily "shared"** for Data Safety purposes if they are service providers acting on our behalf.

Conservative recommendation for Blisse:
- Mark the relevant data types as **Collected**
- Mark them as **Not shared**

This is based on current implementation:
- Firebase
- RevenueCat
- PostHog
- Formspree

These are functioning as infrastructure / service providers, not ad-tech sharing partners.

## Exact data-type answers

Use the following table when completing Play Console.

| Data type | Collected | Shared | Required or optional | Purpose | Linked to user | Notes |
|---|---|---:|---|---|---|---|
| Email address | Yes | No | Required for email/password auth | App functionality, Account management | Yes | Email/password sign-in and password reset |
| User IDs | Yes | No | Required | App functionality, Account management | Yes | Firebase user ID and RevenueCat app user ID |
| Device or other identifiers | Yes | No | Required | Analytics, App functionality | Yes | Conservative answer due PostHog / RevenueCat / install-level identifiers |
| Purchase history | Yes | No | Required for subscribed access | App functionality | Yes | RevenueCat and store purchase/entitlement state |
| App interactions / Product interaction | Yes | No | Required | Analytics, Personalization | No | Anonymous/sanitized interaction events |
| Other user-generated content | Yes | No | Optional | App functionality | Potentially Yes | Only when user explicitly submits a support/idea message via Formspree |

## Detailed notes by category

### 1. Email address
- **Collected:** Yes
- **Shared:** No
- **Purpose:** App functionality, Account management
- **Required or optional:** Required for email/password auth
- **Handled as linked to the user:** Yes

Why:
- `src/services/auth.tsx` supports `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, and `sendPasswordResetEmail`
- Email is also displayed in profile and tied to the authenticated account

### 2. User IDs
- **Collected:** Yes
- **Shared:** No
- **Purpose:** App functionality, Account management
- **Required or optional:** Required
- **Handled as linked to the user:** Yes

Why:
- Firebase auth user IDs are tied to the account
- RevenueCat uses `appUserID: user.uid`

### 3. Device or other identifiers
- **Collected:** Yes
- **Shared:** No
- **Purpose:** Analytics, App functionality
- **Required or optional:** Required
- **Handled as linked to the user:** Yes

Why:
- PostHog and RevenueCat can rely on installation/device-level identifiers
- Conservative declaration is safer than claiming unlinked device-level telemetry

### 4. Purchase history
- **Collected:** Yes
- **Shared:** No
- **Purpose:** App functionality
- **Required or optional:** Required for premium access
- **Handled as linked to the user:** Yes

Why:
- RevenueCat and the app use purchase/subscription state to unlock premium access

### 5. App interactions / Product interaction
- **Collected:** Yes
- **Shared:** No
- **Purpose:** Analytics, Personalization
- **Required or optional:** Required
- **Handled as linked to the user:** No

Why:
- PostHog is configured for anonymous aggregate analytics
- `src/services/analytics.ts` only allows sanitized keys:
  - `contentType`
  - `category`
  - `mood`
  - `feature`
  - `level`
- `App.tsx` disables person profiles and geo-IP enrichment

### 6. Other user-generated content
- **Collected:** Yes
- **Shared:** No
- **Purpose:** App functionality
- **Required or optional:** Optional
- **Handled as linked to the user:** Yes

Why:
- Support/contact/idea forms send message text off-device to Formspree only when the user explicitly submits
- This is not analytics, but it is still collected user-generated content

Relevant code:
- `src/services/analytics.ts`
- `App.tsx` form submission handlers

## What to mark as NOT collected

Based on the current app code, mark the following as **not collected** unless implementation changes later:

- Name
- Phone number
- Address
- Precise location
- Approximate location
- Contacts
- Photos / videos
- Audio recordings
- Files and documents
- Calendar
- Health data
- Financial info beyond purchase history
- Messages, if the Play form distinguishes private in-app messaging
- Web browsing history
- Search history
- Crash logs
- Diagnostics / performance telemetry
- Advertising data

## Notes on support messages vs local notes

Blisse stores personal notes locally on device.
- Those local notes are **not collected off-device**
- Therefore they should **not** be declared as collected unless that implementation changes

Blisse also allows explicit support / idea submissions:
- those messages are transmitted to Formspree
- therefore this falls under **Other user-generated content**

## Recommended Console selections summary

### Global questions
- App collects data: **Yes**
- Data is encrypted in transit: **Yes**
- Users can request deletion of data: **Yes**

### Data types to declare
- Email address: **Collected / Not shared**
- User IDs: **Collected / Not shared**
- Device or other identifiers: **Collected / Not shared**
- Purchase history: **Collected / Not shared**
- App interactions / Product interaction: **Collected / Not shared**
- Other user-generated content: **Collected / Not shared**

### Purpose mapping
- Email address: **App functionality, Account management**
- User IDs: **App functionality, Account management**
- Device or other identifiers: **Analytics, App functionality**
- Purchase history: **App functionality**
- Product interaction: **Analytics, Personalization**
- Other user-generated content: **App functionality**

## Operational follow-ups before Play submission

1. Deploy the public account deletion page:
   - `https://www.blisse.online/delete-account`
2. Use that same URL in Play Console
3. Keep the privacy policy in sync with the account deletion page
4. Revisit this file if any of the following are added:
   - Crashlytics / Sentry
   - push token upload to backend
   - server-side notes sync
   - marketing email flows
   - ads or attribution SDKs

