# Blisse Trilingual Localization Audit (EN / ES / PT)

Last reviewed: 2026-02-22

## Current Status

- `BLOCKER STATUS`: **CLOSED in codebase**
- App language support: **EN / ES / PT implemented**
- Website language support: **EN / ES / PT implemented**
- Legal text support (Terms + Privacy): **EN / ES / PT implemented**
- Legal jurisdiction alignment (app + site): **State of Israel, courts of Tel Aviv**

## What Is Implemented

1. App-wide localization plumbing
- `src/i18n/translations.ts` used for UI copy with language persistence.
- Settings language selection available for all users.
- Quick language switch chips added on key high-traffic screens.

2. Content localization coverage
- Runtime overlays wired via `src/i18n/localizedContent.ts`.
- Content bundles present:
  - `src/i18n/content/es.generated.json`
  - `src/i18n/content/pt.generated.json`
- Coverage parity confirmed with source datasets:
  - positions: 150
  - foreplay: 50
  - oral: 30
  - massage: 20
  - roleplay: 20

3. Legal and policy localization
- App legal modal content centralized in `src/i18n/legalContent.ts`.
- Website legal pages localized with selector + persistence:
  - `website/terms.html`
  - `website/privacy.html`
- Mirrored legal pages kept aligned:
  - `legal/terms.html`
  - `legal/privacy.html`

4. Website localization UX
- Persistent language dropdown on:
  - `website/index.html`
  - `website/terms.html`
  - `website/privacy.html`
- Language is remembered in local storage and propagated via `?lang=`.

## Final Sweep Checks (This Pass)

- UI key parity check: `en/es/pt` missing key count = `0`.
- App hardcoded JSX text scan: only brand text (`Blisse`) detected.
- Website translation object parity (`en/es/pt`): no missing keys.
- Legal page translation parity (`en/es/pt`): section counts and top-level keys aligned.
- `npm run lint`: pass.
- `npx tsc --noEmit`: pass.

## Manual QA Still Required Before Store Release

- Android physical-device matrix (EN/ES/PT) still pending.
- iOS matrix already completed by owner confirmation.
