# Known Gotchas

All 14 of these are real bugs that bit real projects. Treat this list as load-bearing — read it before implementing.

---

### 1. Live Activities persist across app launches

ActivityKit Live Activities **outlive process termination**. If your app starts a Live Activity during capture (e.g. via a timer's `start()`), the next locale's relaunch will inherit it. Combined with a fresh seed that deletes the models the stale Live Activity references, you get SwiftData persisted-property assertions and crashes.

**Fix:** Call `ActivityManager.shared.endImmediately()` (or equivalent) at the very start of the marketing capture block, before touching data. Also call `timerVM.stop()` (or whatever properly ends the Live Activity) in the view's `onDisappear` when in capture mode.

---

### 2. Don't re-seed on every locale

Seeding SwiftData + CloudKit per locale causes sync churn and crashes. The SwiftData store persists across relaunches — demo data is locale-agnostic, so seed **once** on the first run:

```swift
contentVM.fetch()
if contentVM.items.isEmpty {
    DemoDataSeeder.seedIfEmpty(in: modelContext)
    contentVM.fetch()
}
```

If `DemoDataSeeder.seedIfEmpty` is idempotent (checks for existing data), calling it every run is safe, but still call `fetch()` before checking — the VM may hold a stale snapshot from before the store was populated.

---

### 3. ViewModels that `setup()` before the seed hold stale snapshots

If the root view's `.onAppear` calls `someVM.setup(modelContext:)` before the marketing seed runs, the VM holds a snapshot of the empty store. After seeding, call `someVM.refresh()` (or its equivalent fetch method) for every VM whose data you need to appear in screenshots.

---

### 4. Setting a trigger binding to `nil` does NOT dismiss a sheet

If a parent view presents `.fullScreenCover(item: $request)` and `request` is driven by an internal `@State`, setting the *trigger* binding (e.g. `pendingItem = nil`) from the coordinator does nothing — the cover stays up, and the next screenshot captures it instead of the intended screen.

**Fix:** Broadcast a dismiss signal via `NotificationCenter`, and have the presented view listen:

```swift
// In the presented view:
#if DEBUG
.onReceive(NotificationCenter.default.publisher(
    for: MarketingCapture.dismissSheetNotification
)) { _ in
    timerVM.stop()
    dismiss()
}
#endif
```

In the cleanup closure, allow at least **900ms** for the cover dismiss animation before the next step begins.

---

### 5. `NavigationPath` can't be popped from outside

If a child view holds `@State private var navigationPath = NavigationPath()` and a deep link pushes onto it, the coordinator can't reach in to pop it. **Reorder your capture sequence** so screens that push onto a stack come **after** screens that need a clean stack:

```
✓  List (clean) → Item Detail (pushes onto list's stack)
✗  Item Detail → List (stack still has detail pushed)
```

---

### 6. Widget views normally live in the extension target only

Widget views are in the widget extension target — they can't be referenced from `MarketingCapture.swift` in the main app target.

Options:
- **(a)** Add widget view files (and their entry types and helpers) to the main app target's membership. If the project uses synchronized folder groups, this means editing `PBXFileSystemSynchronizedBuildFileExceptionSet.membershipExceptions`. **CRITICAL:** `membershipExceptions` is an **inclusion** list, not an exclusion list. Files listed there ARE members of the target.
- **(b)** Skip widget rendering from the capture harness and do them manually.

Also exclude `<App>WidgetBundle.swift` from the main app target — it has `@main` and conflicts with the app's own `@main`.

---

### 7. `ImageRenderer` + `ProgressView(value:total:)` = prohibited symbol

Without an explicit style, a determinate `ProgressView` renders as a red circle-with-slash when composited through `ImageRenderer`.

**Fix:** `.progressViewStyle(.linear)` on the `ProgressView`. It's a no-op in normal rendering and fixes the render glitch.

---

### 8. `.containerBackground(for: .widget)` is a no-op outside widget context

When you render a widget view via `ImageRenderer` in the app, its `.containerBackground` does nothing — the widget's background is transparent. Wrap the render with an explicit background + rounded rect clip:

```swift
content()
    .padding(16)   // widget container normally provides this
    .frame(width: size.width, height: size.height)
    .background(theme.background)
    .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
```

Home-screen widget corner radius on iPhone: ~22pt. Lock-screen accessory: ~8pt.

---

### 9. iPhone 8 Plus is gone on iOS 26

Legacy 6.5\" App Store screenshot size (iPhone 8 Plus / iPhone 11 Pro Max) — the devices that produce this size aren't available in iOS 26+ simulators.

Options:
- **(a)** Install an older iOS runtime via Xcode → Settings → Platforms
- **(b)** Use a modern 6.1\" device (iPhone 17) for iOS 26 design language

---

### 10. Locale launch arguments require plist-array syntax

Pass `-AppleLanguages (xx) -AppleLocale xx` at every `simctl launch`. The parens around the language code are **mandatory** — it's a plist array literal. Without parens, the locale argument is silently ignored and the app runs in the device's default language.

Use `Locale.current.language.languageCode?.identifier` (not `Locale.current.identifier`) for folder naming — `.identifier` may include region suffixes like `en_US`.

---

### 11. SwiftUI animations in `ImageRenderer` are single-frame

`ImageRenderer` captures one frame — it doesn't wait for animations. If a component has `.onAppear` animation (chart drawing, number counting up), the render may capture the initial (empty) state.

**Fix:** Disable the animation in capture mode, or add an explicit delay before rendering:

```swift
try? await Task.sleep(for: .milliseconds(500))  // let onAppear animations finish
let renderer = ImageRenderer(content: view)
```

---

### 12. macOS: use `Contents/MacOS/App` directly — never `open --args`

Launching a macOS app with `open path/to/App.app --args -MarketingCapture 1` **does not reliably forward `ProcessInfo.arguments`** — the args may be silently dropped depending on the macOS version and whether the app is already running.

**Fix:** Execute the binary directly:

```bash
"$APP_PATH/Contents/MacOS/$SCHEME" \
    -MarketingCapture 1 \
    -MarketingCaptureScope "$CAPTURE_SCOPE" \
    ... &
```

This guarantees the launch arguments are present in `ProcessInfo.processInfo.arguments`.

---

### 13. Use `-newer $LAUNCH_REF` for sentinel detection, not a hardcoded path

A naive sentinel check polls a hardcoded path:

```bash
while [ ! -f "$SBOX/Documents/marketing/$L/_done" ]; do sleep 1; done
```

This is fragile — a `_done` file from a **previous run** that wasn't cleaned up will cause the script to exit immediately without waiting for the current run to finish.

**Fix:** Create a reference file just before launching, then check for `_done` files newer than it:

```bash
LAUNCH_REF=$(mktemp)
xcrun simctl launch "$DEVICE_ID" "$BUNDLE_ID" ...
# ...
SENTINEL=$(find "$SBOX/Documents/marketing" -name "_done" -newer "$LAUNCH_REF" 2>/dev/null | head -1)
rm -f "$LAUNCH_REF"
```

This is immune to stale sentinels from prior runs.

---

### 14. `0_marketing-capture_latest/` must be cleaned before each run

`0_marketing-capture_latest/` is a **copy**, not a symlink. If you capture `onboarding` scope (12 files) after a previous `full` scope run (40 files), the 28 extra files from the full run survive in `latest/` alongside the new 12 — making `latest/` a misleading mix of old and new.

**Fix:** Clean the locale+appearance subtree before copying:

```bash
LATEST_DEST="$LATEST_DIR/$L/$A"
rm -rf "$LATEST_DEST"           # wipe stale files
mkdir -p "$LATEST_DEST"
cp "$SENTINEL_DIR"/*.png "$LATEST_DEST/"
```

Do this inside the `for L in ...; for A in ...` loop so each combination is independently fresh.
