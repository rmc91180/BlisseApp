# Blisse Trilingual QA Checklist (EN/ES/PT)

## Scope
- Goal: verify all primary user-facing flows render correctly in English, Spanish, and Portuguese.
- Build target: latest TestFlight build from `main`.
- Pass criteria: no English bleed-through in tested surfaces (except proper nouns/brand names), no truncation breaking usability, no blocked actions.

## Test Matrix
- Run each section in all three languages:
1. `English` (`en`)
2. `Spanish` (`es`)
3. `Portuguese` (`pt`)

## Setup
1. Install latest TestFlight build.
2. Open app, sign in.
3. Go to `Profile -> Settings -> Language`.
4. Switch language and force-close/reopen app once after each switch.

## Core Flows To Validate
1. `Home`
- Greeting, level card, weekly goals, feature tiles.
- Daily tease card labels and reveal CTA.
- Seasonal entry card labels.

2. `Explore`
- Content-type tabs.
- Search placeholder.
- Sort chips (`All/New/Tried`).
- Category chips.
- Card labels for all content types.

3. `Detail Screens`
- Position, Foreplay, Oral, Massage, Roleplay detail pages.
- Section headers (`What is it`, `How To`, `Tips`, etc.).
- Action buttons (`Mark Tried`, `Favorite`, `Add/View Notes`, share).
- Difficulty/duration/intensity/giver/category labels.

4. `Favorites`
- Favorites/recent toggles.
- Empty states and counters.

5. `Profile + Settings`
- Menu labels.
- Security/settings labels.
- Any alerts/toasts.

6. `Seasonal Modal`
- Section titles.
- Recommended content blocks.
- Recommended games block.
- Empty-state lines.

## UX Quality Checks
1. No clipped text in chips/buttons/cards.
2. No overlapping text/icons.
3. No unreadable contrast caused by longer ES/PT strings.
4. Search works with translated terms (category/mood labels).
5. Navigation and actions still work in all languages.

## Evidence Required
- 9 screenshots minimum:
1. Home (ES)
2. Home (PT)
3. Explore tabs/chips (ES)
4. Explore tabs/chips (PT)
5. One detail screen (ES)
6. One detail screen (PT)
7. Seasonal modal (ES)
8. Seasonal modal (PT)
9. Settings language panel

## Issue Logging Format
- Use this template per issue:
1. `Language`: en/es/pt
2. `Screen`: exact screen name
3. `String`: current visible text
4. `Expected`: translated or corrected text
5. `Type`: untranslated / truncation / layout / wrong meaning
6. `Severity`: blocker / major / minor
7. `Screenshot`: file name

## Release Gate
- `PASS` when all `blocker/major` language issues are fixed and re-tested in EN/ES/PT.
