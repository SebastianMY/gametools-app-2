# Release Checklist

Complete every item on this checklist before submitting a build to the Apple App Store or Google Play Store. Mark each item as you verify it.

---

## Code Quality

- [ ] **ESLint passes** — run `npm run lint` and resolve all errors and warnings
- [ ] **Prettier formatting passes** — run `npm run format:check`; format with `npm run format` if needed
- [ ] **TypeScript type check passes** — run `npm run type-check` with zero errors

---

## Testing

- [ ] **All Jest tests pass** — run `npm test`; zero failing tests
- [ ] **Test coverage ≥ 80%** — run `npx jest --coverage`; confirm `src/` coverage meets threshold
- [ ] **Manual testing on iOS Simulator** — verify all three features (Dice, Score, Lottery) function correctly
- [ ] **Manual testing on physical iOS device** — verify haptic feedback, touch responsiveness, and animations
- [ ] **Manual testing on Android emulator** — verify all three features function correctly
- [ ] **Manual testing on physical Android device** — verify haptic feedback, touch responsiveness, and animations
- [ ] **Tablet layout test** — verify portrait and landscape layouts on both iOS iPad and Android tablet simulators

---

## Accessibility

- [ ] **WCAG AA color contrast audit passed** — all text meets 4.5:1 (normal text) and 3:1 (large text) contrast ratios
- [ ] **Touch target sizes verified** — all interactive elements ≥ 48×48 dp
- [ ] **Screen reader test (VoiceOver / TalkBack)** — navigate all screens using screen reader; verify all elements have correct labels and roles
- [ ] **Dynamic Type / text scaling** — test at system font size settings: Default, Large, and Accessibility Large
- [ ] **Minimum font size** — functional text is ≥ 16 sp throughout

---

## Performance

- [ ] **Animations run at 60 FPS** — use the React Native performance overlay or Flipper to verify dice and lottery animations hit 60 FPS
- [ ] **App startup < 2 seconds** — from tap to interactive home screen on a mid-range device
- [ ] **Game data load < 500 ms** — last session restore completes within 500 ms (NFR-P3)
- [ ] **Memory footprint** — app stays below 100 MB during typical usage (Dice + Score + Lottery session)

---

## Data Integrity

- [ ] **Persistence smoke test** — create a game, add scores, force-close the app, reopen; verify scores are restored exactly
- [ ] **Multiple saved games** — create and switch between at least three games; verify no data bleed
- [ ] **Game deletion** — delete a game; verify it is removed from the list and cannot be restored
- [ ] **Deleted last-session game fallback** — delete the last active game; reopen app; verify fallback to Score Home with toast message
- [ ] **AsyncStorage backup** — back up local game data before submitting (manual export or device backup)

---

## Versioning

- [ ] **`version` in `app.json`** updated to the new version number (e.g., `1.0.1`)
- [ ] **`version` in `package.json`** matches `app.json`
- [ ] **`ios.buildNumber` in `app.json`** incremented (unique integer for every App Store submission)
- [ ] **`android.versionCode` in `app.json`** incremented (unique integer for every Play Store submission)
- [ ] **Git tag created** — tag the release commit: `git tag v1.0.1 && git push --tags`
- [ ] **CHANGELOG updated** (if maintained)

---

## Build

- [ ] **Expo EAS Build succeeds for iOS** — `eas build --platform ios --profile production`
- [ ] **Expo EAS Build succeeds for Android** — `eas build --platform android --profile production`
- [ ] **No build warnings** that indicate missing assets or deprecated APIs
- [ ] **Bundle size reviewed** — confirm the JS bundle size has not increased unexpectedly

---

## App Store Metadata (iOS)

- [ ] App name, subtitle, and description reviewed and accurate
- [ ] Keywords updated if new features ship
- [ ] Screenshots prepared for all required device sizes (iPhone 6.5", 5.5"; iPad 12.9")
- [ ] App preview video updated (if applicable)
- [ ] Content rating confirmed (4+)
- [ ] Privacy policy URL live and accessible
- [ ] No references to competing platforms (e.g., "Android") in metadata

---

## Google Play Metadata (Android)

- [ ] Title, short description, and full description reviewed and accurate
- [ ] Screenshots prepared for phone and tablet
- [ ] Feature graphic (1024×500 px) updated if branding changed
- [ ] Content rating questionnaire answered (Everyone)
- [ ] Data safety form completed — confirm no user data is collected or shared
- [ ] Privacy policy URL live and accessible
- [ ] Target API level meets current Google Play requirements

---

## Legal and Compliance

- [ ] **Privacy policy** is live, accurate, and linked in both stores
- [ ] **Terms of service** reviewed (if published)
- [ ] No third-party assets (fonts, icons, sounds) with incompatible licenses
- [ ] Open-source license attribution correct (MIT for this project)

---

## Post-Release

- [ ] Monitor crash reports for the first 48 hours after release
- [ ] Review user reviews and ratings on both stores
- [ ] Verify analytics events are firing correctly (if analytics added in future)
- [ ] Confirm the previous version is available as a rollback if needed (Play Store: do not immediately deactivate the previous release)
