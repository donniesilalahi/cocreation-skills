# Swift Patterns Reference

## MarketingCapture.swift Skeleton

Place this file at `<AppName>/Debug/MarketingCapture.swift`. Wrap entirely in `#if DEBUG`.

If the project uses **Xcode 16+ synchronized folder groups** (`PBXFileSystemSynchronizedRootGroup`), creating the file in the correct folder is sufficient — no `pbxproj` edits needed. Otherwise add it to the main app target manually in Xcode.

```swift
#if DEBUG
import SwiftUI
import UIKit

// MARK: - MarketingCapture

enum MarketingCapture {

    // MARK: Active check

    static var isActive: Bool {
        ProcessInfo.processInfo.arguments.contains("-MarketingCapture") &&
        value(for: "-MarketingCapture") == "1"
    }

    static func value(for key: String) -> String? {
        let args = ProcessInfo.processInfo.arguments
        guard let idx = args.firstIndex(of: key), idx + 1 < args.count else { return nil }
        return args[idx + 1]
    }

    // MARK: Scope

    enum Scope: String {
        case full
        case onboarding
        case session
        // Add scopes your app needs
    }

    static var activeScope: Scope {
        guard let raw = value(for: "-MarketingCaptureScope") else { return .full }
        return Scope(rawValue: raw) ?? .full
    }

    // MARK: Appearance

    static var requestedAppearance: ColorScheme? {
        switch value(for: "-MarketingAppearance") {
        case "light": return .light
        case "dark":  return .dark
        default:      return nil
        }
    }

    // MARK: Locale folder

    /// Uses language code only — avoids "en_US" vs "en" divergence from -AppleLocale.
    static var localeFolder: String {
        Locale.current.language.languageCode?.identifier ?? Locale.current.identifier
    }

    // MARK: Priming vars
    //
    // Add one static var per view state you need to prime.
    // The coordinator sets it before navigating; the target view reads it in .onAppear.
    // Reset in the step's cleanup closure.
    //
    // Examples:
    //   static var pendingElapsedSeconds: Int?
    //   static var pendingShowOverlay: Bool = false

    // MARK: Dismiss broadcast

    /// Broadcast to force-dismiss a presented sheet/cover whose item binding
    /// is @State inside an intermediate parent. See known-gotchas.md #4.
    static let dismissSheetNotification = Notification.Name("MarketingCapture.dismissSheet")

    // MARK: Output

    static var outputRoot: URL {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let appearance = value(for: "-MarketingAppearance") ?? "light"
        let root = docs
            .appendingPathComponent("marketing", isDirectory: true)
            .appendingPathComponent(localeFolder, isDirectory: true)
            .appendingPathComponent(appearance, isDirectory: true)
        try? FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
        return root
    }

    static func writePNG(_ image: UIImage, name: String, subfolder: String? = nil) {
        var dir = outputRoot
        if let subfolder {
            dir = dir.appendingPathComponent(subfolder, isDirectory: true)
            try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        }
        let url = dir.appendingPathComponent("\(name).png")
        guard let data = image.pngData() else { return }
        try? data.write(to: url, options: .atomic)
        print("[MarketingCapture] wrote \(url.lastPathComponent)")
    }

    static func writeSentinel() {
        let url = outputRoot.appendingPathComponent("_done")
        try? Data().write(to: url)
        print("[MarketingCapture] sentinel written at \(url.path)")
    }

    // MARK: Window snapshot

    @MainActor
    static func snapshotKeyWindow() -> UIImage? {
        guard let window = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .flatMap({ $0.windows })
            .first(where: { $0.isKeyWindow })
        else { return nil }

        let renderer = UIGraphicsImageRenderer(bounds: window.bounds)
        return renderer.image { _ in
            window.drawHierarchy(in: window.bounds, afterScreenUpdates: true)
        }
    }
}

// MARK: - Coordinator

struct CaptureStep {
    let name: String
    let navigate: @MainActor () -> Void
    let settle: Duration
    let cleanup: (@MainActor () -> Void)?

    init(
        name: String,
        settle: Duration = .milliseconds(1800),
        navigate: @escaping @MainActor () -> Void,
        cleanup: (@MainActor () -> Void)? = nil
    ) {
        self.name = name
        self.navigate = navigate
        self.settle = settle
        self.cleanup = cleanup
    }
}

@MainActor
final class MarketingCaptureCoordinator {
    static let shared = MarketingCaptureCoordinator()
    private init() {}

    var minimumSettle: Duration = .milliseconds(1800)

    func run(steps: [CaptureStep], then elements: () async -> Void = {}) async {
        for step in steps {
            step.navigate()
            try? await Task.sleep(for: max(step.settle, minimumSettle))

            guard let image = MarketingCapture.snapshotKeyWindow() else {
                print("[MarketingCapture] snapshot failed: \(step.name)")
                continue
            }
            MarketingCapture.writePNG(image, name: step.name)

            if let cleanup = step.cleanup {
                cleanup()
                try? await Task.sleep(for: .milliseconds(900))
            }
        }

        await elements()
        MarketingCapture.writeSentinel()
    }
}

// MARK: - Element Harness

enum MarketingElementHarness {

    static func slugify(_ s: String) -> String {
        s.lowercased()
            .replacingOccurrences(of: " ", with: "-")
            .filter { $0.isLetter || $0.isNumber || $0 == "-" }
    }

    @MainActor
    static func renderElement<V: View>(
        name: String,
        width: CGFloat,
        height: CGFloat? = nil,
        cornerRadius: CGFloat = 20,
        background: Color,
        @ViewBuilder content: () -> V
    ) {
        let view = content()
            .frame(width: width, height: height)
            .background(background)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))

        let renderer = ImageRenderer(content: view)
        renderer.scale = 3
        renderer.isOpaque = false
        renderer.proposedSize = .init(width: width, height: height)

        guard let image = renderer.uiImage else { return }
        MarketingCapture.writePNG(image, name: name, subfolder: "elements")
    }

    enum WidgetSize {
        static let small               = CGSize(width: 170, height: 170)
        static let medium              = CGSize(width: 364, height: 170)
        static let large               = CGSize(width: 364, height: 382)
        static let accessoryCircular   = CGSize(width: 76,  height: 76)
        static let accessoryRectangular = CGSize(width: 172, height: 76)
        static let accessoryInline     = CGSize(width: 257, height: 26)
    }

    @MainActor
    static func renderWidget<V: View>(
        name: String,
        size: CGSize,
        cornerRadius: CGFloat? = nil,
        background: Color,
        @ViewBuilder content: () -> V
    ) {
        let isAccessory = size.height <= 80
        let radius = cornerRadius ?? (isAccessory ? 8 : 22)
        let padding: CGFloat = isAccessory ? 0 : 16

        let view = content()
            .padding(padding)
            .frame(width: size.width, height: size.height)
            .background(background)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .environment(\.colorScheme, .light)

        let renderer = ImageRenderer(content: view)
        renderer.scale = 3
        renderer.isOpaque = false
        renderer.proposedSize = .init(width: size.width, height: size.height)

        guard let image = renderer.uiImage else { return }
        MarketingCapture.writePNG(image, name: name, subfolder: "elements")
    }
}
#endif
```

