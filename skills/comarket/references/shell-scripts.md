# Shell Scripts Reference

## Environment Variables

All variables are optional. Set on the command line before the script name.

| Variable | Default | Description |
|----------|---------|-------------|
| `MARKETING_CAPTURE_SCOPE` | `full` | Screen group to capture. Must match a scope name handled by the app's catalog (e.g. `full`, `onboarding`, `session`). Unknown values fall through to `full` in the recommended implementation. |
| `MARKETING_APPEARANCES` | `light dark` | Space-separated list of appearances to capture. Values: `light`, `dark`. |
| `MARKETING_LOCALES` | `en` | Space-separated locale codes, e.g. `en ja de fr`. |
| `MARKETING_LOCALES_FILE` | — | Path to a file containing locale codes (one per line, or comma-separated; lines starting with `#` are comments). Overrides `MARKETING_LOCALES` when set. |
| `CAPTURE_TIMEOUT` | `1800` (iOS) / `3600` (macOS) | Seconds to wait for the `_done` sentinel before the script exits with an error. macOS full runs can exceed 30 minutes — don't set this too low. |

---

## iOS Script Template

Save as `scripts/capture-marketing-ios.sh`. Make executable: `chmod +x scripts/capture-marketing-ios.sh`.

Run from the directory containing the `.xcodeproj` file.

