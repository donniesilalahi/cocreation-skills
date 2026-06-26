---
name: comarket
description: The "market" loop. Automates reproducible App Store / marketing screenshot capture for SwiftUI apps on iOS Simulator and macOS. Sets up an in-app capture system (MarketingCapture.swift + shell scripts) from scratch, or drives existing capture scripts to produce timestamped, organized PNGs seeded with demo data across locales, appearances, and display modes. Trigger on "run marketing capture", "capture screenshots", "set up marketing capture", "update App Store screenshots", "generate marketing assets", or any request to produce seeded, organized screenshots.
---

# Marketing Capture

The doer is **comarketer**. This is the **market** loop — the marketing/GTM step that runs after a feature ships, turning the shipped app into seeded App Store and promo assets.

## What It Does

Produces polished, seeded marketing screenshots (App Store assets, press kits, promotional material) for SwiftUI apps — reproducibly, across locales and appearances, without manual tapping.

Two modes:

1. **Set up** — add the capture system to a project that doesn't have one yet (Swift coordinator + shell scripts)
2. **Run** — drive existing capture scripts in a project that already has the system

The capture is in-app, not XCUITest. See [Why in-app](#why-in-app-not-xcuitest) below.

---

## Trigger Phrases

- "run marketing capture" / "run the capture script"
- "capture screenshots" / "capture marketing screenshots"
- "update App Store screenshots" / "regenerate marketing assets"
- "set up marketing capture" / "add marketing capture to this project"
- "re-capture [light/dark/onboarding/…]"

---

## Why In-App, Not XCUITest

**In-app wins for almost every real project:**

- No new test target. Adding a UI test target is fragile `pbxproj` surgery — many projects have zero test targets.
- Faster iteration. A UI test takes 30s+ to launch per run. In-app capture is just `xcodebuild build` once, then `simctl launch` per locale.
- No `xcodebuild test` overhead. The whole flow is build once → launch per locale.
- Access to real app state: ViewModels, SwiftData, `ImageRenderer`, `UIWindow.drawHierarchy`. XCUITest can only tap and read accessibility elements.
- Element renders (widgets, cards, charts via `ImageRenderer`) must run inside the app process — there's no XCUITest equivalent.

---

## Running Existing Scripts

If the project already has capture scripts, skip to running them directly.

### Env vars (all optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `MARKETING_CAPTURE_SCOPE` | `full` | Which screen group to capture: `full` \| any scope name defined in the app's catalog (e.g. `onboarding`, `session`) |
| `MARKETING_APPEARANCES` | `light dark` | Space-separated: `light` \| `dark` |
| `MARKETING_LOCALES` | `en` | Space-separated locale codes |
| `MARKETING_LOCALES_FILE` | — | Path to a file of locale codes (lines or commas; `#` comments); overrides `MARKETING_LOCALES` |
| `CAPTURE_TIMEOUT` | `1800` (iOS) / `3600` (macOS) | Seconds to wait for sentinel before failing |

### Common invocations

```bash
# Full run — all appearances, default locale
./scripts/capture-marketing-ios.sh
./scripts/capture-marketing-macos.sh

# Light mode only
MARKETING_APPEARANCES=light ./scripts/capture-marketing-ios.sh

# Onboarding scope, light, English only (fastest)
MARKETING_LOCALES=en MARKETING_APPEARANCES=light MARKETING_CAPTURE_SCOPE=onboarding \
  ./scripts/capture-marketing-ios.sh

# Multi-locale from file
MARKETING_LOCALES_FILE=scripts/locales.txt ./scripts/capture-marketing-ios.sh
```

Run scripts from the directory that contains the `.xcodeproj` file (not the repo root unless they're the same).

---

## Setting Up from Scratch

Work through these steps in order.

### Step 1: Gather requirements

Ask the user (one at a time — each answer can change later questions):

1. **Screens** — which screens to capture; get navigation path or tab name for each, not "the main flows"
2. **Scopes** — should steps be grouped into scopes (`full`, `onboarding`, `session`, etc.) for fast partial runs?
3. **Isolated elements** — any cards, widgets, or charts to render independently with transparent backgrounds?
4. **Locales** — all locales in `Localizable.xcstrings`, an explicit list, or just `en`?
5. **Simulator** — which device? ("iPhone 17" recommended for iOS 26)
6. **Appearances** — light only, dark only, or both?
7. **Seed data** — how is demo data populated today? Is it exhaustive enough that every listed screen looks populated?

### Step 2: Explore the codebase

Before writing any code, answer:

- Does the project use **synchronized folder groups** (Xcode 16+, `PBXFileSystemSynchronizedRootGroup`)? If yes, new files auto-include — no `pbxproj` edits needed. Check: `grep -c PBXFileSystemSynchronized *.xcodeproj/project.pbxproj`
- What is the **root navigation pattern**? (`TabView(selection:)`, `NavigationStack` + router, `NavigationSplitView`, custom coordinator)
- Where are **deep link** handlers? (`onOpenURL`, enum switch over route values)
- Where are **demo data seeders**? If none exist, you'll create one (see [`references/swift-patterns.md`](references/swift-patterns.md))
- Do widgets live in a **separate extension target**? (See gotcha #6 in [`references/known-gotchas.md`](references/known-gotchas.md))
- Does the app use **SwiftData + CloudKit sync**? (`cloudKitDatabase: .automatic`) — flag as known gotcha

### Step 3: Present design to user

Before writing code, summarize:

1. Architecture (in-app, single DEBUG-only file, scope-based catalog)
2. File list (exact paths to create or modify)
3. Screen-by-screen plan (how each screen is reached)
4. Scope groupings (which steps belong to which scope)
5. Element rendering plan (which components, how wrapped)
6. Output layout (folder structure, naming convention)
7. Relevant gotchas flagged from Step 2
8. Primed states needed

Get explicit approval before proceeding.

### Step 4: Implement

Key files:

| File | Purpose |
|------|---------|
| `<AppName>/Debug/MarketingCapture.swift` | Full capture system, `#if DEBUG` only |
| Root view (`ContentView.swift` or equivalent) | `#if DEBUG` hook: seed, run coordinator |
| Any view captured in non-default state | `#if DEBUG .onAppear` priming hook |
| `scripts/capture-marketing-ios.sh` | Build + install + per-locale-appearance loop |
| `scripts/capture-marketing-macos.sh` | Build for macOS + per-locale-appearance loop |
| `.gitignore` | Add `marketing/` |

See [`references/swift-patterns.md`](references/swift-patterns.md) for `MarketingCapture.swift` skeleton and [`references/shell-scripts.md`](references/shell-scripts.md) for script templates.

### Step 5: Verify iteratively

Do not hand the script to the user and wait. Run it yourself and verify at least one locale visually before declaring done. Read the output PNGs with the Read tool — check each screen shows the expected content. When you find an issue, fix it and rerun the whole script (not just the failing locale — fixes can regress earlier locales).

See [`references/known-gotchas.md`](references/known-gotchas.md) for the full list of bugs that bite real projects.

---

## Platform Differences

| | iOS | macOS |
|---|-----|-------|
| Build destination | `id=$DEVICE_ID` (simulator) | `platform=macOS` |
| Launch | `xcrun simctl launch` | Execute `App.app/Contents/MacOS/App` directly — **never** `open --args` (doesn't forward `ProcessInfo.arguments` reliably) |
| Sandbox path | `xcrun simctl get_app_container $UDID $BUNDLE_ID data` | `~/Library/Containers/<BUNDLE_ID>/Data` |
| Window modes | Single layout | `standard` / `compact` / `minimal` — capture each step three times |
| Quit between runs | `xcrun simctl terminate` | `osascript -e 'quit app "<AppName>"'` |

---

## Output Structure

```
marketing/
├── DD-MM-YYYY_marketing-capture_HHMMSS/   ← timestamped run (never overwritten)
│   ├── <locale>/
│   │   ├── light/                          iOS PNGs
│   │   └── dark/
│   └── macos/
│       └── <locale>/
│           ├── light/
│           │   ├── standard/
│           │   ├── compact/
│           │   └── minimal/
│           └── dark/
│               ├── standard/
│               ├── compact/
│               └── minimal/
└── 0_marketing-capture_latest/            ← copy of most recent run (always current)
    ├── <locale>/light/   <locale>/dark/
    └── macos/<locale>/light/…
```

`0_marketing-capture_latest/` is a **copy**, not a symlink — cleaned and repopulated on each run. Add `marketing/` to `.gitignore`.

---

## Self-eval gate (close the loop)

- **All locales/appearances captured and visually verified** → PASS forward: hand the assets to GTM / store listing, and record the run in `cochangelog`.
- **A screen rendered blank, mis-seeded, or off** → re-loop: fix seed/priming and rerun the *whole* script (fixes can regress earlier locales); bounded retries (default: cancel the run, not extend).
- **Missing screens, unclear scope, or store-copy decisions** → escalate to the human.
- **Captures expose a real UI defect** → cross-loop to `codebug`; **same element drifted across screens** → `coaudit`.

---

## Reference Docs

| Doc | Contents |
|-----|---------|
| [`references/architecture.md`](references/architecture.md) | `CaptureStep`, coordinator, scope catalog pattern, macOS window modes |
| [`references/swift-patterns.md`](references/swift-patterns.md) | `MarketingCapture.swift` skeleton, priming, demo data seeder, element rendering |
| [`references/shell-scripts.md`](references/shell-scripts.md) | Full env var table, iOS + macOS script templates |
| [`references/known-gotchas.md`](references/known-gotchas.md) | 14 real bugs — load-bearing, read before starting |
