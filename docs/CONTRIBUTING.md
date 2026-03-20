# Contributing Guide

Thank you for contributing to Game Companion. This document explains the development workflow, code conventions, and pull request process.

---

## Development Workflow

We use a **feature branch** workflow:

```
main          — stable, always deployable
└── feature/  — new features and bug fixes (short-lived branches)
```

### Branch naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feature/<short-description>` | `feature/dice-animation` |
| Bug fix | `fix/<short-description>` | `fix/score-persistence-crash` |
| Documentation | `docs/<short-description>` | `docs/setup-guide` |
| Chore / tooling | `chore/<short-description>` | `chore/upgrade-expo-sdk` |

### Workflow steps

1. **Branch** off `main`:
   ```bash
   git checkout main && git pull
   git checkout -b feature/my-feature
   ```
2. **Implement** your changes following the conventions below.
3. **Verify** your code passes all checks (see [Checks](#checks)).
4. **Commit** using conventional commits (see [Commit Messages](#commit-messages)).
5. **Push** and open a Pull Request against `main`.
6. **Address** any review feedback, then await approval and merge.

---

## Checks

All of the following must pass before merging a PR:

```bash
npm run type-check        # TypeScript — zero errors
npm run lint              # ESLint — zero errors
npm run format:check      # Prettier — no formatting issues
npm test                  # Jest — all tests pass
```

Run them together:

```bash
npm run type-check && npm run lint && npm run format:check && npm test
```

---

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | A new feature visible to users |
| `fix` | A bug fix |
| `refactor` | Code change without feature or bug fix |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `chore` | Build process, tooling, dependencies |
| `style` | Formatting only (whitespace, lint fixes) |

**Examples:**

```
feat(dice): add haptic feedback on roll
fix(score): correct score decrement not persisting on Android
docs(setup): add Android emulator troubleshooting steps
chore: upgrade expo-haptics to 14.0.0
```

---

## Code Style

### TypeScript
- Use explicit types for all function parameters and return values.
- Avoid `any`; use `unknown` or generics where the type is genuinely unknown.
- Use `interface` for object shapes; `type` for unions and aliases.

### React / React Native
- One component per file.
- Components use `function` declarations (not arrow function assignments at the top level).
- Props interfaces are named `<ComponentName>Props`.
- Use `StyleSheet.create` for all styles — no inline style objects.
- Destructure props at the top of the function body.

### File structure
- New feature screens go in `src/screens/<feature>/`.
- New shared components go in `src/components/common/`.
- New feature-specific components go in `src/components/<feature>/`.
- Export new public symbols from the feature's `index.ts`.

### Accessibility
- Every interactive element must have an `accessibilityLabel`.
- Buttons must have `accessibilityRole="button"`.
- Minimum touch target: 48×48 dp — enforce via the `hitSlop` prop if the visual size is smaller.

---

## Pull Request Process

1. **Title** — use a conventional commit-style title: `feat(lottery): reset timer on touch change`
2. **Description** — explain *why* the change is needed, not just *what* it does. Link the related GitHub issue.
3. **Checklist** — confirm all checks pass (type-check, lint, format, tests).
4. **Screenshots / recordings** — for UI changes, attach a screen recording or before/after screenshots.
5. **Reviewers** — request review from at least one team member.

PRs must be approved by at least **one reviewer** before merging. Use **Squash and Merge** to keep `main` history clean.

---

## Testing Guidelines

- Write tests in `__tests__/` mirroring the `src/` structure.
- Unit tests for all service layer functions (`DiceRoller`, `LotteryEngine`, `AsyncStorageService`).
- Component tests for non-trivial rendering logic (use `@testing-library/react-native` patterns where applicable).
- Aim for **≥ 80% coverage** on `src/` (enforced in the release checklist).
- Mock `@react-native-async-storage/async-storage` in tests using the `jest-expo` preset defaults.

---

## Questions and Issues

Open a [GitHub Issue](https://github.com/<org>/game-companion/issues) for:
- Bug reports (include reproduction steps and device/OS details)
- Feature requests (include the use case / user story)
- Documentation improvements

For quick questions, use the team's communication channel.