```bash
#!/usr/bin/env bash
# Builds Debug for iOS Simulator, installs, relaunches per locale + appearance.
# Copies PNGs to marketing/DD-MM-YYYY_marketing-capture_HHMMSS/{locale}/{appearance}/
# Maintains marketing/0_marketing-capture_latest/ as canonical latest.
#
# Usage:
#   ./scripts/capture-marketing-ios.sh
#   MARKETING_APPEARANCES=light ./scripts/capture-marketing-ios.sh
#   MARKETING_CAPTURE_SCOPE=onboarding MARKETING_APPEARANCES=light ./scripts/capture-marketing-ios.sh
#   MARKETING_LOCALES=en MARKETING_APPEARANCES=light MARKETING_CAPTURE_SCOPE=onboarding \
#     ./scripts/capture-marketing-ios.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# ── Configuration ──────────────────────────────────────────────────────────────
BUNDLE_ID="com.example.App"           # your app's bundle identifier
SCHEME="AppScheme"                    # Xcode scheme name
PROJECT="App.xcodeproj"               # .xcodeproj filename (or use WORKSPACE below)
# WORKSPACE="App.xcworkspace"         # uncomment if using .xcworkspace
SIM_NAME="iPhone 17"                  # simulator device name
# ──────────────────────────────────────────────────────────────────────────────

LOCALES=(${MARKETING_LOCALES:-en})
if [[ -n "${MARKETING_LOCALES_FILE:-}" ]]; then
  LF="$MARKETING_LOCALES_FILE"
  [[ "$LF" = /* ]] || LF="$REPO_ROOT/$LF"
  if [[ ! -f "$LF" ]]; then
    echo "MARKETING_LOCALES_FILE not found: $LF" >&2; exit 1
  fi
  mapfile -t LOCALES < <(grep -v '^[[:space:]]*#' "$LF" | sed '/^[[:space:]]*$/d' || true)
  if [[ ${#LOCALES[@]} -eq 0 ]]; then
    echo "No locales parsed from $LF" >&2; exit 1
  fi
fi

APPEARANCES=(${MARKETING_APPEARANCES:-light dark})
CAPTURE_SCOPE="${MARKETING_CAPTURE_SCOPE:-full}"
TIMEOUT="${CAPTURE_TIMEOUT:-1800}"
DERIVED="build/marketing-dd"
APP_PATH="$DERIVED/Build/Products/Debug-iphonesimulator/${SCHEME}.app"
MARKETING_ROOT="marketing"

cd "$REPO_ROOT"

TIMESTAMP="$(date +%d-%m-%Y)_marketing-capture_$(date +%H%M%S)"
OUT_DIR="$MARKETING_ROOT/$TIMESTAMP"
LATEST_DIR="$MARKETING_ROOT/0_marketing-capture_latest"

echo "==> Building $SCHEME (Debug) for iOS Simulator"

DEVICE_ID=$(xcrun simctl list devices available -j 2>/dev/null \
    | python3 -c "
import json, sys
data = json.load(sys.stdin)
for runtime, devices in data['devices'].items():
    if 'iOS' not in runtime:
        continue
    for d in devices:
        if d['name'] == '$SIM_NAME':
            print(d['udid']); sys.exit()
" || true)

if [[ -z "${DEVICE_ID:-}" ]]; then
    echo "Simulator '$SIM_NAME' not found. Create it in Xcode or adjust SIM_NAME." >&2
    exit 1
fi

xcrun simctl boot "$DEVICE_ID" 2>/dev/null || true
open -a Simulator --args -CurrentDeviceUDID "$DEVICE_ID" || true

if [[ -n "${WORKSPACE:-}" ]]; then
    PROJECT_FLAG="-workspace $WORKSPACE"
else
    PROJECT_FLAG="-project $PROJECT"
fi

xcodebuild \
    $PROJECT_FLAG \
    -scheme "$SCHEME" \
    -configuration Debug \
    -destination "id=$DEVICE_ID" \
    -derivedDataPath "$DERIVED" \
    build \
    -quiet

if [[ ! -d "$APP_PATH" ]]; then
    echo "Build did not produce $APP_PATH" >&2; exit 1
fi

xcrun simctl install "$DEVICE_ID" "$APP_PATH"
mkdir -p "$OUT_DIR"
echo "==> Output folder: $TIMESTAMP"

for L in "${LOCALES[@]}"; do
    for A in "${APPEARANCES[@]}"; do
        echo "==> Capturing locale=$L appearance=$A scope=$CAPTURE_SCOPE"
        xcrun simctl terminate "$DEVICE_ID" "$BUNDLE_ID" 2>/dev/null || true
        sleep 0.5

        SBOX=$(xcrun simctl get_app_container "$DEVICE_ID" "$BUNDLE_ID" data)
        if [[ -z "$SBOX" || ! -d "$SBOX" ]]; then
            echo "Could not resolve app container for $BUNDLE_ID" >&2; exit 1
        fi

        # Clear old captures — sentinel check must be unambiguous
        rm -rf "$SBOX/Documents/marketing/"*_marketing-capture 2>/dev/null || true
        rm -f  "$SBOX/Documents/marketing/$L/$A/_done"         2>/dev/null || true

        # Reference file: detect sentinel files created AFTER this launch
        LAUNCH_REF=$(mktemp)

        xcrun simctl launch "$DEVICE_ID" "$BUNDLE_ID" \
            -MarketingCapture 1 \
            -MarketingCaptureScope "$CAPTURE_SCOPE" \
            -MarketingAppearance "$A" \
            -MarketingLocale "$L" \
            -AppleLanguages "($L)" \
            -AppleLocale "$L" > /dev/null

        WAITED=0; SENTINEL=""
        echo "    -> waiting for sentinel (timeout ${TIMEOUT}s)"
        while [[ -z "$SENTINEL" ]]; do
            sleep 1; WAITED=$((WAITED + 1))
            [[ "$((WAITED % 30))" -eq 0 ]] && \
                echo "    ... ${WAITED}s / ${TIMEOUT}s elapsed"
            if [[ "$WAITED" -gt "$TIMEOUT" ]]; then
                echo "Timeout waiting for sentinel" >&2
                rm -f "$LAUNCH_REF"; exit 1
            fi
            SENTINEL=$(find "$SBOX/Documents/marketing" -name "_done" \
                -newer "$LAUNCH_REF" 2>/dev/null | head -1)
        done

        rm -f "$LAUNCH_REF"
        SENTINEL_DIR=$(dirname "$SENTINEL")

        DEST="$OUT_DIR/$L/$A"
        mkdir -p "$DEST"
        cp "$SENTINEL_DIR"/*.png "$DEST/" 2>/dev/null || true

        LATEST_DEST="$LATEST_DIR/$L/$A"
        rm -rf "$LATEST_DEST"
        mkdir -p "$LATEST_DEST"
        cp "$SENTINEL_DIR"/*.png "$LATEST_DEST/" 2>/dev/null || true

        PNG_COUNT=$(find "$DEST" -name '*.png' 2>/dev/null | wc -l | tr -d ' ')
        echo "    -> wrote $PNG_COUNT PNGs to $DEST"
    done
done

xcrun simctl terminate "$DEVICE_ID" "$BUNDLE_ID" 2>/dev/null || true

echo ""
echo "==> Done. Timestamped output: $TIMESTAMP"
find "$OUT_DIR" -name '*.png' | sort
```

---

## macOS Script Template