---

## Root View Integration Hook

Add to your root view's `.onAppear`, **after** existing VM setup calls:

```swift
.onAppear {
    // ... existing setup ...

    #if DEBUG
    if MarketingCapture.isActive {
        // 1. End stale Live Activities (skip if app doesn't use ActivityKit — gotcha #1)
        // ActivityManager.shared.endImmediately()

        // 2. Seed data only if empty (store persists across relaunches — gotcha #2)
        contentVM.fetch()
        if contentVM.items.isEmpty {
            DemoDataSeeder.seedIfEmpty(in: modelContext)
            contentVM.fetch()
        }

        // 3. Refresh VMs that setup() before the seed ran (gotcha #3)
        // otherVM.refresh()

        // 4. Suppress onboarding gate (if your app has one)
        // hasCompletedOnboarding = true

        // 5. Apply appearance from launch arg
        if let scheme = MarketingCapture.requestedAppearance {
            preferredColorScheme = scheme
        }

        Task {
            try? await Task.sleep(for: .milliseconds(500))  // let root view settle

            let steps: [CaptureStep]
            switch MarketingCapture.activeScope {
            case .onboarding:
                steps = onboardingSteps()
            case .session:
                steps = sessionSteps()
            case .full:
                steps = onboardingSteps() + mainSteps() + sessionSteps() + settingsSteps()
            }

            await MarketingCaptureCoordinator.shared.run(steps: steps) {
                // Element renders here
            }
        }
    }
    #endif
}
```

