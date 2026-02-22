# Blisse Trilingual Localization Audit (EN / ES / PT)

Last reviewed: 2026-02-22

## 1) Current in-repo status

- App localization framework: **partially implemented** in `src/i18n/translations.ts`.
- Persisted language setting: **implemented** in `App.tsx` (`useStore.language` + `setLanguage`).
- Language selector dropdown in app settings: **implemented** in `App.tsx` (`SettingsModal`).
- Core shell UI (tabs + primary home/explore/favorites/profile/settings labels): **partially localized**.

## 2) Existing translated content found in repository

- No dedicated Spanish/Portuguese content bundles were found in repo for:
  - `positions`
  - `foreplay`
  - `oral play`
  - `massage`
  - `role play`
  - legal long-form modal text
  - onboarding/auth long-form copy

## 3) Translation volume still pending

### App code

- `App.tsx`: 7,779 lines.
- Estimated direct UI text nodes in `App.tsx`: 452.
- `Alert.alert(...)` calls in `App.tsx`: 21.
- `placeholder="..."` strings in `App.tsx`: 11.

### Intimacy content datasets

- Total content entries across `src/content/*.ts`: 270 entries.
- Translatable structured fields currently in English:
  - `name`: 270
  - `vibe/description/howTo/...` and similar narrative fields: 1,706 field instances

Breakdown by file size:
- `src/content/positions.ts`: 2,185 lines
- `src/content/foreplay.ts`: 637 lines
- `src/content/oralplay.ts`: 384 lines
- `src/content/massage.ts`: 286 lines
- `src/content/roleplay.ts`: 289 lines

## 4) What is done in this pass

- Added `src/i18n/translations.ts` with:
  - supported language model (`en`, `es`, `pt`)
  - UI translation function with interpolation (`translateUi`)
  - terminology translator for categories/moods/difficulty labels (`translateTerm`)
  - language metadata and content-type key resolver
- Added `language` and `setLanguage` to persisted app store.
- Added language dropdown to Settings.
- Localized key shell surfaces:
  - bottom tab labels
  - Explore screen primary controls
  - Favorites screen primary controls + empty states
  - Home screen high-traffic labels (daily tease, weekly goals, streaks, etc.)
  - Profile screen major labels/actions
  - Settings modal section and control labels

## 5) Remaining blockers to reach full trilingual app

### Blocker A: Full content localization (largest)

- Translate all 270 content records (EN -> ES/PT) for all rich fields:
  - `name`, `vibe`, `description`, `howTo`, `tips`, `pairsWellWith`, etc.
- Integrate translated content into runtime rendering (not only UI chrome).

### Blocker B: Remaining UI surfaces in `App.tsx`

- Onboarding flow text
- Auth screens and all related alerts/errors
- Detail screens (position/foreplay/oral/massage/roleplay) labels and helper copy
- Modals not yet localized:
  - Terms, Privacy, About
  - Contact/Ideas
  - Achievements/Insights/Challenge/Date Night/Truth-or-Dare/etc.
- Notification strings (including daily tease notification text)

### Blocker C: Legal copy parity EN/ES/PT

- Ensure Terms and Privacy long-form text are maintained in all 3 languages and aligned across:
  - app modals
  - `website/*.html`
  - `legal/*.html`

### Blocker D: QA and regression verification

- Device-level language switch testing:
  - iOS + Android
  - cold start and persisted preference
- Snapshot pass for truncation/overflow on small screens.
- Functional checks for filtering/search when localized labels differ from canonical internal tags.

## 6) Execution order (strict)

1. Finish i18n plumbing for all remaining UI strings in `App.tsx`.
2. Add ES/PT data bundles for all content records and wire rendering/fallback.
3. Localize legal modals + site legal pages with exact parity.
4. Run full manual QA matrix on iOS and Android.
5. Freeze strings and ship.

## 7) What I need from you to complete fast

- The Spanish and Portuguese source material you already have (CSV/JSON/Sheets/export).
- Preferred Portuguese locale policy:
  - `pt` (generic) or
  - `pt-BR` (Brazilian Portuguese).
- Whether we should keep English as fallback when a key/field is missing (recommended: yes).
