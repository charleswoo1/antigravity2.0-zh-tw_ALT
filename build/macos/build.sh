#!/bin/bash
set -euo pipefail

ARCH="${1:-$(uname -m)}"
case "$ARCH" in
  x86_64|x64) ARCH="x64" ;;
  arm64) ;;
  *) echo "Unsupported architecture: $ARCH" >&2; exit 1 ;;
esac

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
VERSION="$(cd "$REPO_ROOT" && node -p "require('./package.json').version")"
if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$ ]]; then
  echo "Invalid ALT version in package.json: $VERSION" >&2
  exit 1
fi

PAYLOAD_DIR="$REPO_ROOT/.build/macos-$ARCH/payload"
APP_NAME="Antigravity-ZH-Hant-TW-ALT-$VERSION-macOS-$ARCH.app"
APP_DIR="$REPO_ROOT/.build/macos-$ARCH/$APP_NAME"
DIST_DIR="$REPO_ROOT/dist"

node "$REPO_ROOT/build/common/prepare-payload.js" \
  --platform macos \
  --arch "$ARCH" \
  --output "$PAYLOAD_DIR"

node "$REPO_ROOT/build/common/verify-payload.js" "$PAYLOAD_DIR" macos

rm -rf "$APP_DIR"
mkdir -p "$APP_DIR/Contents/MacOS" "$APP_DIR/Contents/Resources"
cp "$SCRIPT_DIR/app/launcher.sh" "$APP_DIR/Contents/MacOS/launcher"
chmod 755 "$APP_DIR/Contents/MacOS/launcher"
cp "$SCRIPT_DIR/app/Info.plist" "$APP_DIR/Contents/Info.plist"
sed -i '' "s/__ALT_ARCH__/$ARCH/g" "$APP_DIR/Contents/Info.plist"
sed -i '' "s/__ALT_VERSION__/$VERSION/g" "$APP_DIR/Contents/Info.plist"
cp -R "$PAYLOAD_DIR" "$APP_DIR/Contents/Resources/payload"

# Sign nested Mach-O runtime before signing the outer app bundle.
codesign --force --sign - --timestamp=none "$APP_DIR/Contents/Resources/payload/runtime/node"
codesign --force --sign - --timestamp=none "$APP_DIR"
codesign --verify --deep --strict "$APP_DIR"

mkdir -p "$DIST_DIR"
OUTPUT="$DIST_DIR/$APP_NAME.zip"
rm -f "$OUTPUT"
ditto -c -k --sequesterRsrc --keepParent "$APP_DIR" "$OUTPUT"

echo "Created $OUTPUT"
echo "PENDING_MANUAL_PLATFORM_VALIDATION: launch and test install/restore on a clean macOS $ARCH machine."
