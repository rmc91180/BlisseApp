# BlisseApp
Blisse - helping you grow your physical and emotional partnership 

## Daily Joke Bank (Firebase)
Blisse now supports a remote daily joke bank from Firestore with local fallback.

### Firestore document path
`app_config/daily_jokes`

### Required fields
- `setups`: string[]
- `punchlines`: string[]

### Optional field
- `version`: string (example: `2026-q1`)

### Example document
```json
{
  "version": "2026-q1",
  "setups": [
    "Why did the candle blush on date night?",
    "What did one silk sheet say to the other?"
  ],
  "punchlines": [
    "Because things were clearly getting lit.",
    "Stick with me and tonight gets smoother."
  ]
}
```

Seed file in repo: `firebase/daily_jokes.seed.json`

### Behavior
- The app reads this bank and caches it locally.
- If Firestore is unavailable or empty, Blisse uses built-in jokes.
- If the remote bank cannot generate a 366-day unique cycle, Blisse rejects it and uses built-in jokes.
- Daily teaser notifications show only the setup and require opening the app to reveal the punchline.
