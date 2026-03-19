# Answers to Open Questions: Game Companion Mobile App

## Q1: Score Increment Button Amounts

**Decision**: Use fixed increment buttons: **+1, +5, +10** for all games; no per-game customization in v1.

**Rationale**: This covers ~95% of board games (Scrabble, Cribbage, Darts, etc.). Fixed buttons reduce complexity, minimize UI surface area, and eliminate the need for a settings system in v1. Users accustomed to board games intuitively understand these increments. If a game needs unusual increments (e.g., +3, +25), users can tap multiple times.

**Trade-offs**: Games with non-standard scoring (e.g., some trick-taking games needing +2 or +15) require extra taps. Custom increments defer to v2 with a per-game settings screen.

---

## Q2: Game Naming

**Decision**: Game names are **optional**; if omitted, display an auto-generated label: **"Game from [Month Day, Year]"** (e.g., "Game from March 19, 2026").

**Rationale**: Reduces friction on game creation (users skip naming dialog if desired), while still providing context in the game list. Auto-generated labels are sufficient for most casual game sessions. Spec doesn't mandate custom names, so optional is reasonable. The auto-generated format is human-readable and immediately distinguishes games chronologically.

**Trade-offs**: Auto-generated names are less meaningful than user-chosen ones (e.g., "Friday Poker Night"). If users create many games on the same day, timestamps alone may be confusing. Solution: add time-of-day to label if needed (v1.1).

---

## Q3: Undo Functionality

**Decision**: **No undo** in v1; users manually correct scores by tapping the decrement button on a player's score.

**Rationale**: Undo requires maintaining a score history stack, adding state complexity and storage overhead. Most casual board game apps don't ship with undo; users accept the responsibility of careful taps. Manual correction is simple and sufficient for the typical use case (correcting an accidental tap). Keeps `GameStateContext` focused on current game state, not history.

**Trade-offs**: Users must live with mistakes; no "undo last 5 taps" convenience. Potential frustration if users make frequent errors. Mitigate by ensuring increment/decrement buttons are large (NFR-U2 touch target size) and clearly labeled.

---

## Q4: Lottery Player Limit

**Decision**: **Enforce a maximum of 8 simultaneous touches** (players). Display a visual constraint message if a 9th finger touches the screen.

**Rationale**: The spec explicitly states "typically 2–8 players"; 8 is a reasonable hard limit for typical board game groups. React Native Gesture Handler can track up to 10 fingers reliably; 8 is safe. Enforcing a constraint simplifies UI (no need to handle N circles for arbitrary N). Most real-world board games have 2–6 players; 8 covers edge cases without complexity.

**Trade-offs**: Large groups (9+ players) cannot use the Lottery feature; they must use the Score feature instead. Unlikely scenario for the target user base.

---

## Q5: Dice Non-Standard Faces

**Decision**: **d6 (six-sided dice) only** in v1. No d4, d8, d10, d12, or d20.

**Rationale**: d6 is the most common die in board games (Yahtzee, Catan, Farkle, etc.). Restricting to d6 simplifies animation logic (one animation template), display (numbers 1–6), and rolling algorithm. Extending to other die types is straightforward in v2 (add a die type selector, new animation variants). Spec doesn't mandate multi-sided dice, so v1 focus on 80/20 rule: d6 covers 80% of use cases.

**Trade-offs**: RPG dice rollers (D&D, Pathfinder) cannot use d20s; out of scope for this app. Users needing d20 must use a separate app or calculator. Acceptable trade-off given target is casual board games, not tabletop RPGs.

---

## Q6: Vibration Customization

**Decision**: **Single standard haptic pattern** on Lottery countdown completion (0.1s vibration, medium intensity); no settings menu for customization in v1.

**Rationale**: Spec requires haptic feedback (FR-L10) but doesn't mandate customization. Settings menu is out of scope for v1 (adds navigation, state management, and testing). Single standard vibration is sufficient for providing tactile feedback and a moment of celebration. Expo's `Vibration.vibrate(100)` is simple, reliable, and works on iOS and Android.

**Trade-offs**: Users cannot mute or customize vibration intensity. Mitigation: device-level vibration settings apply (users can silence phone). Customization defers to v2 if user feedback demands it.

---

## Q7: Last Session Restoration Edge Case

**Decision**: **Store the last active game ID only**. On app reopen, if that game ID is not found in the games list, **gracefully fall back to the Score Home screen** (list of all games) and show an informational toast: "Last game was deleted; here are your saved games."

**Rationale**: This prevents "ghost data" (attempting to restore a deleted game). The game ID is a foreign key; if the game doesn't exist, the reference is broken. Falling back to the game list is a safe, user-friendly recovery. The toast explains what happened without alarming the user. Keeps persistence logic simple: just store and retrieve an ID, not the entire game object.

**Trade-offs**: User loses the convenience of resuming the last game if they deleted it. Mitigation: improve the delete confirmation dialog to make users think twice before deletion.

---

## Q8: Landscape Orientation

**Decision**: **Support landscape orientation on all three feature screens** (Dice, Score, Lottery). Use React Native's `useWindowDimensions` hook to adapt layouts dynamically.

**Rationale**: Modern mobile apps support all orientations; users expect landscape to work. Tablets especially benefit (larger screens, common to be used landscape). Expo/React Native abstracts iOS and Android orientation differences. Responsive layouts (width-based conditional rendering) are simpler than fighting the OS. NFR-C3 ("works on phones and tablets") implicitly includes landscape.

**Trade-offs**: Requires testing on portrait and landscape; slightly more complex layout logic. Mitigation: use a responsive layout library (e.g., React Native's built-in `Dimensions` API) to reduce boilerplate. Some screens may feel cramped in portrait on small phones; acceptable trade-off.

---

## Q9: Accessibility Scoping

**Decision**: **WCAG AA applies equally to all three feature screens** (Dice, Score, Lottery). No feature is exempt.

**Rationale**: Spec explicitly requires WCAG AA compliance (NFR-A1); no ambiguity. All features are primary user-facing surfaces; inconsistent accessibility is poor UX. Board games benefit all users, including those with low vision, color blindness, or motor impairments (e.g., large touch targets). Implementing AA from the start is cheaper than retrofitting.

**Trade-offs**: Feature development must include accessibility testing from day one (screen reader testing, color contrast checks, touch target sizing). Adds QA effort but is non-negotiable per requirements.

---

## Q10: Tablet UI Differences

**Decision**: **Use responsive scaling of the phone UI for v1**. Apply conditional layouts only for very large screens (>600dp width); otherwise, use a single layout that scales. Defer tablet-optimized layouts (e.g., split-screen for Score list + current game) to v2.

**Rationale**: Single layout simplifies codebase and reduces testing matrix. Responsive scaling via `useWindowDimensions()` + conditional padding/font sizes handles phones (5"–6") and most tablets (7"–10") adequately. The majority of board game players use phones; tablets are secondary. Shipping faster with responsive scaling is better than delaying for tablet-perfect layouts.

**Trade-offs**: Tablets may have unused whitespace in landscape (e.g., wide margins on Score game screen) or cramped layouts in portrait. Mitigate by testing on tablet simulators and adjusting padding/font sizes. Full tablet optimization (e.g., side-by-side panels for Score and player list) defers to v2 based on user feedback.

---

**All 10 questions resolved. Architecture document is unblocked for implementation.**