---

## Priming View State

Some screens need a specific non-default state — a timer mid-countdown, a form partially filled. Pattern:

1. Add a `static var` to `MarketingCapture` for each priming value:

```swift
// In MarketingCapture enum:
static var pendingElapsedSeconds: Int?
static var pendingShowOverlay: Bool = false
```

2. In the step, set it before navigating:

```swift
CaptureStep(name: "06-timer", settle: .milliseconds(2400)) {
    MarketingCapture.pendingElapsedSeconds = 75
    openTimerSheet(someItem)
} cleanup: {
    MarketingCapture.pendingElapsedSeconds = nil
    NotificationCenter.default.post(name: MarketingCapture.dismissSheetNotification, object: nil)
}
```

3. In the target view, read it in `.onAppear`:

```swift
.onAppear {
    #if DEBUG
    if MarketingCapture.isActive,
       let elapsed = MarketingCapture.pendingElapsedSeconds {
        timerVM.elapsedTime = TimeInterval(elapsed)
        timerVM.start()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { timerVM.pause() }
    }
    #endif
}
.onDisappear {
    #if DEBUG
    if MarketingCapture.isActive { timerVM.stop() }
    #endif
}
```

---

## Demo Data Seeder

Create at `<AppName>/Debug/DemoDataSeeder.swift` if no seeder exists.

Guidelines:
- Seed enough data that **every captured screen looks populated** — audit against your step list
- Use realistic content: real place names, plausible numbers, varied states
- **Idempotent** — check for existing data before inserting; the store persists across simulator relaunches
- Enough variety to fill different UI states; empty states should not appear unless they're a marketing screen

```swift
#if DEBUG
enum DemoDataSeeder {
    static func seedIfEmpty(in context: ModelContext) {
        let existing = (try? context.fetchCount(FetchDescriptor<Item>())) ?? 0
        guard existing == 0 else { return }

        let items: [Item] = [
            Item(name: "Morning Routine", status: .active,   count: 12),
            Item(name: "Deep Work",       status: .active,   count: 8),
            Item(name: "Evening Wind-down", status: .paused, count: 5),
            // ... enough to fill every screen with variety
        ]
        items.forEach { context.insert($0) }
        try? context.save()
        print("[DemoDataSeeder] seeded \(items.count) items")
    }
}
#endif
```

---

## Dismiss Listener (Presented Views)

Any view presented via `.fullScreenCover` or `.sheet` that the coordinator dismisses between steps must listen for the broadcast notification:

```swift
#if DEBUG
.onReceive(NotificationCenter.default.publisher(
    for: MarketingCapture.dismissSheetNotification
)) { _ in
    timerVM.stop()   // stop any ongoing work
    dismiss()
}
#endif
```

Allow at least 900ms in the cleanup step's settle time for the dismiss animation to complete before the next step begins.

---

## Onboarding & Paywall Capture

Onboarding flows need special handling:

- **Force overlay** for users who already completed onboarding: use a DEBUG-only `@AppStorage` gate bypass or a capture-mode flag.
- **Jump to specific page** without tapping through the whole flow: use a `NotificationCenter` bridge. The coordinator posts `"MarketingCapture.showOnboardingPage"` with the page slug; the onboarding view listens and jumps.
- **Free-user mask** for paywall/upgrade screens: keep real StoreKit entitlement intact for internal logic; add a DEBUG-only `effectivePro` property that returns `false` during capture steps so Pro-gated UI renders in the free-tier state. Reset after capture.
- **StoreKit products**: paywall screenshots may show "Loading plans…" in the simulator without a StoreKit Configuration file or sandbox sign-in. Document the limitation; optional: mock product rows under `#if DEBUG && MarketingCapture`.
