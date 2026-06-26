# Architecture Reference

## CaptureStep + Coordinator

The coordinator walks a list of `CaptureStep` values. Each step is self-contained: navigate → wait → snapshot → cleanup.

```swift
struct CaptureStep {
    let name: String                          // output filename, e.g. "01-home"
    let navigate: @MainActor () -> Void       // put the app in the right state
    let settle: Duration                      // wait for animations/data loads
    let cleanup: (@MainActor () -> Void)?     // tear down before next step
}
```

The coordinator loop:

```swift
for step in steps {
    step.navigate()
    let settle = max(step.settle, minimumSettle)  // floor prevents race conditions
    try? await Task.sleep(for: settle)

    guard let image = MarketingCapture.snapshotKeyWindow() else { continue }
    MarketingCapture.writePNG(image, name: step.name)

    if let cleanup = step.cleanup {
        cleanup()
        try? await Task.sleep(for: .milliseconds(900))  // cleanup animation budget
    }
}
```

After all steps: render elements, then call `MarketingCapture.writeSentinel()` — the shell script polls for this file.

---

## Building Steps for Different Navigation Patterns

### TabView (most common)

```swift
// Simple tab switch
CaptureStep(name: "01-home") { setTab(0) }

// Tab + presented sheet — clean up with dismiss broadcast (see SKILL.md gotcha #4)
CaptureStep(name: "05-detail", settle: .milliseconds(2000)) {
    setTab(2)
    pendingItem = items.first
} cleanup: {
    NotificationCenter.default.post(name: MarketingCapture.dismissSheetNotification, object: nil)
    pendingItem = nil
}
```

### NavigationStack + router

```swift
CaptureStep(name: "02-item-detail") {
    router.push(.itemDetail(items.first!))
} cleanup: {
    router.popToRoot()
}
```

### NavigationSplitView

```swift
CaptureStep(name: "03-detail") {
    sidebarSelection = .items
    detailSelection = items.first
} cleanup: {
    detailSelection = nil
}
```

### Stacking rule (critical)

Capture any screen that needs a clean navigation state **before** screens that push onto the same stack. `NavigationPath` held as `@State` in a child view can't be popped from outside the coordinator.

```
✓  List (clean) → Item Detail (pushes onto list's stack)
✗  Item Detail → List (stack still has detail pushed)
```

---

## Scope-Based Catalog

Group steps by scope for fast partial runs. The app reads `MARKETING_CAPTURE_SCOPE` (passed as `-MarketingCaptureScope <value>` launch argument) to select which catalog to run.

```swift
enum CaptureScope: String {
    case full
    case onboarding
    case session
    // Add scopes your app needs
}

static var activeScope: CaptureScope {
    let args = ProcessInfo.processInfo.arguments
    guard let idx = args.firstIndex(of: "-MarketingCaptureScope"),
          idx + 1 < args.count else { return .full }
    return CaptureScope(rawValue: args[idx + 1]) ?? .full
}
```

Build catalogs per scope, then select at runtime:

```swift
let steps: [CaptureStep]
switch MarketingCapture.activeScope {
case .onboarding:
    steps = onboardingSteps()
case .session:
    steps = sessionSteps()
case .full:
    steps = onboardingSteps() + mainSteps() + sessionSteps() + settingsSteps()
}
```

Unknown scope strings fall through to `.full` — safe to add new scopes without updating old scripts.

---

## macOS Window Modes

Mac apps that ship multiple window sizes (e.g. PiP-style compact/minimal alongside a full standard view) should capture each step in every mode.

Pattern: for each step, switch mode → wait → snapshot → move to next mode.

```swift
for mode in [DisplayMode.standard, .compact, .minimal] {
    DisplayModeState.setMode(mode)
    showWindow()                          // bring window to key + visible
    try? await Task.sleep(for: .milliseconds(800))

    guard let image = MarketingCapture.snapshotKeyWindow() else { continue }
    // Write to mode-specific subfolder: "standard/01-home.png" etc.
    MarketingCapture.writePNG(image, name: step.name, subfolder: mode.rawValue)
}
```

`DisplayModeState` and `showWindow()` are app-specific — adapt to whatever your app's window sizing system looks like. The snapshot must not assume a minimum window width (minimal mode is narrow); always snapshot the key window or the largest visible window by area.

---

## Timestamped Output + Latest Copy

The shell script creates a new folder per run and keeps a `0_marketing-capture_latest/` copy current.

```bash
TIMESTAMP="$(date +%d-%m-%Y)_marketing-capture_$(date +%H%M%S)"
OUT_DIR="$MARKETING_ROOT/$TIMESTAMP"
LATEST_DIR="$MARKETING_ROOT/0_marketing-capture_latest"
```

After each locale+appearance combination:

```bash
# Copy to timestamped (permanent record)
cp "$SENTINEL_DIR"/*.png "$OUT_DIR/$L/$A/"

# Overwrite latest (wipe first — stale files must not survive)
rm -rf "$LATEST_DIR/$L/$A"
mkdir -p "$LATEST_DIR/$L/$A"
cp "$SENTINEL_DIR"/*.png "$LATEST_DIR/$L/$A/"
```

`0_` prefix makes `latest/` sort first in Finder / file pickers. This is a copy, not a symlink — cleaning it before each locale/appearance prevents stale files from a prior run (different scope or screen count) surviving alongside new ones.

---

## Full Output Directory Layout

```
marketing/
├── DD-MM-YYYY_marketing-capture_HHMMSS/       timestamped (immutable after run)
│   ├── <locale>/
│   │   ├── light/      iOS PNGs
│   │   └── dark/
│   │       elements/   (optional — cards, widgets rendered via ImageRenderer)
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
└── 0_marketing-capture_latest/                always reflects most recent run
    ├── <locale>/light/   <locale>/dark/
    └── macos/<locale>/…
```

Add `marketing/` to `.gitignore`. These are outputs, not source.