Save as `scripts/capture-marketing-macos.sh`. Make executable: `chmod +x scripts/capture-marketing-macos.sh`.

Run from the directory containing the `.xcodeproj` file.

```bash
#!/usr/bin/env bash
# Builds Debug for macOS, launches the app binary directly.
# Copies PNGs to marketing/DD-MM-YYYY_marketing-capture_HHMMSS/macos/{locale}/{appearance}/{mode}/
# Maintains marketing/0_marketing-capture_latest/macos/ as canonical latest.
#
# Usage:
#   ./scripts/capture-marketing-macos.sh
#   MARKETING_APPEARANCES=light ./scripts/capture-marketing-macos.sh
#   MARKETING_CAPTURE_SCOPE=onboarding ./scripts/capture-marketing-macos.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# ── Configuration ──────────────────────────────────────────────────────────────
BUNDLE_ID="com.example.App"
SCHEME="AppScheme"
PROJECT="App.xcodeproj"
# WORKSPACE="App.xcworkspace"
# ──────────────────────────────────────────────────────────────────────────────

CAPTURE_SCOPE="${MARKETING_CAPTURE_SCOPE:-full}"
LOCALES=(${MARKETING_LOCALES:-en})
if [[ -n "${MARKETING_LOCALES_FILE:-}" ]]; then
  LF="$MARKETING_LOCALES_FILE"
  [[ "$LF" = /* ]] || LF="$REPO_ROOT/$LF"
  if [[ ! -f "$LF" ]]; then
    echo "MARKETING_LOCALES_FILE not found: $LF" >&2; exit 1
  fi
  mapfile -t LOCALES < <(grep -v '^[[:space:]]*#' "$LF" | sed '/^[[:space:]]*$/d' || true)
  if [[ ${#LOCALES[@]} -eq 0 ]]; then
    echo "No locales parsed from $LF" >&2; exit 1
  fi
fi

APPEARANCES=(${MARKETING_APPEARANCES:-light dark})
TIMEOUT="${CAPTURE_TIMEOUT:-3600}"
DERIVED="build/marketing-dd-mac"
CONTAINER="$HOME/Library/Containers/$BUNDLE_ID/Data"
CONTAINER_DOCS="$CONTAINER/Documents"
MARKETING_ROOT="marketing"

cd "$REPO_ROOT"
ROOT="$(pwd)"
APP_PATH="$ROOT/$DERIVED/Build/Products/Debug/${SCHEME}.app"
EXEC_PATH="$APP_PATH/Contents/MacOS/$SCHEME"   # direct exec — never use `open --args`

TIMESTAMP="$(date +%d-%m-%Y)_marketing-capture_$(date +%H%M%S)"
OUT_DIR="$ROOT/$MARKETING_ROOT/$TIMESTAMP"
LATEST_DIR="$ROOT/$MARKETING_ROOT/0_marketing-capture_latest"

echo "==> Building $SCHEME (Debug) for macOS"

if [[ -n "${WORKSPACE:-}" ]]; then
    PROJECT_FLAG="-workspace $WORKSPACE"
else
    PROJECT_FLAG="-project $PROJECT"
fi

xcodebuild \
    $PROJECT_FLAG \
    -scheme "$SCHEME" \
    -configuration Debug \
    -destination "platform=macOS" \
    -derivedDataPath "$DERIVED" \
    build \
    -quiet

if [[ ! -d "$APP_PATH" ]]; then
    echo "Build did not produce $APP_PATH" >&2; exit 1
fi

mkdir -p "$OUT_DIR"
echo "==> Output folder: $TIMESTAMP"

for L in "${LOCALES[@]}"; do
    for A in "${APPEARANCES[@]}"; do
        echo "==> Capturing macOS locale=$L appearance=$A scope=$CAPTURE_SCOPE"
        osascript -e "quit app \"$SCHEME\"" 2>/dev/null || true
        sleep 1

        LAUNCH_REF=$(mktemp)

        "$EXEC_PATH" \
            -MarketingCapture 1 \
            -MarketingCaptureScope "$CAPTURE_SCOPE" \
            -MarketingAppearance "$A" \
            -MarketingLocale "$L" \
            -AppleLanguages "($L)" \
            -AppleLocale "$L" &

        WAITED=0; SENTINEL=""
        while [[ -z "$SENTINEL" ]]; do
            sleep 1; WAITED=$((WAITED + 1))
            if [[ "$WAITED" -gt "$TIMEOUT" ]]; then
                echo "Timeout (locale=$L appearance=$A)" >&2
                rm -f "$LAUNCH_REF"; exit 1
            fi
            [[ "$((WAITED % 30))" -eq 0 ]] && \
                echo "    ... ${WAITED}s / ${TIMEOUT}s elapsed"
            SENTINEL=$(find "$CONTAINER_DOCS/marketing" -name "_done" \
                -newer "$LAUNCH_REF" -path "*/$L/$A/_done" 2>/dev/null | head -1)
        done

        rm -f "$LAUNCH_REF"
        SENTINEL_DIR=$(dirname "$SENTINEL")

        # macOS apps write window-mode subfolders (standard/compact/minimal)
        # If your app doesn't use window modes, the sentinel dir contains PNGs directly.
        if find "$SENTINEL_DIR" -mindepth 1 -maxdepth 1 -type d | grep -q .; then
            # Subfolder per mode
            for mode_dir in "$SENTINEL_DIR"/*/; do
                [[ -d "$mode_dir" ]] || continue
                mode=$(basename "$mode_dir")
                DEST="$OUT_DIR/macos/$L/$A/$mode"
                mkdir -p "$DEST"
                cp "$mode_dir"*.png "$DEST/" 2>/dev/null || true
                LATEST_DEST="$LATEST_DIR/macos/$L/$A/$mode"
                rm -rf "$LATEST_DEST"; mkdir -p "$LATEST_DEST"
                cp "$mode_dir"*.png "$LATEST_DEST/" 2>/dev/null || true
            done
        else
            # Flat PNGs
            DEST="$OUT_DIR/macos/$L/$A"
            mkdir -p "$DEST"
            cp "$SENTINEL_DIR"/*.png "$DEST/" 2>/dev/null || true
            LATEST_DEST="$LATEST_DIR/macos/$L/$A"
            rm -rf "$LATEST_DEST"; mkdir -p "$LATEST_DEST"
            cp "$SENTINEL_DIR"/*.png "$LATEST_DEST/" 2>/dev/null || true
        fi

        PNG_COUNT=$(find "$SENTINEL_DIR" -name '*.png' 2>/dev/null | wc -l | tr -d ' ')
        echo "    -> wrote $PNG_COUNT PNGs for macos/$L/$A"

        osascript -e "quit app \"$SCHEME\"" 2>/dev/null || true
        sleep 0.5
    done
done

echo ""
echo "==> Done. Timestamped output: $TIMESTAMP"
find "$OUT_DIR" -name '*.png' | sort
```

