# Maestro Smoke Flows

These flows cover launch-critical UI paths for beta builds.

## Prerequisites

- Install Maestro: https://maestro.mobile.dev/getting-started/installing-maestro
- iOS: connected simulator/device with TestFlight or dev build installed.
- Android: connected device/emulator with app installed.

## Run

- `maestro test .maestro/flows/ios-beta-smoke.yaml`
- `maestro test .maestro/flows/android-beta-smoke.yaml`

Set app id if needed:

- `APP_ID=com.blisse.app maestro test .maestro/flows/ios-beta-smoke.yaml`
