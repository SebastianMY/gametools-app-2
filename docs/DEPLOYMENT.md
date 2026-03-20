# Deployment Guide

This document describes how to build, sign, and submit Game Companion to the Apple App Store and Google Play Store using Expo EAS Build.

---

## Prerequisites

| Tool | Purpose |
|---|---|
| `eas-cli` (latest) | EAS Build CLI — `npm install -g eas-cli` |
| Expo account | Required for EAS — [expo.dev](https://expo.dev) |
| Apple Developer account | Required for iOS builds and App Store submission |
| Google Play Developer account | Required for Android AAB submission |

---

## Expo EAS Build Configuration

### 1. Log in to your Expo account

```bash
eas login
```

### 2. Configure EAS (first-time only)

```bash
eas build:configure
```

This creates `eas.json` in the project root. A minimal `eas.json` for this project looks like:

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### 3. Update version numbers before each release

In **`app.json`**:
```json
{
  "expo": {
    "version": "1.0.0",
    "ios": { "buildNumber": "1" },
    "android": { "versionCode": 1 }
  }
}
```

In **`package.json`**:
```json
{ "version": "1.0.0" }
```

Increment `buildNumber` (iOS) and `versionCode` (Android) on every build submitted to the stores, even if the user-facing version number does not change.

---

## Building for iOS

### Development / TestFlight build

```bash
eas build --platform ios --profile preview
```

Uploads to Expo's build servers. Expo manages provisioning profiles and signing certificates automatically when you grant it access to your Apple Developer account.

### Production (App Store) build

```bash
eas build --platform ios --profile production
```

When the build completes, download the `.ipa` from the Expo dashboard or submit directly:

```bash
eas submit --platform ios
```

EAS Submit handles uploading to App Store Connect. You can also upload manually via Transporter.

### App Store submission steps

1. Log in to [App Store Connect](https://appstoreconnect.apple.com).
2. Create a new app with:
   - Bundle ID: `com.gamecompanion.app`
   - Primary language: English
3. Upload the `.ipa` via `eas submit` or Transporter.
4. Fill in metadata: app name, description, keywords, screenshots (iPhone 6.5", 5.5", iPad 12.9").
5. Set content rating (4+) and pricing (free).
6. Attach privacy policy URL (see [Privacy Policy Requirements](#privacy-policy-and-terms-of-service)).
7. Submit for App Review.

---

## Building for Android

### Development / internal test build

```bash
eas build --platform android --profile preview
```

Produces an `.apk` for sideloading or sharing via internal track.

### Production (Google Play) build

```bash
eas build --platform android --profile production
```

Produces an `.aab` (Android App Bundle) required by Google Play.

```bash
eas submit --platform android
```

EAS Submit uploads the AAB to Google Play using a service account JSON key. Follow the [EAS Submit docs](https://docs.expo.dev/submit/android/) to configure the service account.

### Google Play submission steps

1. Log in to [Google Play Console](https://play.google.com/console).
2. Create a new app with:
   - Package name: `com.gamecompanion.app`
   - Default language: English
3. Complete the store listing: title, short description, full description, screenshots (phone and tablet), feature graphic.
4. Set content rating (Everyone).
5. Upload the `.aab` to the Production track (or start with Internal Testing / Closed Testing).
6. Set up data safety: the app does not collect or share any user data.
7. Attach privacy policy URL.
8. Submit for review.

---

## Version Management

Use [Semantic Versioning](https://semver.org): `MAJOR.MINOR.PATCH`.

| Scenario | Example |
|---|---|
| Bug fix, no new feature | `1.0.0` → `1.0.1` |
| New feature, backward-compatible | `1.0.0` → `1.1.0` |
| Breaking change (rare for mobile) | `1.0.0` → `2.0.0` |

**Always** increment both `ios.buildNumber` and `android.versionCode` on every store submission, regardless of whether the public version changed.

---

## Privacy Policy and Terms of Service

Game Companion does **not** collect, transmit, or share any user data. All data (game scores, player names) is stored locally on the device and never leaves it.

You still need a privacy policy URL for both stores. Host a simple page (e.g., on GitHub Pages) stating:

> This app stores game data locally on your device only. No personal data is collected, transmitted, or shared with any third party.

---

## Release Checklist

See **[docs/RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)** for the full pre-release checklist that must be completed before every store submission.

---

## Continuous Integration (Future)

EAS Build integrates with GitHub Actions via the `expo/expo-github-action` action. A basic workflow:

```yaml
# .github/workflows/build.yml
name: EAS Build
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 18 }
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform all --non-interactive
```

This is not configured in v1 but is the recommended path for automating production builds.