---

## Common Invocations

```bash
# Full run — all appearances, default locale (en)
./scripts/capture-marketing-ios.sh
./scripts/capture-marketing-macos.sh

# Light mode only (fastest for iteration)
MARKETING_APPEARANCES=light ./scripts/capture-marketing-ios.sh

# Onboarding scope, light, English only (fastest for onboarding work)
MARKETING_LOCALES=en MARKETING_APPEARANCES=light MARKETING_CAPTURE_SCOPE=onboarding \
  ./scripts/capture-marketing-ios.sh

# Multiple locales from env
MARKETING_LOCALES="en ja de fr" ./scripts/capture-marketing-ios.sh

# Multiple locales from file
MARKETING_LOCALES_FILE=scripts/locales.txt ./scripts/capture-marketing-ios.sh

# Custom timeout (large app, many screens)
CAPTURE_TIMEOUT=3600 ./scripts/capture-marketing-ios.sh

# macOS — onboarding light only
MARKETING_APPEARANCES=light MARKETING_CAPTURE_SCOPE=onboarding \
  ./scripts/capture-marketing-macos.sh
```

### locales.txt format

```
# App Store locales
en
ja
de
fr
# zh-Hans
```

---

## Verification Checklist

Before declaring the capture pipeline done:

- [ ] All locale+appearance combinations produced N PNGs (where N = screen count for the scope)
- [ ] File sizes **differ** between locales — if `en/settings.png` and `de/settings.png` are byte-identical, locale switching didn't take effect
- [ ] Read 2–3 screens visually for the primary locale — expected content, not a wrong step
- [ ] Read same screens for at least one other locale — localized strings visible
- [ ] No screenshot shows a screen from the **previous step** — the most common bug (undismissed sheet)
- [ ] `0_marketing-capture_latest/` reflects the current run (no stale files from a prior scope)
- [ ] macOS: each window-mode subfolder (`standard/compact/minimal`) is populated
